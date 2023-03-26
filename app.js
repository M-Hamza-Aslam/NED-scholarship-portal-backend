require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const userRouter = require("./api/user/user.router");
// const facultyRouter = require("./api/faculty/faculty.router");

const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", userRouter);
// app.use("/api/faculty", facultyRouter);


app.listen(process.env.APP_PORT, () => {
    console.log("server up and running on PORT :", process.env.APP_PORT);
});
