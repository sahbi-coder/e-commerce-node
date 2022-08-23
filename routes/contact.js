const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const { body, validationResult } = require("express-validator");

router.post(
  "/",
  [
    body("email").isEmail(),
    body("name").isLength({ min: 5 }),
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

      const constactPatams = req.body;

      let transporter = nodemailer.createTransport({
        service: "outlook",
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      let info = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: "sahbikardipl@gmail.com",
        subject: "myFashion new contact",
        text: `contact name: ${constactPatams.name}  
          \n contact email: ${constactPatams.email}  
          \n contact message: ${constactPatams.message}`,
      });
      res.status(200).json(info);
    } catch (e) {
     
      res.status(500).json({ errors: [{ msg: "internal server error" }] });
    }
  }
);
module.exports = router;
