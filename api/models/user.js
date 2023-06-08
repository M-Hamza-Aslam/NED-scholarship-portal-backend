const mongoose = require("mongoose");
const Scholarship = require("./scholarship");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  profileImg: {
    type: String,
  },
  profileStatus: {
    type: Number,
    required: true,
  },
  personalInfo: {
    type: Object,
    required: true,
  },
  familyDetails: {
    type: Object,
    required: true,
  },
  education: {
    matric: {
      type: Object,
      default: {},
    },
    intermediate: {
      type: Object,
      default: {},
    },
    bachelor: {
      type: Object,
      default: {},
    },
    documents: {
      type: Array,
      required: true,
    },
  },
  dependantDetails: {
    type: Array,
    required: true,
  },
  appliedScholarship: [
    {
      scholarshipId: {
        type: Schema.Types.ObjectId,
        ref: "Scholarship",
        required: true,
      },
      status: {
        type: String,
        enum: ["awaiting", "approved", "declined"],
        required: true,
      },
      otherRequirements: {
        type: Array,
        default: [],
      },
    },
  ],
  isVerified: {
    type: Boolean,
    required: true,
  },
  verificationCode: String,
  verificationCodeExpiration: Date,
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);
