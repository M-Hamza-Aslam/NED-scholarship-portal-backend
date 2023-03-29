const router = require("express").Router();
const { login, signUp, protected } = require("../controllers/user");
const { body, validationResult } = require("express-validator");
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

// Validation middleware
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
    const decodedToken = jwt.verify(token, "mysupersupersecretkey");
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

module.exports = router;
