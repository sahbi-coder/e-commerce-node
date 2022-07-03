const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
       
    },
    products: [
      {
        productId: {
          type: String,
          
        },
        amount: {
          type: Number,
        },
        size: {
          type: String,
        },
        color: {
          type: String,
        },
        price: {
          type: Number,
        },
        img: {
          type: String,
        },
      }
    ],
  },{timestamps:true}
);
module.exports = mongoose.model("Cart", cartSchema);
