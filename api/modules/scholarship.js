const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scholarshipSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  
});

module.exports = mongoose.model("Scholarship", scholarshipSchema);