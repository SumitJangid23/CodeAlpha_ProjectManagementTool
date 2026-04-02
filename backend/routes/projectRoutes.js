const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const Project = require("../models/Project");

const {
  createProject,
  getProjects,
  addMember
} = require("../controllers/projectController");

router.post("/", auth, createProject);
router.get("/", auth, getProjects);
router.post("/:id/add-member", auth, addMember);


router.put("/:id", auth, async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id, 
      { title: req.body.title }, 
      { new: true }
    );
    
    if (!updatedProject) return res.status(404).json({ message: "Project not found" });
    
    res.json(updatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;