const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    idx: {
      type: Number,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    userPass: {
      type: String,
      required: true,
    },
    createdAt: Date
  },
  { timestamps: true, collection: "users" }
);

const Users = mongoose.model("users", userSchema);

module.exports = { Users };
