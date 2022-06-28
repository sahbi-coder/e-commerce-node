const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  products: [
    {
      productId: { type: String },
      amount: {
        type: Number,
        default: 1,
      },
    },
  ],

  address: {
    type: String,
  },
  phone: [
    {
      contryCode: { type: Number, default: 1 },
      number: {
        type: Number,
      },
    },
  ],
  status: {
    type: String,
    default: "pending",
  },
});
module.exports = mongoose.model("Order", orderSchema);
