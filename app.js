require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./api/routes/admin");
const alumniRoutes = require("./api/routes/alumni");
const userRoutes = require("./api/routes/user");
const scholarshipRoutes = require("./api/routes/scholarship");
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// To protect from CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Routes
app.use(userRoutes);
app.use(scholarshipRoutes);
app.use("/admin", adminRoutes);
app.use("/alumni", alumniRoutes);

// Call the scheduler function to start the task
const runScheduler = require("./util/cornSchedulars");
runScheduler();

// setting mongoose connection and starting server
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.MongoDB_URI)
  .then(() => {
    app.listen(process.env.APP_PORT, () => {
      console.log("Server up and running on PORT:", process.env.APP_PORT);
    });
  })
  .catch((err) => {
    console.log(err);
  });
