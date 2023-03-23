const AuthController = require('../controllers/AuthController.js');
const UserController = require('../controllers/UserController.js');

const {verifyToken, verifyTempToken} = require("../middleware/auth.js");
const {limiterAuth, twoFaLimiter, twoFaLimiterStrong} = require("../middleware/rate-limiter.js")


module.exports = (app) => {
  app.post('/register', limiterAuth, AuthController.register);
  app.post('/login', limiterAuth, AuthController.login);
  app.post('/logout', verifyToken, AuthController.logout);

  app.post('/login/2fa', twoFaLimiter, verifyTempToken, AuthController.loginWith2FA);
  app.post('/init2fa', twoFaLimiterStrong, verifyTempToken, AuthController.init2FA);

  app.get('/getinfo', verifyToken, UserController.getInfo);
}