const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth')
const userControllers = require("../controllers/userControllers.js");
const upload = require('../middleware/uploadImage')



//User Routes
router.get('/getalluser', auth, userControllers.getAllUser);
router.post('/loginuser', userControllers.loginUser)
router.post('/userregister', userControllers.userRegister)
router.post("/updateuser/:id", auth, upload.single('file'), userControllers.updateUser);
router.get('/getuserprofile/:id', auth, userControllers.getUserProfile);

//Address routes
router.post('/addaddress/:id', auth, userControllers.addUserAddress)
router.post('/getuseraddress/:id', auth, userControllers.getUserAllAddress)
router.delete('/deleteaddress/:id', auth, userControllers.deleteUserAddress)
router.put('/updateaddress/:id', auth, userControllers.updateUserAddress)

//Password routes
router.put('/changeuserpassword/:id', auth, userControllers.changeUserPassword)
router.put('/forgotpassword', userControllers.forgotPassword)

//Pincode
router.post('/pincodeavailability/:id', auth, userControllers.pincodeAvailability)

//OTP
router.post('/generateotp', userControllers.generateOtp)
router.post('/verifyotp', userControllers.verifyOtp)

//User Status
router.get('/checkstatus/:id', auth, userControllers.checkStatus);


module.exports = router;
