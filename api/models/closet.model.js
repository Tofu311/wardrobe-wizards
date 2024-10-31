const mongoose = require("mongoose");

const ClothingItemSchema = new mongoose.Schema({
  imagePath: { type: String, required: true },
  type: { type: String, required: true },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String },
  otherColors: [String],
  material: { type: String, required: true },
  temperature: { type: String, required: true },
  description: { type: String },
});

const ClosetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [ClothingItemSchema],
});

const Closet = mongoose.model("Closet", ClosetSchema);
module.exports = Closet;
