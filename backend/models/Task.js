const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,

    boardId: mongoose.Schema.Types.ObjectId,
    projectId: mongoose.Schema.Types.ObjectId,

    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],

   
    status: {
      type: String,
      enum: ["todo", "in-progress", "done"],
      default: "todo"
    },

   
    dueDate: Date,

   
    timeSpent: { type: Number, default: 0 },
    timerStartedAt: { type: Date, default: null }
  },
  {
   
    timestamps: true
  }
);

module.exports = mongoose.model("Task", taskSchema);