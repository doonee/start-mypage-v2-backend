const mongoose = require("mongoose");

const configSchema = new mongoose.Schema(
  {
    idx: {
      type: Number,
      required: true,
      unique: true,
    },
    user: {
      type: String,
      required: true,
      unique: true,
    },
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
