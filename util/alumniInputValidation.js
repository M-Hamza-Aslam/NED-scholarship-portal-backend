const { body } = require("express-validator");

module.exports = {
    // Validation middleware for login
    validateLogin: [
        body("email", "Invalid email")
            .isEmail()
            .normalizeEmail({ gmail_remove_dots: false }),
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("userRole", "User role must be provided").notEmpty(),
    ],

    // Validation middleware for sign up
    validateSignUp: [
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
    ],

    // Validation middleware for Forgot Password
    validateForgotPassword: [
        body("email")
            .isEmail()
            .normalizeEmail({ gmail_remove_dots: false })
            .withMessage("Invalid email"),
    ],

    // Validation middleware for Reset Password
    validateResetPassword: [
        body("newPassword")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
    ],
};
