const mongoose = require("mongoose");

const errorSchema = new mongoose.Schema(
  {
    idx: {
      type: Number,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: false, // 비로그인 사용자일 수도 있으므로...
      unique: false, // 비로그인 사용자일 수도 있으므로...
    },
    fullMessage: Object
  },
  { timestamps: true, collection: "errors" }
);

const Errors = mongoose.model("errors", errorSchema);

module.exports = { Errors };
