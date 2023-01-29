const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    userId: String,
    groupNo: Number,
    groupName: String,
    sortNo: Number,
    isImportant: Boolean,
    isLinethrough: Boolean,
    isPublic: Boolean,
    memo: String,
  },
  { timestamps: true, collection: "groups" }
);

const Groups = mongoose.model("groups", groupSchema);

module.exports = { Groups };
