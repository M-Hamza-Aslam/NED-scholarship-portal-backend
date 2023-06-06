const router = require("express").Router();
const {
  login,
  signUp,
  emailVerification,
  verifyCode,
  getLoginData,
  forgotPassword,
  resetPassword,
  getCreatedScholarships,
  appliedUsersList,
  getUserData,
  sendUserProfileImg,
  sendDocument,
  createMeritScholarship,
  createNeedScholarship,
} = require("../controllers/alumni");

const authenticateToken = require("../middlewares/isAuth");

const {
  validateLogin,
  validateSignUp,
  validateForgotPassword,
  validateResetPassword,
} = require("../../util/alumniInputValidation");
const {
  validateMeritScholarship,
  validateNeedScholarship,
} = require("../../util/adminInputValidation");

router.post("/login", validateLogin, login);
router.post("/signup", validateSignUp, signUp);
router.get("/emailVerification", authenticateToken, emailVerification);
router.post("/verifyCode", authenticateToken, verifyCode);
router.get("/getLoginData", authenticateToken, getLoginData);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

router.get("/created-scholarships", authenticateToken, getCreatedScholarships);
router.get("/appliedUsersList", authenticateToken, appliedUsersList);
router.get("/user-data", authenticateToken, getUserData);
router.get("/userProfileImg", authenticateToken, sendUserProfileImg);
router.get("/document", authenticateToken, sendDocument);
router.post(
  "/create-merit-scholarship",
  authenticateToken,
  validateMeritScholarship,
  createMeritScholarship
);
router.post(
  "/create-need-scholarship",
  authenticateToken,
  validateNeedScholarship,
  createNeedScholarship
);
module.exports = router;
