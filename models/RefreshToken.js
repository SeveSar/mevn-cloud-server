const { Schema, model, Types } = require("mongoose");
const RefreshToken = new Schema({
  refreshToken: { required: true, type: String },
  user: { type: Types.ObjectId, ref: "User" },
});

module.exports = model("RefreshToken", RefreshToken);
