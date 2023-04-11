const router = require("express").Router();

const {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  addOrUpdatePersonalInfo
} = require("../controllers/user");
const {
  getScholarshipList,
  getScholarshipListById,
  getFeaturedScholarshipList
} = require("../controllers/scholarship");

const { body } = require("express-validator");
const jwt = require("jsonwebtoken");

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

// Validation middleware for add Or Update Personal Info
const validatePersonalInfo = [
  body('token', 'Token is required')
    .notEmpty(),
  body("personalInfo.aboutYourself.title")
    .isString()
    .withMessage("Title must be a string"),
  body("personalInfo.aboutYourself.firstName")
    .isString()
    .withMessage("First name must be a string"),
  body("personalInfo.aboutYourself.lastName")
    .isString()
    .withMessage("Last name must be a string"),
  body("personalInfo.aboutYourself.cellPhone")
    .isString()
    .withMessage("Cell phone must be a string"),
  body("personalInfo.aboutYourself.gender")
    .isString()
    .withMessage("Gender must be a string"),
  body("personalInfo.aboutYourself.religion")
    .isString()
    .withMessage("Religion must be a string"),
  body("personalInfo.aboutYourself.maritalStatus")
    .isString()
    .withMessage("Marital status must be a string"),
  body("personalInfo.biographicalInformation.dataOfBirth")
    .isString()
    .withMessage("Date of birth must be a string"),
  body("personalInfo.biographicalInformation.domicileProvince")
    .isString()
    .withMessage("Domicile province must be a string"),
  body("personalInfo.biographicalInformation.domicileCity")
    .isString()
    .withMessage("Domicile city must be a string"),
  body("personalInfo.biographicalInformation.domicileDistrict")
    .isString()
    .withMessage("Domicile district must be a string"),
  body("personalInfo.biographicalInformation.countryOfBirth")
    .isString()
    .withMessage("Country of birth must be a string"),
  body("personalInfo.biographicalInformation.age")
    .isString()
    .withMessage("Age must be a string"),
  body("personalInfo.fatherInformation.fatherName")
    .isString()
    .withMessage("Father name must be a string"),
  body("personalInfo.fatherInformation.fatherStatus")
    .isString()
    .withMessage("Father status must be a string"),
  body("personalInfo.fatherInformation.fatherCurrentlyEmployed")
    .isString()
    .withMessage("Father currently employed must be a string"),
  body("personalInfo.fatherInformation.fatherOccupation")
    .isString()
    .withMessage("Father occupation must be a string"),
  body("personalInfo.nationalityInfo.identification")
    .isString()
    .withMessage("Identification must be a string"),
  body("personalInfo.nationalityInfo.type")
    .isString()
    .withMessage("Type must be a string"),
  body("personalInfo.nationalityInfo.country")
    .isString()
    .withMessage("Country must be a string"),
];


// Authentication middleware
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      return res.status(401).json({
        error: "Invalid Token!",
      });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SecretKey);
    if (!decodedToken) {
      return res.status(401).json({
        error: "Invalid Token!",
      });
    }
    req.userId = decodedToken.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid Token!",
    });
  }
};

//Routes
router.post("/login", validateLogin, login);

router.post("/signup", validateSignUp, signUp);

router.post("/forgot-password", validateForgotPassword, forgotPassword);

router.post("/reset-password", validateResetPassword, resetPassword);

router.post("/personal-info", authenticateToken, validatePersonalInfo, addOrUpdatePersonalInfo);

router.get("/scholarship-list", authenticateToken, getScholarshipList);

router.get("/scholarship-list/:id", authenticateToken, getScholarshipListById);

router.get("/featured-scholarship-list", getFeaturedScholarshipList);

module.exports = router;