const router = require("express").Router();
const {
  login,
  signUp,
  emailVerification,
  verifyCode,
  getLoginData,
  forgotPassword,
  resetPassword,
} = require("../controllers/alumni");

const authenticateToken = require("../middlewares/isAuth");

const {
  validateLogin,
  validateSignUp,
  validateForgotPassword,
  validateResetPassword,
} = require("../../util/alumniInputValidation");

router.post("/login", validateLogin, login);
router.post("/signup", validateSignUp, signUp);
router.get("/emailVerification", authenticateToken, emailVerification);
router.post("/verifyCode", authenticateToken, verifyCode);
router.get("/getLoginData", authenticateToken, getLoginData);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

module.exports = router;