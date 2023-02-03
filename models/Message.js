const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
     
    },
    sender: {
        type: String,
        required: true,
       
    },
    email:{
      type: String,
      required: true,
    },
    viewed: {
      default: false,
      type: Boolean,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Message", messageSchema);
