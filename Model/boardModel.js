const mongoose = require("mongoose");

const boardSchema = new mongoose.Schema(
  {
    idx: {
      type: Number,
      required: true,
      unique: true,
    },
    title: String,
    content: String,
    writer: String,
    createdAt: Date
  },
  { timestamps: true, collection: "board" }
);

const Board = mongoose.model("board", boardSchema);

module.exports = { Board };
