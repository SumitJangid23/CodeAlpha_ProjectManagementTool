const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createComment,
  getCommentsByTask
} = require("../controllers/commentController");

router.post("/", auth, createComment);
router.get("/:taskId", auth, getCommentsByTask);

module.exports = router;