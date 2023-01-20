const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    idx: Number,
    userId: String,
    userPass: String,
    createdAt: Date
  },
  { timestamps: true, collection: "users" }
);

const Users = mongoose.model("users", userSchema);

module.exports = { Users };
