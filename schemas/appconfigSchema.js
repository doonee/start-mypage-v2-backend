const mongoose = require("mongoose");

const appconfigSchema = new mongoose.Schema(
  {
    skins: Array,
    targets: Array,
  },
  { timestamps: false, collection: "app_config" }
);

const AppConfig = mongoose.model("app_config", appconfigSchema);

module.exports = { AppConfig };
