const database = require("../config/db.config.js");

var sql = require("mssql");
const axios = require('axios')
const { otpSchema, pincodeSchema, verifyotpSchema } = require('../helpers/validation')


//Get All User
const getAllUser = async (req, res) => {
    try {
        var db = await database;
        var request = new sql.Request(db);
        const data = await request.query("select * from TBL_M_USER").then((data) => {
            res.status(200).json({
                status: "success",
                message: "All User found",
                message: data.recordsets[0]
            });
        }).catch((err) => {
            res.status(401).json({
                status: "False",
                message: err.message
            });
        });
    } catch (error) {
        res.status(500).json({
            status: "False",
            message: error.message
        });
    }
}


//Register Individual and Company
const userRegister = async (req, res) => {
    try {
        var db = await database;
        var request = new sql.Request(db);
        if (req.body.PASSWORD_HASH !== req.body.CONFORM_PASSWORD) {
            res.status(400).json({
                status: "failed",
                message: "Password and conform password not matched"
            });
        }
        else {
            const checkCellNo = await request.query(`select *from TBL_M_USER where MOBILE_NO LIKE ${req.body.MOBILE_NO}`);
            if (checkCellNo.recordset.length === 0) {
                var salt = await bcrypt.genSalt(10);
                var hashpass = await bcrypt.hash(req.body.PASSWORD_HASH, salt);
                var result = await db.request()
                    .input("ROLE_ID", req.body.ROLE_ID)
                    .input("FULL_NAME", req.body.FULL_NAME)
                    .input("MOBILE_NO", req.body.MOBILE_NO)
                    .input("EMAIL", req.body.EMAIL)
                    .input("PASSWORD_HASH", hashpass)
                    .input("COMPANY_NAME", req.body.COMPANY_NAME)
                    .input("COMPANY_ADDRESS", req.body.COMPANY_ADDRESS)
                    .input("COMPANY_GST", req.body.COMPANY_GST)
                    .input("CREATED_BY", req.body.CREATED_BY)
                    .input("CREATED_DATE", req.body.CREATED_DATE)
                    .input("MODIFIED_BY", req.body.MODIFIED_BY)
                    .input("MODOFIED_DATE", req.body.MODOFIED_DATE)
                    .execute("USP_ADD_USER")
                if (result.recordset.length !== 0) {
                    const token = jwt.sign({ userID: result.recordset[0].ID }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.EXPIRY_DAYS })
                    const data = result.recordset
                    data[0]["token"] = token
                    res.status(201).json({
                        status: "success",
                        message: "User created successfully",
                        data: data[0]
                    });
                } else {
                    res.status(401).json({
                        status: "failed",
                        message: "Not registered"
                    });
                }
            } else {
                res.status(401).json({
                    status: "failed",
                    message: "Mobile number already existed ..."
                });
            }
        }
    } catch (error) {
        res.status(501).json({
            status: "failed",
            message: error.message
        });
    }
}



//Adding user address
const addUserAddress = async (req, res) => {
    try {
        var db = await database;
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"]
        if (loggedUserID == req.params.id) {
            const { FULL_NAME, ADDRESS, ADDRESS_CONTACT, ADDRESS_PINCODE } = req.body
            if (FULL_NAME && ADDRESS && ADDRESS_CONTACT && ADDRESS_PINCODE) {
                var result = await db.request()
                    .input("USER_ID", req.params.id)
                    .input("ADDRESS_TITLE", req.body.ADDRESS_TITLE)
                    .input("FULL_NAME", req.body.FULL_NAME)
                    .input("ADDRESS", req.body.ADDRESS)
                    .input("ADDRESS_CONTACT", req.body.ADDRESS_CONTACT)
                    .input("ADDRESS_PINCODE", req.body.ADDRESS_PINCODE)
                    .input("GST_NO", req.body.GST_NO)
                    .input("ADDRESS_TAG", req.body.ADDRESS_TAG)
                    .input("IS_DEFAULT_ADDRESS", req.body.IS_DEFAULT_ADDRESS)
                    .input("IS_BILLING_ADDRESS", req.body.IS_BILLING_ADDRESS)
                    .input("IS_ACTIVE", req.body.IS_ACTIVE)
                    .input("CREATED_BY", req.body.CREATED_BY)
                    .input("CREATED_DATE", req.body.CREATED_DATE)
                    .input("MODIFIED_BY", req.body.MODIFIED_BY)
                    .input("MODIFIED_DATE", req.body.MODIFIED_DATE)
                    .execute("USP_ADD_ADDRESS")
                if (result) {
                    res.status(201).json({
                        status: "success",
                        message: "Address added successfully",
                        data: result.recordset
                    });
                } else {
                    res.status(401).json({
                        status: "failed",
                        message: "Something went wrong"
                    });
                }
            } else {
                res.status(400).json({
                    status: "Failed",
                    message: "Fill mendatory fields"
                })
            }
        } else {
            res.status(400).json({
                status: "Failed",
                message: "Not a authorized user"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "Failed",
            message: error.message
        })
    }
}

//Get all address by user
const getUserAllAddress = async (req, res) => {
    try {
        var db = database;
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"];
        if (loggedUserID == req.params.id || req.params.id == 0) {
            var result = await db.request()
                .input("USER_ID", req.params.id)
                .input("PageNumber", req.body.PageNumber)
                .input("RowsOfPage", req.body.RowsOfPage)
                .output("AddressFound")
                .execute("USP_GET_ALL_ADDRESS_OR_BY_USERID")
            if (result.recordset.length !== 0) {
                res.json({
                    status: "success",
                    message: "Address Found",
                    data: result.recordset
                });
            } else if (result.output.AddressFound == '1') {
                res.json({
                    status: "success",
                    message: "Address Found",
                    data: []
                });
            }
            else {
                res.json({
                    status: "Failed",
                    message: "No User Address found"
                });
            }
        } else {
            res.json({
                status: "Failed",
                message: "Not a authorized user"
            });
        }
    } catch (error) {
        res.json({
            status: "Failed",
            message: error.message
        });
    }
}

// DeleteUserAddress
const deleteUserAddress = async (req, res) => {
    try {
        var db = await database;
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"]
        if (loggedUserID == req.params.id) {

            const { ADDRESS_ID } = req.body
            if (!ADDRESS_ID) {
                res.status(201).json({
                    status: "failed",
                    message: "Address id not found"
                })
            } else {
                await db.request()
                    .input("USER_ID", req.params.id)
                    .input("ADDRESS_ID", ADDRESS_ID)
                    .execute("USP_DELETE_ADDRESS_BY_USERID")
                res.status(201).json({
                    status: "success",
                    message: "Address Deleted Successfully"
                })
            }
        } else {
            res.status(400).json({
                status: "failed",
                message: "Unauthorized User"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }

}

//Update User Address
const updateUserAddress = async (req, res) => {
    try {
        var db = await database;
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"]
        if (loggedUserID == req.params.id) {
            await db.request()
                .input("Id", req.body.ID)
                .input("ADDRESS_TITLE", req.body.ADDRESS_TITLE)
                .input("FULL_NAME", req.body.FULL_NAME)
                .input("ADDRESS", req.body.ADDRESS)
                .input("ADDRESS_CONTACT", req.body.ADDRESS_CONTACT)
                .input("ADDRESS_PINCODE", req.body.ADDRESS_PINCODE)
                .input("GST_NO", req.body.GST_NO)
                .input("ADDRESS_TAG", req.body.ADDRESS_TAG)
                .input("IS_DEFAULT_ADDRESS", req.body.IS_DEFAULT_ADDRESS)
                .input("IS_BILLING_ADDRESS", req.body.IS_BILLING_ADDRESS)
                .input("IS_ACTIVE", req.body.IS_ACTIVE)
                .input("MODIFIED_BY", req.body.MODIFIED_BY)
                .input("MODIFIED_DATE", req.body.MODIFIED_DATE)
                .execute("USP_UPDATE_ADDRESS")
            res.status(201).json({
                status: "success",
                message: "Address Updated Successfully"
            })
        } else {
            res.status(400).json({
                status: "failed",
                message: "Unauthorized User"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }
}


//User password change
const changeUserPassword = async (req, res) => {
    try {
        var db = await database
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"]
        if (loggedUserID == req.params.id) {
            const { NEW_PASSWORD, OLD_PASSWORD } = req.body
            if (NEW_PASSWORD === OLD_PASSWORD) {
                res.status(400).json({
                    status: "failed",
                    message: "New password and old password should be different"
                })
            } else {
                const user = await request.query(`select * from TBL_M_USER where ID = ${req.params.id}`)
                var hashedPassword = user.recordset[0]["PASSWORD_HASH"]
                var validPassword = await bcrypt.compare(OLD_PASSWORD, hashedPassword);
                if (validPassword) {
                    var salt = await bcrypt.genSalt(10);
                    var HASH = await bcrypt.hash(NEW_PASSWORD, salt)
                    var result = await db.request()
                        .input("USER_ID", req.params.id)
                        .input("NEW_PASSWORD", HASH)
                        .execute("USP_CHANGE_USER_PASSWORD")
                    res.status(200).json({
                        status: "success",
                        message: "Password Changed Successfully"
                    })
                } else {
                    res.status(400).json({
                        status: "failed",
                        message: "Wrong Old Password"
                    })
                }
            }
        } else {
            res.status(400).json({
                status: "failed",
                message: "Unauthorized user"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }
}


const forgotPassword = async (req, res) => {
    try {
        var db = await database
        var request = new sql.Request(db);
        const { NEW_PASSWORD, mobile_no } = req.body
        const user = await request.query(`select * from TBL_M_USER where MOBILE_NO = '${mobile_no}'`)
        if (user.recordset.length !== 0) {
            var salt = await bcrypt.genSalt(10);
            var password = await bcrypt.hash(NEW_PASSWORD, salt)
            var result = await db.request()
                .input("USER_ID", user.recordset[0]["ID"])
                .input("NEW_PASSWORD", password)
                .execute("USP_CHANGE_USER_PASSWORD")
            res.status(200).json({
                status: "success",
                message: "Password Changed Successfully"
            })
        } else {
            res.status(400).json({
                status: "failed",
                message: "user not registered"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }
}


//Update user
const updateUser = async (req, res) => {
    try {
        var db = database;
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"]
        if (loggedUserID == req.params.id) {
            let FULL_NAME = null
            let EMAIL = null
            let imageurl = null
            if (req.body.FULL_NAME || req.body.EMAIL) {
                FULL_NAME = req.body.FULL_NAME
                EMAIL = req.body.EMAIL
            }
            if (req.file) {
                imageurl = `103.205.66.213:3000/image/${req.file.filename}`
            }
            var result = await db.request()
                .input("ID", req.params.id)
                .input("FULL_NAME", FULL_NAME)
                .input("EMAIL", EMAIL)
                .input("IMAGE_PATH", imageurl)
                .input("MODIFIED_BY", req.body.MODIFIED_BY)
                .input("MODOFIED_DATE", req.body.MODOFIED_DATE)
                .execute("USP_UPDATE_USER")
            if (result) {
                res.json({
                    status: "success",
                    message: "User updated Successfully",
                    data: result.recordset[0]
                });
            } else {
                res.json({
                    status: "failed",
                    message: "User not updated"
                });
            }
        } else {
            res.json({
                status: "failed",
                message: "Unauthorized user"
            });
        }
    } catch (error) {
        res.json({
            status: "failed",
            message: error.message
        });
    }
}


//Generate OTP
const generateOtp = async (req, res) => {
    try {
        var db = database;
        var request = new sql.Request(db);
        const validatedata = await otpSchema.validate(req.body)
        if (validatedata.error) {
            res.status(400).json({
                status: "failed",
                message: validatedata.error.message
            })
        } else {
            var result = await db.request()
                .input("MOBILE_NO", req.body.MOBILE_NO)
                .output("OTP_GENERATED")
                .execute("USP_GENERATE_OTP")
            const OTP = result.output.OTP_GENERATED
            const otpurl = await axios.get(`http://sms.osdigital.in/V2/http-api.php?apikey=uw3USRjocagBmVis&senderid=PLECOM&number=${validatedata.value.MOBILE_NO}&message=OTP is ${OTP} for setrans. PECS&format=json`)
            if (otpurl) {
                res.status(200).json({
                    status: "success",
                    message: "OTP send Successfully",
                    data: OTP
                })
            } else {
                res.status(400).json({
                    status: "failed",
                    message: "Unable to send otp"
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }
}


//Verify OTP
const verifyOtp = async (req, res) => {
    try {
        var db = database;
        var request = new sql.Request(db);
        const validatedata = await verifyotpSchema.validate(req.body)
        if (validatedata.error) {
            res.status(400).json({
                status: "failed",
                message: validatedata.error.message
            })
        } else {
            var result = await db.request()
                .input("OTP_VALUE", validatedata.value.OTP_VALUE)
                .input("MOBILE_NO", validatedata.value.MOBILE_NO)
                .output("RESPONSE")
                .execute("USP_VERIFY_OTP")
            console.log(result)
            if (!result.output.RESPONSE) {
                res.status(200).json({
                    status: "success",
                    message: "OTP Verified"
                })
            } else {
                res.status(400).json({
                    status: "failed",
                    message: result.output.RESPONSE
                })
            }
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }
}


//Pin Code Availability Check
const pincodeAvailability = async (req, res) => {
    try {
        var db = database;
        var request = new sql.Request(db);
        const loggedUserID = req.user.recordset[0]["ID"]
        if (loggedUserID == req.params.id) {
            const validatedata = await pincodeSchema.validate(req.body)
            if (!validatedata.error) {
                var result = await db.request()
                    .input("PINCODE", req.body.PINCODE)
                    .execute("USP_GET_ALL_PINCODE")
                if (result.recordset.length !== 0) {
                    if (result.recordset[0].IS_DELIVERY == true) {
                        res.status(201).json({
                            status: "success",
                            message: "Pincode Available",
                            data: result.recordset[0]
                        });
                    } else {
                        res.status(201).json({
                            status: "success",
                            message: "Contact US",
                            data: result.recordset[0]
                        });
                    }
                } else {
                    res.status(401).json({
                        status: "failed",
                        message: "Sorry not available"
                    });
                }
            } else {
                res.status(400).json({
                    status: "Failed",
                    message: validatedata.error.message
                })
            }
        } else {
            res.status(400).json({
                status: "Failed",
                message: "Not a authorized user"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: "failed",
            message: error.message
        })
    }
}

//Check User Online and Offline status
const checkStatus = async (req, res) => {
    try {
        var db = await database;
        var request = new sql.Request(db);
        var result = await db.request()
            .input("USER_ID", req.params.id)
            .execute("USP_GET_USER_ONLINE_OFFLINE_STATUS")
        if (result.recordset.length !== 0) {
            res.json({
                status: "success",
                message: "User is online",
                data: result.recordset[0]
            });
        } else {
            res.json({
                status: "Failed",
                message: "Data not found"
            });
        }
    } catch (error) {
        res.status(401).json({
            status: "Failed",
            message: error.message
        })
    }
}


module.exports = {
    getAllUser,
    loginUser,
    userRegister,
    updateUser,
    getUserProfile,
    addUserAddress,
    getUserAllAddress,
    deleteUserAddress,
    updateUserAddress,
    changeUserPassword,
    forgotPassword,
    generateOtp,
    verifyOtp,
    pincodeAvailability,
    checkStatus
};