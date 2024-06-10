const User = require("./../Models/userModel");
const catchAsync = require("./../utils/catchAsync.js");
const AppError = require("./../utils/AppError");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

//SIGN UP

exports.signup = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) return res.redirect("/signin");

    const newUser = await User.create(req.body);
    const token = signToken(newUser._id);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/start");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

//SIGN IN

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError("Invalid email or password"), 401);

  const token = signToken(user._id);
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/start");
});

//AUTHENTICATE
exports.protect = async (req, res, next) => {
  let token;

  if (req.cookies.token) {
    try {
      token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      console.error(error);
      res.redirect("/signin");
    }
  }

  if (!token) {
    res.redirect("/signin");
  }
};
