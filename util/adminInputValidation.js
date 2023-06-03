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

  validateMeritScholarship: [
    body("title").notEmpty().withMessage("Scholarship Title must not be empty"),
    body("closeDate").notEmpty().withMessage("Close Date must not be empty"),
    body("description").notEmpty().withMessage("Description must not be empty"),
    body("eligibilityCriteria")
      .notEmpty()
      .withMessage("Eligibility Criteria must not be empty"),
    body("instructions")
      .notEmpty()
      .withMessage("Instructions must not be empty"),
    body("type").notEmpty().withMessage("type must not be empty"),
    body("matricPercentage").custom((value, { req }) => {
      const Regex = /^[0-9]+$/;
      if (!Regex.test(value.trim())) {
        return Promise.reject("invalid family income!");
      }
    }),
    body("intermediatePercentage").custom((value, { req }) => {
      const Regex = /^[0-9]+$/;
      if (!Regex.test(value.trim())) {
        return Promise.reject("invalid family income!");
      }
    }),
    body("bachelorCGPA").custom((value, { req }) => {
      const Regex = /^\d\.\d{1}$/;
      if (!Regex.test(value.trim())) {
        return Promise.reject("invalid family income!");
      }
    }),
  ],

  validateNeedScholarship: [
    body("title").notEmpty().withMessage("Scholarship Title must not be empty"),
    body("closeDate").notEmpty().withMessage("Close Date must not be empty"),
    body("description").notEmpty().withMessage("Description must not be empty"),
    body("eligibilityCriteria")
      .notEmpty()
      .withMessage("Eligibility Criteria must not be empty"),
    body("instructions")
      .notEmpty()
      .withMessage("Instructions must not be empty"),
    body("type").notEmpty().withMessage("type must not be empty"),
    body("familyIncome").custom((value, { req }) => {
      const regex = /^[0-9]+$/;
      if (!regex.test(value.trim())) {
        return Promise.reject("invalid family income!");
      }
    }),
  ],
};
