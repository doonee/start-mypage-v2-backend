const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    userId: String,
    password: Number,
  },
  { timestamps: true, collection: "users" }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
