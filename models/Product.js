const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    img: {
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
    stock: {
      color: String,
      inStock: [
        {
          size: {
            type: String,
          },
          count: {
            type: Number,
          },
        },
      ],
    },
    division: {
      type: String,
      default: "men",
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Product", productSchema);
