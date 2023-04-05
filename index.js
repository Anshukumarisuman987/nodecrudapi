require('dotenv').config();

const express = require("express");
const bodyParser = require('body-parser')
const db = require("./config/db.config.js");
const app = express();
const port = process.env.PORT || 3005;

const cors = require('cors');

var excel_compare = require("excel-compare");
//Json Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



// here we import the routes file.
const userRouter = require("./routes/userRoutes");

app.use("/api/v1/user", userRouter);


excel_compare({
    file1: 'data/abc.xlsx', // file1 is the main excel to compare with
    file2: 'data/anshu.xlsx', // file2 is the file for compare
    column_file1: {
        column: [1],
        join: ''
    },
    column_file2: {
        column: [1, 2],
        join: '-'
    }
})

//PORT Listening
app.listen(port, () => {
    console.log(`Server is running on http://103.205.66.213:${port}`);
});