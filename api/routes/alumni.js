const router = require("express").Router();
const {
    login,
    signUp,
    emailVerification,
    verifyCode,
    forgotPassword,
    resetPassword,
    getLoginData,
    updatePersonalInfo,
} = require("../controllers/alumni");

const authenticateToken = require("../middlewares/isAuth");

const {
    validateLogin,
    validateSignUp,
    validateForgotPassword,
    validateResetPassword,
    validatePersonalInfo,
} = require("../../util/alumniInputValidation");

router.post("/login", validateLogin, login);
router.post("/signup", validateSignUp, signUp);
router.get("/emailVerification", authenticateToken, emailVerification);
router.post("/verifyCode", authenticateToken, verifyCode);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);
router.get("/getLoginData", authenticateToken, getLoginData);

//personal Info
router.post(
    "/personal-info",
    authenticateToken,
    validatePersonalInfo,
    updatePersonalInfo
);

module.exports = router;

