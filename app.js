require("dotenv").config();


const express = require("express");
const bodyParser = require('body-parser');
const userRouter = require("./api/student/student.router");
const adminRouter = require("./api/faculty/admin.router");


const app = express();


app.use(express.json());
app.use(bodyParser.json());
app.use("/api/users", studentRouter);
app.use("/api/admin", facultyRouter);


app.listen(process.env.APP_PORT, () => {
    console.log("server up and running on PORT :", process.env.APP_PORT);
});
