const router = require("express").Router();

const {
  login,
  signUp,
  getLoginData,
  createScholarship,
  uploadScholarshipImg,
  getUserData,
  sendUserProfileImg,
  sendDocument,
  appliedUsersList,
  updateScholarshipStatus,
  updateScholarship,
  deleteScholarship,
} = require("../controllers/admin");

const { body } = require("express-validator");

const authenticateToken = require("../middlewares/isAuth");

const upload = require("../../util/multer");

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

const validateScholarship = [
  body("title").notEmpty().withMessage("Scholarship Title must not be empty"),
  body("closeDate").notEmpty().withMessage("Close Date must not be empty"),
  body("description").notEmpty().withMessage("Description must not be empty"),
  body("eligibilityCriteria")
    .notEmpty()
    .withMessage("Eligibility Criteria must not be empty"),
  body("instructions").notEmpty().withMessage("Instructions must not be empty"),
];

router.post("/login", validateLogin, login);

router.post("/signup", validateSignUp, signUp);

router.get("/getLoginData", authenticateToken, getLoginData);

router.post(
  "/create-scholarship",
  authenticateToken,
  validateScholarship,
  createScholarship
);
router.post(
  "/update-scholarship",
  authenticateToken,
  validateScholarship,
  updateScholarship
);
router.delete("/delete-scholarship", authenticateToken, deleteScholarship);
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

router.get("/user-data", authenticateToken, getUserData);

router.get("/userProfileImg", authenticateToken, sendUserProfileImg);

router.get("/document", authenticateToken, sendDocument);

router.get("/appliedUsersList", authenticateToken, appliedUsersList);

router.post(
  "/update-scholarship-status",
  authenticateToken,
  updateScholarshipStatus
);

module.exports = router;
