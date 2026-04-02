const Task = require("../models/Task");

exports.getProjectAnalytics = async (req, res) => {
  try {
    const projectId = req.params.projectId;

   
    const tasks = await Task.find({
      project: projectId,
    }).populate("assignedTo", "name");

   
    const totalTasks = tasks.length;

   
    const completedTasks = tasks.filter(
      (t) => t.status === "done"
    ).length;

   
    const pendingTasks = totalTasks - completedTasks;

   
    const statusCounts = {
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in-progress").length,
      done: completedTasks,
    };

   
    const userCount = {};

    tasks.forEach((task) => {
      if (task.assignedTo && task.assignedTo.length > 0) {
        const name = task.assignedTo[0].name;
        userCount[name] = (userCount[name] || 0) + 1;
      }
    });

    let mostActiveUser = null;
    let max = 0;

    for (let user in userCount) {
      if (userCount[user] > max) {
        max = userCount[user];
        mostActiveUser = user;
      }
    }

   
    const completionRate =
      totalTasks === 0
        ? 0
        : Math.round((completedTasks / totalTasks) * 100);

   
    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate,
      mostActiveUser,
      statusCounts,
      tasks
    });

  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ msg: err.message });
  }
};