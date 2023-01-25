const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    idx: Number,
    userId: String,
    startGroupIdx: Number,
    appTitle: String,
    theme: String,
    isTargetBlank: Boolean,
    isBasicSort: Boolean
  },
  { timestamps: false, collection: "configs" }
);

const Configs = mongoose.model("configs", configSchema);

module.exports = { Configs };
