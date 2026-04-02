const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema({
  title: String,
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project"
  }
});

module.exports = mongoose.model("Board", boardSchema);