const router = require("express").Router();
const auth = require("../middleware/authMiddleware");

const { getRisk } = require("../controllers/riskController");

router.get("/:projectId", auth, getRisk);

module.exports = router;