const router = require("express").Router();
const {
  getContactFormData,
  login,
  signUp,
  emailVerification,
  verifyCode,
  forgotPassword,
  resetPassword,
  getLoginData,
  updatePersonalInfo,
  updateFamilyDetails,
  updateEducationDetails,
  updateDependantDetails,
  getPersonalInfo,
  getFamilyDetails,
  getEducationalDetails,
  deleteEducationalDetails,
  getDependantDetails,
  deleteDependantDetails,
  uploadProfileImg,
  sendProfileImg,
  uploadDocuments,
  uploadMarksheet,
  getMarksheet,
  sendDocument,
  deleteDocument,
  getAppliedScholarships,
} = require("../controllers/user");

const authenticateToken = require("../middlewares/isAuth");
const upload = require("../../util/multer");

const {
  validateContactForm,
  validateLogin,
  validateSignUp,
  validateForgotPassword,
  validateResetPassword,
  validatePersonalInfo,
  validateFamilyDetails,
  validateBachelorDetails,
  validateEducationDetails,
  validateDependantDetails,
} = require("../../util/userInputValidation");

//Routes
router.post("/send-contact-form", validateContactForm, getContactFormData);

//authentication
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
router.post(
  "/family-details",
  authenticateToken,
  validateFamilyDetails,
  updateFamilyDetails
);
router.post(
  "/education-details",
  authenticateToken,
  validateEducationDetails,
  updateEducationDetails
);
router.post(
  "/bachelor-details",
  authenticateToken,
  validateBachelorDetails,
  updateEducationDetails
);
router.post(
  "/dependant-details",
  authenticateToken,
  validateDependantDetails,
  updateDependantDetails
);
router.get("/personal-info", authenticateToken, getPersonalInfo);
router.get("/family-details", authenticateToken, getFamilyDetails);
router.get("/education-details", authenticateToken, getEducationalDetails);
router.get("/dependant-details", authenticateToken, getDependantDetails);
router.post("/delete-education", authenticateToken, deleteEducationalDetails);
router.post("/delete-dependant", authenticateToken, deleteDependantDetails);

//profile image
router.post(
  "/upload-profileImg",
  authenticateToken,
  upload("images/profileImg", ["image/jpeg", "image/jpg", "image/png"]).single(
    "profileImg"
  ),
  uploadProfileImg
);
router.get("/profileImg", authenticateToken, sendProfileImg);

//documents
router.post(
  "/upload-documents",
  authenticateToken,
  upload("images/documents", [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]).array("files"),
  uploadDocuments
);
router.get("/document", authenticateToken, sendDocument);
router.delete("/document", authenticateToken, deleteDocument);

//marksheets
router.post(
  "/upload-marksheet",
  authenticateToken,
  upload("images/marksheets", [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]).single("marksheet"),
  uploadMarksheet
);
router.get("/marksheet", authenticateToken, getMarksheet);

//scholarship
router.get("/applied-scholarships", authenticateToken, getAppliedScholarships);

module.exports = router;
