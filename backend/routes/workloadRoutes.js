const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const { getWorkload } = require("../controllers/workloadController");

router.get("/:projectId", auth, getWorkload);

module.exports = router;