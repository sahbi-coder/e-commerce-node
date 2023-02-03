require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const user = require("./routes/user");
const auth = require("./routes/auth");
const cart = require("./routes/cart");
const order = require("./routes/order");
const product = require("./routes/product");
const whishlist = require("./routes/whishlist");
const payment = require("./routes/stripe");
const contact = require("./routes/contact");

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

async function connectToDb() {
  const connector = await mongoose
    .connect(process.env.MONGO_CONNECTION_STRING)
    .then(() => {
      console.log("connected to db");
    })
    .catch((e) => {
      console.log(e);
    });
}
connectToDb();
app.use("/api/users", user);
app.use("/api/carts", cart);
app.use("/api/auth", auth);
app.use("/api/orders", order);
app.use("/api/products", product);
app.use("/api/wishlists", whishlist);
app.use("/api/payments", payment);
app.use("/api/contact", contact);
app.listen(process.env.PORT || 5000, () => {
  console.log("server is listening on port 5000");
});

module.exports = app
