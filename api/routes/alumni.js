const router = require("express").Router();

const {
    login,
    
} = require("../controllers/alumni");

const { body } = require("express-validator");
// const authenticateToken = require("../middlewares/isAuth");
// const upload = require("../../util/multer");

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


router.post("/login", validateLogin, login);

