const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    name: {
      first: { type: String, required: true },
      last: { type: String, required: true },
    },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    geolocation: {
      type: { type: String, default: "Point" },
      coordinates: {
        type: [Number], // [Longitude, Latitude]
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", UserSchema);
module.exports = User;
