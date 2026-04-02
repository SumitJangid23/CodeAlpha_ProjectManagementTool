const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const {
  createBoard,
  getBoards
} = require("../controllers/boardController");

router.post("/", auth, createBoard);
router.get("/:projectId", auth, getBoards);

module.exports = router;