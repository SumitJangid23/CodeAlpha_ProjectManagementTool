const Task = require("../models/Task");


exports.createTask = async (req, res) => {
  try {
   
    if (req.user.role !== "manager") {
      return res.status(403).json({
        message: "Only manager can create tasks"
      });
    }

    const { title, assignedTo, projectId, dueDate } = req.body;

    if (!projectId) {
      return res.status(400).json({ message: "Project ID missing" });
    }

    const task = await Task.create({
      title,
      assignedTo,
      projectId: projectId,
      dueDate,
    });

    const io = req.app.get("io");
    if (io) {
      io.to(projectId).emit("taskCreated", task);
    }

    res.status(201).json(task);

  } catch (err) {
    console.error("❌ TASK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      boardId: req.params.boardId
    }).populate("assignedTo", "name email");

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.moveTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { boardId: req.body.boardId },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.startTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: "Task not found" });
    }

    task.timerStartedAt = new Date();
    await task.save();

    res.json({ message: "Timer started", task });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
exports.stopTimer = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task.timerStartedAt) {
      return res.status(400).json({ msg: "Timer not started" });
    }

    const diff = (new Date() - task.timerStartedAt) / 1000;
task.timeSpent = (task.timeSpent || 0) + diff;
    task.timerStartedAt = null;

    await task.save();

   
    const minutes = Math.floor(task.timeSpent / 60);
const hours = Math.floor(task.timeSpent / 3600);
    res.json({
      message: "Timer stopped",
      timeInSeconds: task.timeSpent,
      timeInMinutes: minutes,
      timeInHours: hours,
      task
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      projectId: req.params.id,
    })
      .populate("assignedTo", "name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(task);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};