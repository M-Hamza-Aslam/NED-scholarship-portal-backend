const router = require("express").Router();
const {
  login,
  signUp,
  forgotPassword,
  resetPassword,
  getScholarshipList,
  getScholarshipListById,
  getFeaturedScholarshipList,
} = require("../controllers/user");
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

router.get("/scholarship-list", authenticateToken, getScholarshipList);

router.get("/scholarship-list/:id", authenticateToken, getScholarshipListById);

router.get("/featured-scholarship-list", getFeaturedScholarshipList);

module.exports = router;
