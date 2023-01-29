const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    userId: String,
    groupNo: Number,
    categoryNo: Number,
    categoryName: String,
    sortNo: Number,
    isImportant: Boolean,
    isLinethrough: Boolean,
    memo: String
  },
  { timestamps: true, collection: "categories" }
);

const Categories = mongoose.model("categories", categorySchema);

module.exports = { Categories };
