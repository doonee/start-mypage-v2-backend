const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    idx: Number,
    title: String,
    content: String,
    writer: String,
    createdAt: Date
  },
  { timestamps: true, collection: "board" }
);

const Board = mongoose.model("board", boardSchema);

module.exports = { Board };
