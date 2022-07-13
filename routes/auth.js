const express = require("express");
const CryptoJS = require("crypto-js");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Order = require("../models/Order");
const Wishlist = require("../models/Wishlist");
const Cart = require("../models/Cart");
const nodemailer = require("nodemailer");

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
    try {
      const user = await User.find({
        $or: [{ name: req.body.name }, { email: req.body.email }],
      });
      if (user.length) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }
    } catch {
      return res.status(500).json({ errors: [{ msg:"internal server error" }] });
    }

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
    try{

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
    catch{
      res.status(400).json({ errors: [{ msg: "internal server error" }] });
    }
  }
);
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user && user.email === req.body.email) {
      const sec = process.env.JWT_SEC_HASH_PHRASE + user.password;
      const payload = {
        email: user.email,
        id: user._id.toString(),
      };
      const token = jwt.sign(payload, sec, { expiresIn: "1200s" });
      const link = `http://localhost:3000/forgot-password/${user._id.toString()}/${token}`;

      let transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      let info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "reset myFashion password",
        text: link,
      });

      return res.json({ msg: "we sent transaction email" }).status(200);
    }
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  } catch (e) {
    
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.post("/forgot-password/:id/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.id });
    if (!user) {
      return res.send("invalid id");
    }
    const sec = process.env.JWT_SEC_HASH_PHRASE + user.password;
    const payload = jwt.verify(req.params.token, sec);

    const encreptedPassword = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.USER_PASSWORD_SEC_HASH_PHRASE
    ).toString();

    const updatedUser = await User.findByIdAndUpdate(
      req.body.id,
      {
        $set: {
          password: encreptedPassword,
        },
      },
      { new: true }
    );
    res.json(updatedUser).status(200);
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

module.exports = router;
