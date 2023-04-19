const router = require("express").Router();
const {
  login,
  signUp,
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
  sendDocument,
  deleteDocument,
} = require("../controllers/user");

const authenticateToken = require("../middlewares/isAuth");
const upload = require("../../util/multer");

const { body } = require("express-validator");

// Validation middleware for login
const validateLogin = [
  body("email", "Invalid email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("userRole", "User role must be provided").notEmpty(),
];

// Validation middleware for sign up
const validateSignUp = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Invalid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("Phone number is required")
    // .isNumeric()
    // .withMessage("Phone number should only contain digits")
    .isLength({ min: 12, max: 12 })
    .withMessage("Phone number should be 12 digits long"),
];

// Validation middleware for Forgot Password
const validateForgotPassword = [
  body("email")
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage("Invalid email"),
];

// Validation middleware for Reset Password
const validateResetPassword = [
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// Validation middleware for Personal Information
const validatePersonalInfo = [
  body("firstName").notEmpty().withMessage("First Name is Empty"),
];

// Validation middleware for Family Details
const validateFamilyDetails = [
  body("familyDetails.fatherHealthStatus")
    .notEmpty()
    .withMessage("First Name is Empty"),
];

// Validation middleware for Education Details
const validateEducationDetails = [
  body("educationData.class").notEmpty().withMessage("Class is empty"),
];

// Validation middleware for Dependant Details
const validateDependantDetails = [
  body("dependantData.name").notEmpty().withMessage("Dependant name is empty"),
];

//Routes
router.post("/login", validateLogin, login);

router.post("/signup", validateSignUp, signUp);

router.post("/forgot-password", validateForgotPassword, forgotPassword);

router.post("/reset-password", validateResetPassword, resetPassword);

router.get("/getLoginData", authenticateToken, getLoginData);

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

router.post(
  "/upload-profileImg",
  authenticateToken,
  upload("images/profileImg", ["image/jpeg", "image/jpg", "image/png"]).single(
    "profileImg"
  ),
  uploadProfileImg
);
router.get("/profileImg", authenticateToken, sendProfileImg);

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

module.exports = router;
