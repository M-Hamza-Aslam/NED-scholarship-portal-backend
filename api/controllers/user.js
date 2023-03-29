const { body, validationResult } = require("express-validator");

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
      const { email, password, userRole } = req.body;

      const userDetails = await User.findOne({
        email: email,
        userRole: userRole,
      });

      if (!userDetails) {
        return res.status(401).json({
          error: "User not found",
        });
      }

      const isMatch = await bcrypt.compare(password, userDetails.password);

      if (!isMatch) {
        return res.status(401).json({
          error: "Invalid password",
        });
      }

      const token = jwt.sign(
        { userId: userDetails._id.toString(), userRole: userDetails.userRole },
        "mysupersupersecretkey",
        { expiresIn: "1h" }
      );

      res.status(200).json({
        message: "Login successful",
        userId: userDetails._id.toString(),
        token: token,
      });
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
      const { firstName, lastName, email, password, phoneNumber } = req.body;

      // Check if user already exists with this email
      const existingUser = await User.findOne({ email: email });

      if (existingUser) {
        return res.status(409).json({
          message: "User with this email already exists",
        });
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
        message: error.message,
      });
    }
  },
};
