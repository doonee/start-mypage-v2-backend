const mongoose = require("mongoose");

const counter2Schema = new mongoose.Schema(
  {
    name: String,
    postNumber: Number,
  },
  { collection: "counter2" }
);

const Counter2 = mongoose.model("Counter2", counter2Schema);

module.exports = { Counter2 };
