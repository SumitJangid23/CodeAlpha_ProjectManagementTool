const Task = require("../models/Task");

exports.getWorkload = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const tasks = await Task.find({ projectId })
      .populate("assignedTo", "name");

    const workload = {};

    tasks.forEach((task) => {
      if (task.assignedTo && task.assignedTo.length > 0) {
        const userName = task.assignedTo[0].name;

        workload[userName] =
          (workload[userName] || 0) + (task.timeSpent || 0);
      }
    });

    const users = Object.keys(workload).map((name) => ({
      name,
      time: workload[name],
    }));

   
    let minUser = null;
    let minTime = Infinity;

    users.forEach((u) => {
      if (u.time < minTime) {
        minTime = u.time;
        minUser = u.name;
      }
    });

    res.json({
      users,
      suggestion: minUser
        ? `Assign next task to ${minUser}`
        : "No users found",
    });

  } catch (err) {
    console.error("❌ WORKLOAD ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};