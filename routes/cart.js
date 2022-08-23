const Cart = require("../models/Cart");
const verifyTokenAndGetUser = require("./verifyToken");
const router = require("express").Router();

router.post("/", async (req, res) => {
  try {
    const newCart = new Cart(req.body);
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    console.log(err);
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedCart);
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    return res.status(200).json("Cart has been deleted...");
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/find/:userId", verifyTokenAndGetUser, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    return res.status(200).json(cart);
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user&&req.user.iAdmin) {
      const carts = await Cart.find();
      return res.status(200).json(carts);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

module.exports = router;
