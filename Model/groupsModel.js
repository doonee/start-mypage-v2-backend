const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    userId: String,
    groupNo: Number,
    groupName: String,
    sortNo: Number,
    isPublic: Boolean,
    IsImportant: Boolean,
    IsLinethrough: Boolean,
    Memo: String,
  },
  { timestamps: true, collection: "groups" }
);

const Groups = mongoose.model("groups", groupSchema);

module.exports = { Groups };
