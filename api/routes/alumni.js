const router = require("express").Router();
const {
  login,
  signUp,
  emailVerification,
  verifyCode,
} = require("../controllers/alumni");

const authenticateToken = require("../middlewares/isAuth");

const {
  validateLogin,
  validateSignUp,
} = require("../../util/alumniInputValidation");

router.post("/login", validateLogin, login);
router.post("/signup", validateSignUp, signUp);
router.get("/emailVerification", authenticateToken, emailVerification);
router.post("/verifyCode", authenticateToken, verifyCode);

module.exports = router;
