const mongoose = require("mongoose");

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
  personalInfo: {
    aboutYourself: {
      title: {
        type: String,
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      cellPhone: {
        type: String,
        required: true,
      },
      gender: {
        type: String,
        required: true,
      },
      religion: {
        type: String,
        required: true,
      },
      maritalStatus: {
        type: String,
        required: true,
      }
    },
    biographicalInformation: {
      dataOfBirth: {
        type: String,
        required: true,
      },
      domicileProvince: {
        type: String,
        required: true,
      },
      domicileCity: {
        type: String,
        required: true,
      },
      domicileDistrict: {
        type: String,
        required: true,
      },
      countryOfBirth: {
        type: String,
        required: true,
      },
      age: {
        type: String,
        required: true,
      }
    },
    fatherInformation: {
      fatherName: {
        type: String,
        required: true,
      },
      fatherStatus: {
        type: String,
        required: true,
      },
      fatherCurrentlyEmployed: {
        type: String,
        required: true,
      },
      fatherOccupation: {
        type: String,
        required: true,
      }
    },
    nationalityInfo: {
      identification: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      }
    }
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model("User", userSchema);