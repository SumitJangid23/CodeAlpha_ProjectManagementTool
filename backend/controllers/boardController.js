const Board = require("../models/Board");


exports.createBoard = async (req, res) => {
  try {
    const board = await Board.create({
      title: req.body.title,
      projectId: req.body.projectId
    });

    res.json(board);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


exports.getBoards = async (req, res) => {
  try {
    const boards = await Board.find({
      projectId: req.params.projectId
    });

    res.json(boards);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};