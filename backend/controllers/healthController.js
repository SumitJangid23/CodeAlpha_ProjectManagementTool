const Task = require("../models/Task");

exports.getHealth = async (req, res) => {
  try {
    const projectId = req.params.projectId;

   
   const tasks = await Task.find({
  project: projectId  
}).populate("assignedTo", "name");

    const totalTasks = tasks.length;

   
    const completedTasks = tasks.filter(t => t.status === "done").length;

   
    const completionRate =
      totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

   
   const now = new Date();

const overdueTasks = tasks.filter(
  t =>
    t.dueDate &&
    new Date(t.dueDate) < now &&
    t.status !== "done"
).length;

   
    const userLoad = {};
tasks.forEach(task => {
  if (task.assignedTo && task.assignedTo.length > 0) {
    const user = task.assignedTo[0].name;
    userLoad[user] = (userLoad[user] || 0) + 1;
  }
});

    const loads = Object.values(userLoad);

    let imbalanceScore = 0;

    if (loads.length > 1) {
      const max = Math.max(...loads);
      const min = Math.min(...loads);
      imbalanceScore = (max - min) * 5;
    }

   
    let healthScore = completionRate;

   
    healthScore -= overdueTasks * 5;

   
    healthScore -= imbalanceScore;

   
    if (healthScore < 0) healthScore = 0;
    if (healthScore > 100) healthScore = 100;

   
    let status = "Good";

    if (healthScore < 40) status = "At Risk";
    else if (healthScore < 70) status = "Average";

   
    let message = "";

    if (status === "At Risk") {
      message = "Project needs attention ";
    } else if (status === "Average") {
      message = "Project is progressing ";
    } else {
      message = "Project is healthy ";
    }

   
    res.json({
      healthScore: Math.round(healthScore),
      status,
      message,
      details: {
        totalTasks,
        completedTasks,
        completionRate: Math.round(completionRate),
        overdueTasks,
        imbalanceScore
      }
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};