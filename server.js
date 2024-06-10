const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const app = express();
const port = 3000;

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);
mongoose.connect(DB, {}).then(() => {
  console.log("DB connection successful");
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cookieParser());

const authRouter = require("./Routes/user");
const pagesRouter = require("./Routes/pages");
const quizRouter=require("./Routes/quiz")

app.use("/", authRouter);
app.use("/", pagesRouter);
app.use("/", quizRouter);

app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});
