const User = require("../models/userModel");
const CreateError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

exports.singup = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return next(new CreateError("User Already Exists!!", 400));
    }
    const hashedPasword = await bcrypt.hash(req.body.password, 12);

    const newUser = await User.create({ ...req.body, password: hashedPasword });

    // Assign JWT Token
    const token = jwt.sign({ _id: newUser._id }, JWT_SECRET, {
      expiresIn: "90d",
    });

    res.status(201).json({
      status: "Success",
      message: "User Registered Successfully",
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return next(new CreateError("User Not Found", 404));
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return next(new CreateError("Invalid Username or password", 401));
    }

    const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
      expiresIn: "90d",
    });

    res.status(200).json({
      status: "Success",
      message: "User Loggedin Successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ messgae: "Invalid Token Format" });
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);

    const userData = await User.findById(decode._id).select("-password -__v");

    if (!userData) {
      return next(new CreateError("User No Longer Exists!!", 401));
    }

    return res.status(200).json({
      valid: true,
      user: userData,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new CreateError("Token expired", 401));
    }
    if (error.name === "JsonWebTokenError") {
      return next(new CreateError("Invalid Token", 401));
    }
    if (error.name === "MongoError" || error.name === "MongooseError") {
      return next(new CreateError("Database Error Occurred", 402));
    }
    return next(new CreateError("Internal Server Error", 500));
  }
};
