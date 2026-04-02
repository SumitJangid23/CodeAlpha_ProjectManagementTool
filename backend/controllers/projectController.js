const Project = require("../models/Project");


exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      title: req.body.title,
      description: req.body.description,
      createdBy: req.user.id,        
      members: [req.user.id]         
    });

    res.json(project);
  } catch (err) {
    console.error("PROJECT ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};


exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id
    }).populate("members", "name email");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    project.members.push(req.body.userId);

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};