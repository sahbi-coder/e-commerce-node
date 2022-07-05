const express = require("express");
const CryptoJS = require("crypto-js");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");

const initAccount = async (res, userParams) => {
  let userId = "";
  let user = null;
  let order = null;
  let cart = null;
  let wishlist = null;
  const newUser = new User(userParams);
  try {
    user = await newUser.save();
    userId = user._id.toString();
  } catch {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
    return;
  }
  try {
    const newOrder = new Order({
      userId,
    });
    const newCart = new Cart({ userId });

    const newWishlist = new Wishlist({ userId });
    order = newOrder.save();
    cart = newCart.save();
    wishlist = newWishlist.save();
    res.status(201).json(user);
  } catch {
    User.deleteOne({ _id: userId });
    Order.deleteOne({ userId });
    Cart.deleteOne({ userId });
    Wishlist.deleteOne({ userId });
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
};

router.post(
  "/register",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 5 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.find({
      $or: [{ name: req.body.name }, { email: req.body.email }],
    });
    if (user.length) {
      return res.status(400).json({ errors: [{ msg: "invalid credentials" }] });
    }
    // const newUser = new User({
    //   name: req.body.name,
    //   email: req.body.email,
    //   password: CryptoJS.AES.encrypt(
    //     req.body.password,
    //     process.env.USER_PASSWORD_SEC_HASH_PHRASE
    //   ).toString(),
    // });
    // try {
    //   const savedUser = await newUser.save();

    //   res.status(201).json(savedUser);
    // } catch (e) {
    //   res.status(500).json(e);
    // }
    initAccount(res, {
      name: req.body.name,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.USER_PASSWORD_SEC_HASH_PHRASE
      ).toString(),
    });
  }
);
router.post(
  "/login",
  [body("email").isEmail(), body("password").isLength({ min: 5 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: [{ msg: "invalid credentials" }] });
    }
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const decretedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.USER_PASSWORD_SEC_HASH_PHRASE
      ).toString(CryptoJS.enc.Utf8);

      if (decretedPassword !== req.body.password) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }
      const { password, ...others } = user._doc;

      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SEC_HASH_PHRASE,
        { expiresIn: "3d" }
      );

      return res.status(200).json({ ...others, token });
    }
    res.status(400).json({ errors: [{ msg: "invalid credentials" }] });
  }
);

module.exports = router;
