
const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orders:[{

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
        
        },
      
      ],
  
      address: {
        type: String,
      },
      phone: {
        type: Object,
        countryCode: { type: String },
        number: {
          type: Number,
        },
      },
      status: {
        type: String,
        default: "pending",
      },
      createdAt:{
        type:Date,
        default: new Date()
      }
    }],
   
  },{timestamps:true}
  
);
module.exports = mongoose.model("Order", orderSchema);
