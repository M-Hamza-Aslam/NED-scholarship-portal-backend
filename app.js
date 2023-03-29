require("dotenv").config();
const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./api/routes/user");
const facultyRoutes = require("./api/routes/faculty");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(facultyRoutes);

// setting mongoose connection and starting server
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://MuhammadHamza:hamza12345@cluster0.fq85av6.mongodb.net/portalData?retryWrites=true&w=majority"
  )
  .then((result) => {
    app.listen(process.env.APP_PORT, () => {
      console.log("server up and running on PORT :", process.env.APP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
