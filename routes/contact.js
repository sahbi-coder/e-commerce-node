const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Message = require("../models/Message");
const verifyTokenAndGetUser = require("./verifyToken");

router.post(
  "/",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 11 }),
    body("message").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ errors: [{ msg: "invalid credentials" }] });
      }

      const constactParams = req.body;

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",

        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_APP_PASSWORD,
        },
      });

      const output = `   
      <p>Dear ${constactParams.name}</p>
      <p>We've got your message and we will get in touch with you within the next 24 hours.</p>
      <p>sincerely</p>
      <p>MyFashion team</p>
     `;

      const info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: constactParams.email,
        subject: "myFashion auto response",
        html: output,
      });
      const message = new Message({
        content: constactParams.message,
        email: constactParams.email,
        sender: constactParams.name,
        viewed: false,
      });
      await message.save();
      res.status(200).json(info);
    } catch (e) {
      res.status(500).json({ errors: [{ msg: "internal server error" }] });
    }
  }
);

router.get("/messages", verifyTokenAndGetUser, async function (req, res) {
  try {
    if (req.user.isAdmin) {
      const messages = await Message.find().sort({createdAt:-1});
      res.status(200).json(messages);
      return;
    }

    res.status(401).json({ message: "you are not autherized" });
  } catch (e) {
   
    res.status(500).json({ message: "internal server error" });
  }
});
router.put("/messages/:id", verifyTokenAndGetUser, async function (req, res) {
  try {
    if (req.user.isAdmin) {
      const message = await Message.findByIdAndUpdate(
        req.params.id,
        {
          $set: { viewed: true },
        },
        { new: true }
      );
      res.status(200).json(message);
      return;
    }

    res.status(401).json({ message: "you are not autherized" });
  } catch (e) {
    
    res.status(500).json({ message: "internal server error" });
  }
});
module.exports = router;
