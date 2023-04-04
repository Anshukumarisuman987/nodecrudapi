require('dotenv').config();

const express = require("express");
const bodyParser = require('body-parser')
const db = require("./config/db.config.js");
const app = express();
const port = process.env.PORT || 3005;

//Helmet is a middleware package. It can set appropriate HTTP headers that help protect your app from well-known web vulnerabilities
// var helmet = require('helmet');
// var compression = require('compression');
const cors = require('cors');


//Json Middleware
// app.use(express.json());
// // app.use(express.urlencoded({ extended: true }))
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }))
// app.use('/image', express.static('image'))
// app.use(compression());
// app.use(helmet.frameguard({
//     action: "deny",
// }));
// app.use(
//     helmet.hsts({
//         maxAge: 86400,
//         includeSubDomains: false,
//     })
// );
// app.use(helmet.hidePoweredBy());
// app.use(helmet.ieNoOpen());
// app.use(helmet.noSniff());
// app.use(helmet.xssFilter());
// app.use(cors({
//     origin: '*'
// }));

// here we import the routes file.
const userRouter = require("./routes/userRoutes");

app.use("/api/v1/user", userRouter);


//PORT Listening
app.listen(port, () => {
    console.log(`Server is running on http://103.205.66.213:${port}`);
});