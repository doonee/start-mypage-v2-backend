const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    groupNo: {
      type: Number,
      required: true,
      unique: true,
    },
    groupName: String,
    sortNo: Number,
    isImportant: Boolean,
    isLineThrough: Boolean,
    isPublic: Boolean,
    memo: String,
  },
  { timestamps: true, collection: "groups" }
);

const Groups = mongoose.model("groups", groupSchema);

module.exports = { Groups };
