const Task = require("../models/Task");

exports.getRisk = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const tasks = await Task.find({ projectId }).populate("assignedTo", "name");

    const risks = [];
    const today = new Date();

   
    tasks.forEach(task => {
      if (task.dueDate && task.dueDate < today && task.status !== "done") {
        risks.push(`Task "${task.title}" is overdue`);
      }
    });

   
    tasks.forEach(task => {
      const lastUpdate = new Date(task.updatedAt || task.createdAt);
      const diffDays = (today - lastUpdate) / (1000 * 60 * 60 * 24);

      if (diffDays > 3 && task.status !== "done") {
        risks.push(`Task "${task.title}" is stuck for ${Math.floor(diffDays)} days`);
      }
    });

   
    const userLoad = {};

    tasks.forEach(task => {
      if (task.assignedTo) {
        const user = task.assignedTo.name;
        userLoad[user] = (userLoad[user] || 0) + 1;
      }
    });

    Object.entries(userLoad).forEach(([user, count]) => {
      if (count > 5) {
        risks.push(`${user} is overloaded with ${count} tasks`);
      }
    });

    res.json({
      totalRisks: risks.length,
      risks
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};