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
  getPersonalInfo,
  updatePersonalInfo,
  uploadProfileImg,
  sendProfileImg,
  uploadScholarshipImg,
} = require("../controllers/alumni");

const authenticateToken = require("../middlewares/isAuth");
const upload = require("../../util/multer");

const {
  validateLogin,
  validateSignUp,
  validateForgotPassword,
  validateResetPassword,
  validatePersonalInfo,
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
router.post(
  "/upload-scholarshipImg",
  authenticateToken,
  upload("images/scholarshipImg", [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ]).single("scholarshipImg"),
  uploadScholarshipImg
);

router.get("/personal-info", authenticateToken, getPersonalInfo);
router.post(
  "/personal-info",
  authenticateToken,
  validatePersonalInfo,
  updatePersonalInfo
);
router.post(
  "/upload-profileImg",
  authenticateToken,
  upload("images/alumniProfileImg", [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ]).single("profileImg"),
  uploadProfileImg
);
router.get("/profileImg", authenticateToken, sendProfileImg);
module.exports = router;
