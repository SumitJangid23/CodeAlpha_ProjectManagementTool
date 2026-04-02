const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const { text, taskId } = req.body;

    const comment = await Comment.create({
      text,
      task: taskId,      
      user: req.user.id  
    });

    const populated = await comment.populate("user", "name");

   
    const io = req.app.get("io");
    io.emit("newComment", populated);

    res.json(populated);

  } catch (err) {
    console.error("❌ COMMENT ERROR:", err);
    res.status(500).json({ msg: err.message });
  }
};

exports.getCommentsByTask = async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId  
    }).populate("user", "name");

    res.json(comments);
  } catch (err) {
    console.error("❌ GET COMMENTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};