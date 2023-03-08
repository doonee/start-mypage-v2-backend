const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    groupNo: {
      type: Number,
      required: true,
    },
    categoryNo: {
      type: Number,
      required: true,
    },
    bookmarkNo: {
      type: Number,
      required: true,
      unique: true,
    },
    bookmarkName: String,
    bookmarkUri: String,
    sortNo: Number,
    isImportant: Boolean,
    isLineThrough: Boolean,
    memo: String
  },
  { timestamps: false, collection: "bookmarks" }
);

const Bookmarks = mongoose.model("bookmarks", bookmarkSchema);

module.exports = { Bookmarks };
