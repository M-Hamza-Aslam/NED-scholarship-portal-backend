const Alumni = require("../models/alumni");
const Scholarship = require("../models/scholarship");
const User = require("../models/user");

const { validationResult } = require("express-validator");
const { getContentType } = require("../../util/contentType");
const { createReadStream } = require("fs");
// const { default: mongoose } = require("mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
// const PDFDocument = require("pdfkit");
const randomatic = require("randomatic");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SendsGrid_API_Key,
    },
  })
);
const crypto = require("crypto");

module.exports = {
  //For alumni login
  login: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const { email, password, userRole } = req.body;

      const alumniDetails = await Alumni.findOne({
        email: email,
        userRole: userRole,
      });

      if (!alumniDetails) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }

      const isMatch = await bcrypt.compare(password, alumniDetails.password);

      if (!isMatch) {
        return res.status(401).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          userId: alumniDetails._id.toString(),
          userRole: alumniDetails.userRole,
          expiration: Date.now() + 3600000,
        },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );
      const alumniData = {
        email: alumniDetails.email,
        firstName: alumniDetails.firstName,
        lastName: alumniDetails.lastName,
        phoneNumber: alumniDetails.phoneNumber,
        profileStatus: alumniDetails.profileStatus,
        userRole: alumniDetails.userRole,
        profileImg: alumniDetails.profileImg,
        isVerified: alumniDetails.isVerified,
      };
      res.status(200).json({
        message: "Login successful",
        userDetails: alumniData,
        userId: alumniDetails._id.toString(),
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
      const existingAlumni = await Alumni.findOne({ email: email });

      if (existingAlumni) {
        return res.status(409).json({
          message: "Alumni with this email already exists",
        });
      }
      //Password encription
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creating a new alumni document
      const newAlumni = new Alumni({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        isVerified: false,
        phoneNumber,
        userRole: "alumni",
        profileStatus: 0,
        profileImg: "",
        personalInfo: { isInitial: true },
      });
      const alumniDetails = await newAlumni.save();

      //creating token
      const token = jwt.sign(
        {
          userId: alumniDetails._id.toString(),
          userRole: alumniDetails.userRole,
          expiration: Date.now() + 3600000,
        },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );

      const alumniData = {
        email: alumniDetails.email,
        firstName: alumniDetails.firstName,
        lastName: alumniDetails.lastName,
        phoneNumber: alumniDetails.phoneNumber,
        profileStatus: alumniDetails.profileStatus,
        userRole: alumniDetails.userRole,
        profileImg: alumniDetails.profileImg,
      };

      // Returning success message
      res.status(201).json({
        message: "Alumni created successfully, please verify your Email!",
        userDetails: alumniData,
        userId: alumniDetails._id.toString(),
        token: token,
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
      });
    }
  },
  emailVerification: async (req, res) => {
    try {
      //finding user
      const userId = req.userId;
      const alumni = await Alumni.findById(userId);
      if (!alumni) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }
      //creating 4-digit verification code
      const emailVerificationCode = randomatic("0", 4);
      //saving code in database
      alumni.verificationCode = emailVerificationCode;
      alumni.verificationCodeExpiration = new Date().getTime() + 900000;
      await alumni.save();
      //sending verification code inside email
      transporter.sendMail(
        {
          to: alumni.email,
          from: "hamza.prolink@gmail.com",
          subject: "Email Verification",
          html: `
    <p>Have you requested for Email Verification ?</p>
    <p>Here is your code: ${emailVerificationCode} </p>
    <p>Remember it is valid for 15 minutes only!</p>
`,
        },
        (err) => {
          console.log(err);
        }
      );
      res.status(201).json({
        message: "Verification Code has been sent to Email!",
      });
    } catch (error) {
      console.log(error);
      res.status(400).json({
        message: error.message,
      });
    }
  },
  verifyCode: async (req, res, next) => {
    try {
      const userId = req.userId;
      const code = req.body.code;
      //extracting user
      const alumni = await Alumni.findById(userId);
      if (!alumni) {
        return res.status(401).json({
          message: "Alumni not found",
        });
      }
      //checking code
      if (
        code !== alumni.verificationCode ||
        new Date().getTime() >= alumni.verificationCodeExpiration
      ) {
        return res.status(401).json({
          message: "invalid verification code",
        });
      }
      //updating databse
      alumni.isVerified = true;
      alumni.verificationCode = undefined;
      alumni.verificationCodeExpiration = undefined;
      await alumni.save();

      res.status(201).json({
        message: "Your account has been verified!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
  getLoginData: async (req, res) => {
    try {
      const userDetails = await Alumni.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Alumni not found" });
      }

      const token = jwt.sign(
        {
          userId: userDetails._id.toString(),
          userRole: userDetails.userRole,
          expiration: Date.now() + 3600000,
        },
        process.env.JWT_SecretKey,
        { expiresIn: "1h" }
      );

      const userData = {
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        phoneNumber: userDetails.phoneNumber,
        profileStatus: userDetails.profileStatus,
        userRole: userDetails.userRole,
        profileImg: userDetails.profileImg,
        isVerified: userDetails.isVerified,
      };
      res.status(200).json({
        message: "User Credentials fetched successfully",
        userDetails: userData,
        userId: userDetails._id.toString(),
        token: token,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  //For student forget password
  forgotPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const alumni = await Alumni.findOne({ email: req.body.email });
      if (!alumni) {
        return res.status(401).json({
          message: "alumni not found",
        });
      }
      crypto.randomBytes(32, async (err, buf) => {
        if (err) {
          throw new Error("token generation failed");
        } else {
          const token = buf.toString("hex");
          alumni.resetToken = token;
          alumni.resetTokenExpiration = Date.now() + 3600000;
          await alumni.save();
          //sending Email
          transporter.sendMail(
            {
              to: req.body.email,
              from: "hamza.prolink@gmail.com",
              subject: "Reset Password",
              html: `
          <p>Have you requested for resetting your password ?</p>
          <p>Click this <a href="http://localhost:3000/auth/reset-password/${token}" >Link</a>  to reset your password</p>
        `,
            },
            (err) => {
              console.log(err);
            }
          );
          res.status(200).json({
            message:
              "Reset password link has been sent to your provided Email!",
          });
        }
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },

  //For student reset password
  resetPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
      }
      const token = req.body.token;
      const alumni = await Alumni.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
      });
      if (!alumni) {
        return res.status(401).json({
          message: "alumni not found",
        });
      }
      const newPassword = req.body.newPassword;
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      alumni.password = newHashedPassword;
      alumni.resetToken = undefined;
      alumni.resetTokenExpiration = undefined;
      await alumni.save();
      res.status(201).json({
        message: "Password has been updated successfully!",
      });
    } catch (error) {
      res.status(400).json({
        message: error.message,
      });
    }
  },
  getCreatedScholarships: async (req, res) => {
    try {
      const userId = req.userId;

      const alumni = await Alumni.findById(userId).populate(
        "createdScholarships.scholarshipId"
      );
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      const createdScholarships = alumni.createdScholarships.map(
        (scholarship) => {
          const issueDate = new Date(scholarship.scholarshipId.issueDate);
          const closeDate = new Date(scholarship.scholarshipId.closeDate);
          return {
            status: scholarship.status,
            _id: scholarship.scholarshipId._id,
            title: scholarship.scholarshipId.title,
            image: scholarship.scholarshipId.image,
            issueDate: {
              month: issueDate.toLocaleString("default", { month: "long" }),
              day: issueDate.getDate(),
              year: issueDate.getFullYear(),
            },
            closeDate: {
              month: closeDate.toLocaleString("default", { month: "long" }),
              day: closeDate.getDate(),
              year: closeDate.getFullYear(),
            },
            // status: scholarship.scholarshipId.status,
            description: scholarship.scholarshipId.description,
            eligibilityCriteria: scholarship.scholarshipId.eligibilityCriteria,
            instructions: scholarship.scholarshipId.instructions,
            otherRequirements: scholarship.scholarshipId.otherRequirements,
          };
        }
      );

      res.json(createdScholarships);
    } catch (error) {
      res.status(500).json({
        message: "Something went wrong with the api",
        error: error.message,
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
  createMeritScholarship: async (req, res) => {
    try {
      //extracting Admin just for verification
      const userDetails = await Alumni.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      //creating a new scholarship
      const newScholarship = new Scholarship({
        ...req.body,
        image: "",
        issueDate: Date.now(),
        status: "awaiting",
        creator: {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          role: "alumni",
        },
      });
      const scholarshipDetails = await newScholarship.save();

      //preparing response
      let responseData = {
        _id: scholarshipDetails._id.toString(),
        type: scholarshipDetails.type,
        title: scholarshipDetails.title,
        issueDate: scholarshipDetails.issueDate,
        closeDate: scholarshipDetails.closeDate,
        image: scholarshipDetails.image,
        status: scholarshipDetails.status,
        matricPercentage: scholarshipDetails.matricPercentage,
        intermediatePercentage: scholarshipDetails.intermediatePercentage,
        bachelorCGPA: scholarshipDetails.bachelorCGPA,
        description: scholarshipDetails.description,
        eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
        instructions: scholarshipDetails.instructions,
        otherRequirements: scholarshipDetails.otherRequirements,
        creator: scholarshipDetails.creator,
      };
      // Returning success message
      res.status(201).json({
        message: "Scholarship created successfully",
        scholarshipDetails: responseData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  createNeedScholarship: async (req, res) => {
    try {
      //extracting Admin just for verification
      const userDetails = await Alumni.findById(req.userId);
      if (!userDetails) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      //creating a new scholarship
      const newScholarship = new Scholarship({
        ...req.body,
        image: "",
        issueDate: new Date(),
        status: "awaiting",
        creator: {
          name: `${userDetails.firstName} ${userDetails.lastName}`,
          email: userDetails.email,
          role: "alumni",
        },
      });
      const scholarshipDetails = await newScholarship.save();

      //preparing response
      let responseData = {
        _id: scholarshipDetails._id.toString(),
        type: scholarshipDetails.type,
        title: scholarshipDetails.title,
        issueDate: scholarshipDetails.issueDate,
        closeDate: scholarshipDetails.closeDate,
        image: scholarshipDetails.image,
        status: scholarshipDetails.status,
        familyIncome: scholarshipDetails.familyIncome,
        description: scholarshipDetails.description,
        eligibilityCriteria: scholarshipDetails.eligibilityCriteria,
        instructions: scholarshipDetails.instructions,
        otherRequirements: scholarshipDetails.otherRequirements,
        creator: scholarshipDetails.creator,
      };

      // Returning success message
      res.status(201).json({
        message: "Scholarship created successfully",
        scholarshipDetails: responseData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  updatePersonalInfo: async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).json({ errors: errors.array() });
      }
      const { firstName, lastName, phoneNumber, personalInfo } = req.body;

      const alumni = await Alumni.findById(req.userId);
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      if (alumni.personalInfo.isInitial) {
        alumni.profileStatus += 80;
        alumni.personalInfo.isInitial = false;
      }
      //update info
      alumni.firstName = firstName;
      alumni.lastName = lastName;
      alumni.phoneNumber = phoneNumber;
      alumni.personalInfo = { isInitial: false, ...personalInfo };
      const updatedAlumni = await alumni.save();
      res.status(201).json({
        message: "Personal information updated",
        updatedUserData: {
          personalInfo: updatedAlumni.personalInfo,
          firstName: updatedAlumni.firstName,
          lastName: updatedAlumni.lastName,
          phoneNumber: updatedAlumni.phoneNumber,
          profileStatus: updatedAlumni.profileStatus,
        },
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
      const alumni = await Alumni.findById(req.userId);
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
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
  getPersonalInfo: async (req, res, next) => {
    try {
      //finding user from database
      const alumni = await Alumni.findById(req.userId);
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      //sending data to front-end
      let personalInfo;
      if (!alumni.personalInfo) {
        personalInfo = {};
      }
      personalInfo = alumni.personalInfo;
      res.status(200).json({
        userData: {
          personalInfo: personalInfo,
          profileStatus: alumni.profileStatus,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  uploadProfileImg: async (req, res) => {
    try {
      const image = req.file;
      if (!image) {
        return res.status(415).json({
          message: "Invalid File",
        });
      }
      const alumni = await Alumni.findById(req.userId);
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      if (alumni.profileImg !== "") {
        // Remove image from the file storage
        fs.unlink(alumni.profileImg, function (err) {
          if (err) {
            console.error(err);
          } else {
            console.log("File deleted successfully");
          }
        });
      }
      const imageUrl = image.path.replace(/\\/g, "/");
      //updating profileStatus if uploading image firstTime;
      if (alumni.profileImg === "") {
        alumni.profileStatus += 20;
      }
      alumni.profileImg = imageUrl;
      const updatedAlumni = await alumni.save();
      res.status(201).json({
        message: "file Uploaded",
        profileImg: updatedAlumni.profileImg,
        profileStatus: updatedAlumni.profileStatus,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Internal server error",
      });
    }
  },
  sendProfileImg: async (req, res) => {
    try {
      const alumni = await Alumni.findById(req.userId);
      if (!alumni) {
        return res.status(404).json({ message: "Alumni not found" });
      }
      const filePath = path.resolve(alumni.profileImg);
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
};
