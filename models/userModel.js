const userSchema = require("../schemas/userSchema");
const mongoose = require("mongoose");

const User = mongoose.model("user", userSchema);

module.exports = User;
