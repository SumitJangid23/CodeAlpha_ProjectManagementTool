const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  role: {
  type: String,
  enum: ["manager", "member"],
  default: "member"
},
  email: { type: String, unique: true },
  resetToken: String,
resetTokenExpire: Date,
  password: String
});

module.exports = mongoose.model("User", userSchema);