const { body } = require("express-validator");

module.exports = {
  // Validation middleware for contactForm
  validateContactForm: [
    body("name", "Please Provide a valid name").notEmpty(),
    body("email", "Please Provide a valid email")
      .isEmail()
      .normalizeEmail({ gmail_remove_dots: false }),
    body("message", "please provide a valid message").notEmpty(),
  ],
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

  // Validation middleware for Personal Information
  validatePersonalInfo: [
    body("firstName").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("First Name cannot be empty");
      }
      return true;
    }),

    body("lastName").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Last Name cannot be empty");
      }
      return true;
    }),

    body("phoneNumber").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Phone Number is required");
      }
      const regex = /^92\d{10}$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Phone Number should be in the format 92xxxxxxxxxx"
        );
      }
      return true;
    }),

    body("personalInfo.email").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Email is required");
      }
      const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]+.com$/;
      if (!regex.test(value)) {
        return Promise.reject("Email is invalid");
      }
      return true;
    }),

    body("personalInfo.cnic").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("CNIC is required");
      }
      if (value.trim().length !== 13) {
        return Promise.reject("CNIC should be 13 digits");
      }
      return true;
    }),

    body("personalInfo.class").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Class cannot be empty");
      }
      return true;
    }),

    body("personalInfo.rollNo").custom((value, { req }) => {
      const regex = /^[A-Za-z]{2}-\d{5}$/;
      if (!value) {
        return Promise.reject("Roll No is required");
      }
      if (!regex.test(value.trim())) {
        return Promise.reject("Roll No should be in the format XX-XXXXX");
      }
      return true;
    }),

    body("personalInfo.discipline").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Discipline cannot be empty");
      }
      return true;
    }),

    body("personalInfo.batch").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Batch is required");
      }
      const regex = /^\d{4}$/;
      if (!regex.test(value)) {
        return Promise.reject("Batch should be in the format XXXX");
      }
      return true;
    }),

    body("personalInfo.categoryOfAdmission").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Category of Admission cannot be empty");
      }
      return true;
    }),

    body("personalInfo.alternativePhoneNumber").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Alternative Phone Number is required");
      }
      const regex = /^92\d{10}$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Alternative Phone Number should be in the format 92xxxxxxxxxx"
        );
      }
      return true;
    }),
    body("personalInfo.residentialAddress").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Residential Address.");
      }
      return true;
    }),
    body("personalInfo.residentialDistrict").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Residential District.");
      }
      return true;
    }),
    body("personalInfo.residentialCity").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Residential City.");
      }
      return true;
    }),
    body("personalInfo.residentialProvince").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Residential Province.");
      }
      return true;
    }),
    body("personalInfo.permanentAddress").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Permanent Address.");
      }
      return true;
    }),
    body("personalInfo.permanentDistrict").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Permanent District.");
      }
      return true;
    }),
    body("personalInfo.permanentCity").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Permanent City.");
      }
      return true;
    }),
    body("personalInfo.permanentProvince").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Please provide a valid Permanent Province.");
      }
      return true;
    }),
  ],

  // Validation middleware for Family Details
  validateFamilyDetails: [
    body("familyDetails.fatherHealthStatus").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Father Health Status is Empty!");
      }
      return true;
    }),
    body("familyDetails.motherHealthStatus").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Mother Health Status is Empty!");
      }
      return true;
    }),
    body("familyDetails.fatherWorkStatus").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Father Work Status is Empty!");
      }
      return true;
    }),
    body("familyDetails.motherWorkStatus").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Mother Work Status is Empty!");
      }
      return true;
    }),
    body("familyDetails.fatherName").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Father Name is Empty!");
      }
      return true;
    }),
    body("familyDetails.relationWithApplicant").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Relation with Applicant is Empty!");
      }
      return true;
    }),
    body("familyDetails.occupation").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Occupation is Empty!");
      }
      return true;
    }),
    body("familyDetails.grossIncome").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Gross Income is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Gross Income should contain only numbers");
      }
      return true;
    }),
    body("familyDetails.residentialPhoneNumber").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Residential Phone Number is required");
      }
      const regex = /^92\d{10}$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Residential Phone Number should be in the format 92xxxxxxxxxx"
        );
      }
      return true;
    }),
    body("familyDetails.officePhoneNumber").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Office Phone Number is required");
      }
      const regex = /^92\d{10}$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Office Phone Number should be in the format 92xxxxxxxxxx"
        );
      }
      return true;
    }),
    body("familyDetails.monetaryAssistanceAmount").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Monetary Assistance Amount is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Monetary Assistance Amount should contain only numbers"
        );
      }
      return true;
    }),

    body("familyDetails.address").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Address is Empty!");
      }
      return true;
    }),
    body("familyDetails.district").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("District is Empty!");
      }
      return true;
    }),
    body("familyDetails.city").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("City is Empty!");
      }
      return true;
    }),
    body("familyDetails.province").custom((value, { req }) => {
      if (value.trim().length < 1) {
        return Promise.reject("Province is Empty!");
      }
      return true;
    }),
    body("familyDetails.noOfEarners").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("No. of Earners is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject("No. of Earners should contain only numbers");
      }
      return true;
    }),
    body("familyDetails.totalFamilyIncome").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Total Family Income is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Total Family Income should contain only numbers"
        );
      }
      return true;
    }),
    body("familyDetails.totalNoOfDepandants").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Total No. of Dependants is required");
      }
      const regex = /^[A-Za-z]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Total No. of Dependants should be in words ");
      }
      return true;
    }),
  ],

  // Validation middleware for Education Details
  validateEducationDetails: [
    body("educationData.class").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Class is required");
      }
      const regex = /^[0-9]{4}$/;
      if (!regex.test(value)) {
        return Promise.reject("Class should be a 4-digit number");
      }
      return true;
    }),
    body("educationData.seatNo").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Seat Number is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Seat Number should contain only numbers");
      }
      return true;
    }),
    body("educationData.totalMarksCGPA").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Total Marks/CGPA is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Total Marks/CGPA should contain only numbers");
      }
      return true;
    }),
    body("educationData.obtainedMarksCGPA").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Obtained Marks/CGPA is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject(
          "Obtained Marks/CGPA should contain only numbers"
        );
      }
      return true;
    }),
    body("educationData.percentage").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Percentage is required");
      }
      const regex = /^[0-9]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Percentage should contain only numbers");
      }
      return true;
    }),
    body("educationData.meritPosition").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Merit Position is required");
      }
      const regex = /^[A-Za-z]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Merit Position should contain only alphabets");
      }
      return true;
    }),
  ],

  validateBachelorDetails: [
    body("educationData.class").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Class is required");
      }
      const regex = /^[0-9]{4}$/;
      if (!regex.test(value)) {
        return Promise.reject("Class should be a 4-digit number");
      }
      return true;
    }),
    body("educationData.seatNo").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Seat Number is required");
      }
      const regex = /^[A-Z]{2}-\d{5}$/;
      if (!regex.test(value)) {
        return Promise.reject("Seat Number should be of pattern CT-20061");
      }
      return true;
    }),
    body(
      "educationData.semester",
      "Please Provide a valid semester value"
    ).notEmpty(),
    body("educationData.totalCGPA").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Total CGPA is required");
      }
      const regex = /^\d\.\d{1}$/;
      if (!regex.test(value)) {
        return Promise.reject("Total CGPA should be of pattern 4.0");
      }
      return true;
    }),
    body("educationData.obtainedCGPA").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Obtained CGPA is required");
      }
      const regex = /^\d\.\d{1}$/;
      if (!regex.test(value)) {
        return Promise.reject("Obtained CGPA should be of pattern 3.0");
      }
      return true;
    }),
    body("educationData.meritPosition").custom((value, { req }) => {
      if (!value) {
        return Promise.reject("Merit Position is required");
      }
      const regex = /^[A-Za-z]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Merit Position should contain only alphabets");
      }
      return true;
    }),
  ],

  // Validation middleware for Dependant Details
  validateDependantDetails: [
    body("dependantData.name").custom((value) => {
      if (!value) {
        return Promise.reject("Name is required");
      }
      const regex = /^[a-zA-Z]+( [a-zA-Z]+)*$/;
      if (!regex.test(value)) {
        return Promise.reject("Name should only contain letters");
      }
      return true;
    }),
    body("dependantData.relation").custom((value) => {
      if (!value) {
        return Promise.reject("Relation is required");
      }
      const regex = /^[A-Za-z]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Relation should only contain letters");
      }
      return true;
    }),
    body("dependantData.age").custom((value) => {
      if (!value) {
        return Promise.reject("Age is required");
      }
      const regex = /^[0-9]{2}$/;
      if (!regex.test(value)) {
        return Promise.reject("Age should be two digits");
      }
      return true;
    }),
    body("dependantData.occupation").custom((value) => {
      if (!value) {
        return Promise.reject("Occupation is required");
      }
      const regex = /^[A-Za-z]+$/;
      if (!regex.test(value)) {
        return Promise.reject("Occupation should only contain letters");
      }
      return true;
    }),
  ],
};
