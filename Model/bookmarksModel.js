const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: String,
    groupNo: Number,
    categoryNo: Number,
    bookmarkNo: Number,
    bookmarkName: String,
    bookmarkUri: String,
    sortNo: Number,
    isPublic: Boolean
  },
  { timestamps: false, collection: "bookmarks" }
);

const Bookmarks = mongoose.model("bookmarks", bookmarkSchema);

module.exports = { Bookmarks };
