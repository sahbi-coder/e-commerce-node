const mongoose = require("mongoose");
const WishlistSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
   
    },
    products: [
      {
        productId: { type: String },
        title: { type: String },
        img: { type: String },
        price:{type:Number}
      },
    ],
  },{timestamps:true}
);
module.exports = mongoose.model("Wishlist", WishlistSchema);
