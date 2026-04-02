const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createTask,
  getTasks,
  moveTask,
  startTimer,
  stopTimer,
  getTasksByProject,
  updateTask,     
  deleteTask      
} = require("../controllers/taskController");

router.post("/", auth, createTask);


router.get("/project/:id", auth, getTasksByProject);

router.get("/:boardId", auth, getTasks);
router.put("/:id", auth, updateTask);    
router.delete("/:id", auth, deleteTask);
router.put("/:id/move", auth, moveTask);
router.put("/:id/start", auth, startTimer);
router.put("/:id/stop", auth, stopTimer);

module.exports = router;