const Admin = require("../models/admin");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Scholarship = require("../models/scholarship");
const User = require("../models/user");
const { getContentType } = require("../../util/contentType");
const path = require("path");
const fs = require("fs");
const { createReadStream } = require("fs");
const { default: mongoose } = require("mongoose");

module.exports = {
  //For admin login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const { email, password, userRole } = req.body;

      const adminDetails = await Admin.findOne({
        email: email,
        userRole: userRole,
      });

      if (!adminDetails) {
        return res.status(401).json({
          message: "Admin not found",
        });
      }

      const isMatch = await bcrypt.compare(password, adminDetails.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          userId: adminDetails._id.toString(),
          userRole: adminDetails.userRole,
          expiration: Date.now() + 3600000,
        },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );
      const adminData = {
        email: adminDetails.email,
        firstName: adminDetails.firstName,
        lastName: adminDetails.lastName,
        phoneNumber: adminDetails.phoneNumber,
        userRole: adminDetails.userRole,
      };
      res.status(200).json({
        message: "Login successful",
        userDetails: adminData,
        userId: adminDetails._id.toString(),
        token: token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
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
      const existingUser = await Admin.findOne({ email: email });

      if (existingUser) {
        return res.status(409).json({
          message: "Admin with this email already exists",
        });
      }
      //Password encription
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creating a new user document
      const newAdmin = new Admin({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userRole: "admin",
      });
      const result = await newAdmin.save();

      // Returning success message
      res.status(201).json({
        message: "Admin created successfully",
        userDetails: result,
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
  getLoginData: async (req, res) => {
    try {
      const userDetails = await Admin.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Admin not found" });
      }
      const userData = {
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        userRole: userDetails.userRole,
      };
      res.status(200).json({
        message: "admin Credentials fetched successfully",
        userDetails: userData,
        userId: userDetails._id.toString(),
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  createScholarship: async (req, res) => {
    try {
      //extracting Admin just for verification
      const userDetails = await Admin.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Admin not found" });
      }
      //extracting scholarship details from req
      const {
        title,
        closeDate,
        description,
        eligibilityCriteria,
        instructions,
      } = req.body;
      //creating a new scholarship
      const newScholarship = new Scholarship({
        title,
        image: "",
        issueDate: Date.now(),
        closeDate,
        status: "active",
        description,
        eligibilityCriteria,
        instructions,
      });
      const scholarshipDetails = await newScholarship.save();

      // Returning success message
      res.status(201).json({
        message: "Scholarship created successfully",
        scholarshipDetails: {
          _id: scholarshipDetails._id.toString(),
          title: scholarshipDetails.title,
          issueDate: scholarshipDetails.issueDate,
          closeDate: scholarshipDetails.closeDate,
          image: scholarshipDetails.image,
          status: scholarshipDetails.status,
          description: scholarshipDetails.description,
          eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
          instructions: scholarshipDetails.instructions,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateScholarship: async (req, res) => {
    try {
      //getting data
      const scholarshipId = req.query.scholarshipId;
      const {
        title,
        closeDate,
        description,
        eligibilityCriteria,
        instructions,
      } = req.body;
      //extracting scholarship
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //updating scholarship
      scholarship.title = title;
      scholarship.closeDate = closeDate;
      scholarship.description = description;
      scholarship.eligibilityCriteria = eligibilityCriteria;
      scholarship.instructions = instructions;
      //deleting image from file system
      fs.unlink(`images/scholarshipImg/${scholarship.image}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("Scholarship Img deleted successfully");
          scholarship.image = "";
        }
      });
      const scholarshipDetails = await scholarship.save();
      // Returning success message
      res.status(201).json({
        message: "Scholarship updated successfully",
        scholarshipDetails: {
          _id: scholarshipDetails._id.toString(),
          title: scholarshipDetails.title,
          issueDate: scholarshipDetails.issueDate,
          closeDate: scholarshipDetails.closeDate,
          image: scholarshipDetails.image,
          status: scholarshipDetails.status,
          description: scholarshipDetails.description,
          eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
          instructions: scholarshipDetails.instructions,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  deleteScholarship: async (req, res) => {
    try {
      const scholarshipId = req.query.scholarshipId;
      //extracting scholarship
      const scholarship = await Scholarship.findByIdAndRemove(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //deleting image from file system
      fs.unlink(`images/scholarshipImg/${scholarship.image}`, function (err) {
        if (err) {
          console.error(err);
        } else {
          console.log("Scholarship Img deleted successfully");
          scholarship.image = "";
        }
      });
      //sending response
      res.status(201).json({
        message: "Scholarship deleted successfully!",
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  uploadScholarshipImg: async (req, res) => {
    try {
      //extracting image file and scholarshipId coming from frontEnd
      const scholarshipId = req.body.scholarshipId;
      const image = req.file;
      if (!image) {
        return res.status(415).json({
          message: "Invalid File",
        });
      }
      //extracting user from DB just for validation
      const admin = await Admin.findById(req.userId);
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      //extracting scholarship
      const scholarship = await Scholarship.findById(scholarshipId);
      if (!scholarship) {
        return res.status(404).json({ message: "Scholarship not found" });
      }
      //saving image path
      scholarship.image = image.filename;

      const updatedscholarship = await scholarship.save();
      res.status(201).json({
        message: "scholarship image Uploaded",
        image: updatedscholarship.image,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  getUserData: async (req, res) => {
    try {
      //getting userId from client
      const userId = req.query.userId;
      //extracting user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //structuring userDetails;
      const userDetails = {
        userId: user._id.toString(),
        sideBar: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          profileStatus: user.profileStatus,
          profileImg: user.profileImg,
        },
        personalInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          personalInfo: user.personalInfo,
        },
        familyDetails: user.familyDetails,
        education: user.education,
        dependantDetails: user.dependantDetails,
      };
      //sending user data to front end
      res.status(200).json({
        message: "User details has been fetched",
        userDetails,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  sendUserProfileImg: async (req, res) => {
    try {
      const user = await User.findById(req.query.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const filePath = path.resolve(user.profileImg);
      if (!fs.existsSync(filePath)) {
        return res.status(401).json({
          message: "Invalid File",
        });
      }
      const contentType = getContentType(filePath);
      res.set("Content-Type", contentType);
      const fileStream = createReadStream(filePath);

      fileStream.on("error", (error) => {
        console.error(error);
        res.status(500).end();
      });

      fileStream.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  sendDocument: async (req, res) => {
    try {
      //geting document path from client
      const documentPath = req.query.documentPath;
      const userId = req.query.userId;
      //extracting user form database
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      //checking if required document exists in database
      if (!user.education.documents.includes(documentPath)) {
        return res.status(404).json({ message: "File not found" });
      }
      const filePath = path.resolve(`images/documents/${documentPath}`);
      if (!fs.existsSync(filePath)) {
        return res.status(401).json({
          message: "Invalid File",
        });
      }
      const contentType = getContentType(filePath);
      res.set("Content-Type", contentType);
      const fileStream = createReadStream(filePath);

      fileStream.on("error", (error) => {
        console.error(error);
        res.status(500).end();
      });

      fileStream.pipe(res);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  appliedUsersList: async (req, res) => {
    try {
      //getting scholarship Id from client
      const scholarshipId = req.query.scholarshipId;
      //finding users
      let users = await User.find({
        appliedScholarship: {
          $elemMatch: {
            scholarshipId: scholarshipId,
          },
        },
      });

      users = users.map((user) => {
        return {
          _id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          status: user.appliedScholarship.find(
            (s) => s.scholarshipId.toString() === scholarshipId
          ).status,
        };
      });

      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updateScholarshipStatus: async (req, res) => {
    try {
      const { userId, scholarshipId, updatedStatus } = req.body;

      // Find user with given userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      //check if updated status is approved and user has already approved scholarship
      user.appliedScholarship.forEach((scholarship) => {
        if (scholarship.status === "approved") {
          return res.status(403).json({
            message: "User already has approved scholarship",
          });
        }
      });

      // Find scholarship and change status

      user.appliedScholarship.forEach((scholarship) => {
        if (scholarship.scholarshipId.toString() === scholarshipId) {
          scholarship.status = updatedStatus;
        }
      });

      await user.save();

      res.status(201).json({
        User: user,
        message: "Scholarship status updated successfully",
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: err.message,
        message: "Internal server error",
      });
    }
  },
};
