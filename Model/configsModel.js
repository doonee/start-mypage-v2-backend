const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    userId: String,
    startGroupIdx: Number,
    pageTitle: String,
    theme: String,
    isTargetBlank: Boolean,
    isBasicSort: Boolean
  },
  { timestamps: false, collection: "configs" }
);

const Configs = mongoose.model("configs", configSchema);

module.exports = { Configs };
