const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const { getHealth } = require("../controllers/healthController");

router.get("/:projectId", auth, getHealth);

module.exports = router;