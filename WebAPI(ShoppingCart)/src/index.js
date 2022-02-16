
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");
const Router = require("./routes");
const httpStatus = require('http-status');
const APIError = require("./helper/APIError")
const app = express();
dotenv.config();
app.use("/public",express.static(path.join(__dirname,"../public")));
// parse application/json
app.use(bodyParser.json())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
//Turn on CORS
app.use(cors());
//Connect dtb
require('./config/dtb');

app.get("/",(req,res)=>{
    res.send("Welcome to shopping cart")
})

app.use("/api", Router)


// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new APIError('API not found', httpStatus.NOT_FOUND);
    return next(err);
});

// error handler, send stacktrace only during development
app.use((err, req, res, next) =>{
    console.log(err.message)
    res.status(err.status).json({
        status:"error",
        message: err.isPublic ? err.message : httpStatus[err.status],
        //stack: process.env.NODE_ENV === 'development' ? err.stack : {}
    })
});


const port = process.env.PORT || 8080;
app.listen(8080, () => {
    console.log("Backend server is running on http://localhost:"+port);
});