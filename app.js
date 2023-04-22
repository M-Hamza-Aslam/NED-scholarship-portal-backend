require("dotenv").config();
const mongoose = require("mongoose");

// const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./api/routes/admin");
const userRoutes = require("./api/routes/user");
const facultyRoutes = require("./api/routes/faculty");
const scholarshipRoutes = require("./api/routes/scholarship");
const app = express();

app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//to protect from CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

//providing images statistically
// app.use("/images", express.static(path.join(__dirname, "images")));

//Routes
app.use("/admin", adminRoutes);
app.use(userRoutes);
app.use(scholarshipRoutes);
app.use(facultyRoutes);

// setting mongoose connection and starting server
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MongoDB_URI)
  .then((result) => {
    app.listen(process.env.APP_PORT, () => {
      console.log("server up and running on PORT :", process.env.APP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
