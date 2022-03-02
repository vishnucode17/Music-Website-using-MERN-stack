const express = require('express');
const app=express();

var test_middleware = (req, res, next) => {
    console.log("This message is from middleware");
    next();
}
module.exports = test_middleware;