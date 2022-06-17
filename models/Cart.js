const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
     
    },
   products: {
     type:Array
   }
}
);
module.exports = mongoose.model('Cart',cartSchema);