const { body, validationResult } = require("express-validator");
// const { findUserByEmail, createUser } = require("../user/user.service");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../modules/user");

module.exports = {
  login: async (req, res) => {
    try {
      
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    const { 
      email, 
      password 
    } = req.body;

      const userDetails = await User.findOne({ email: email });

      if (!userDetails) {
        return res.status(401).json({
          error: "Invalid email",
        });
      }

      const isMatch = await bcrypt.compare(password, userDetails.password);

      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      const token = jwt.sign({ userId: userDetails._id.toString() }, "mysupersupersecretkey",{expiresIn:'1h'});

      res.status(200).json({
        message: "Login successful",
        userId: userDetails._id.toString(),
        token: token });
    } catch (error) {
      res.status(500).json({
        error: "Internal server error",
      });
    }
  },

  signUp: async (req, res) => {
    try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array(),
      });
    }
    const {
      firstName, 
      lastName, 
      email, 
      password, 
      phoneNumber 
    } = req.body;
    
      // Check if user already exists with this email 
      const existingUser = await User.findOne({email: email})

      if (existingUser) {
        return res.status(409).json({
          message: "User with this email already exists",
        })
      }
      //Password encription
      const hashedPassword = await bcrypt.hash(password, 10); 
      
      // Creating a new user document
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
      });
      const result = await newUser.save();

      // Returning success message
      res.status(201).json({
        message: "User created successfully",
        userDetails: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message 
      });
    }
  },
  
  // protected: (req, res, ) => {
  //   res.status(200).json({
  //     message: `User ${req.userId} is authenticated`,
  //   });
  // },
};

// Validation rules for login route
// exports.loginValidationRules = () => {
//   return [
//     body("email").isEmail().withMessage("Invalid email"),
//     body("password")
//       .isLength({ min: 8 })
//       .withMessage("Password must be at least 8 characters"),
//   ];
// };

// Validation rules for sign up route
// exports.signUpValidationRules = () => {
//   return [
//     body("firstname").not().isEmpty().withMessage("First name is required"),
//     body("lastname").not().isEmpty().withMessage("Last name is required"),
//     body("email").isEmail().withMessage("Invalid email"),
//     body("password")
//       .isLength({ min: 8 })
//       .withMessage("Password must be at least 8 characters"),
//     body("phone_number").isMobilePhone().withMessage("Invalid phone number"),
//   ];
// };
