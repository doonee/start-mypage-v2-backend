const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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
      unique: true,
    },
    categoryName: String,
    sortNo: Number,
    isImportant: Boolean,
    isLineThrough: Boolean,
    isPublic: Boolean,
    memo: String
  },
  { timestamps: true, collection: "categories" }
);

const Categories = mongoose.model("categories", categorySchema);

module.exports = { Categories };
