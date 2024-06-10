const express = require("express");
const router = express.Router();
const axios = require("axios");
const authController = require("./../Controllers/authController");
const User = require("./../Models/userModel");

let call=0;
let quizScore=0;
const renderStart = (req, res, next) => {
  call = 0;
  quizScore = 0;
  res.render("start");
};

const getQuestion = async (req, res, next) => {
  axios
    .get("https://the-trivia-api.com/v2/questions?tags=space&limit=1", {
      responseType: "json",
    })
    .then(function (response) {
      const arr = response.data;
      question = arr[0].question.text;
      let options = arr[0].incorrectAnswers;
      options.push(arr[0].correctAnswer);
      options.sort();
      if (call === 4) {
        res.render("finish", {
          Question: question,
          option1: options[0],
          option2: options[1],
          option3: options[2],
          option4: options[3],
          correct_option: arr[0].correctAnswer,
        });
      } else {
        res.render("quiz", {
          Question: question,
          option1: options[0],
          option2: options[1],
          option3: options[2],
          option4: options[3],
          correct_option: arr[0].correctAnswer,
        });
      }
      call++;
    });
};

const getScore = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (user) {
      const highest = user.highscore;
      await User.updateOne(
        { _id: user._id },
        { $set: { highscore: Math.max(highest, quizScore) } }
      );
      res.render("score", {
        current_score: quizScore,
        highest: Math.max(highest, quizScore),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
router.post("/sendData", (req, res) => {
  const dataFromFrontend = req.body;
  console.log(dataFromFrontend.result);
  quizScore += dataFromFrontend.result;
  console.log("Data received from frontend:", dataFromFrontend);
  res.send("Data received successfully!");
});
router.get("/score", authController.protect, getScore);
router.get("/quiz", authController.protect, getQuestion);
router.get("/start", authController.protect, renderStart);

module.exports = router;
