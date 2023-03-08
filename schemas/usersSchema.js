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
      required: false, // 소셜로 가입할 수 있으므로
      unique: true,
    },
    userPass: {
      type: String,
      required: false, // 소셜로 가입할 수 있으므로
    },
    provider: {
      type: String,
      enum: ['local', 'kakao', 'naver', 'google'],
      default: 'local',
      required: true
    },
    snsId: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, collection: "users" }
);

const Users = mongoose.model("users", userSchema);

module.exports = { Users };
