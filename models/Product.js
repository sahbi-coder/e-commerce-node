const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    size: {
      type: Array,
    },
    color: {
      type: Array,
    },
    categories: {
      type: Array,
    },
    inStock:{
      type:Boolean,
      default:true
    }
  },
  { timestamps: true }
);
module.exports = mongoose.model('Product',productSchema);
