const express = require("express");
const CryptoJS = require("crypto-js");
const User = require("../models/User");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

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
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: CryptoJS.AES.encrypt(
        req.body.password,
        process.env.USER_PASSWORD_SEC_HASH_PHRASE
      ).toString(),
    });
    try {
      const savedUser = await newUser.save();

      res.status(201).json(savedUser);
    } catch (e) {
      res.status(500).json(e);
    }
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
