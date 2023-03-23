const rateLimiter = require("express-rate-limit");

const limiterAuth = rateLimiter({
    max: 100,
    windowMS: 5000, // 10 seconds
    message: "You can't make any more requests at the moment. Try again later ...",
});


const twoFaLimiter = rateLimiter({
    max: 100,
    windowMS: 5000, // 10 seconds
    message: "You can't make any more requests at the moment. Try again later ...",
});


const twoFaLimiterStrong = rateLimiter({
    max: 70,
    windowMS: 10000, // 10 seconds
    message: "You can't make any more requests at the moment. Try again later ...",
});



module.exports = {limiterAuth, twoFaLimiter, twoFaLimiterStrong};