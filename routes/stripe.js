const router = require("express").Router();
require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST);
const bodyParser = require("body-parser");
const verifyTokenAndGetUser = require("./verifyToken");
const Product = require("../models/Product");


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.post("/", verifyTokenAndGetUser, async (req, res) => {
  const { amountArray, id } = req.body;
  const amountStringifyed = JSON.stringify(amountArray);
  const amountParsed = JSON.parse(amountStringifyed);


  const ids = [...amountParsed].reduce((pre, acc) => {
    pre.push(acc.productId);
    return pre;
  }, []);
 
  const products = await Product.find({ _id: { $in: ids } });
  
  const amount = [...amountParsed].reduce((pre, acc, index) => {
    const i = products.reduce((p, c, i) => {
		
      if (acc.productId==c._id) {
        return i;
      }
      return p;
    }, 0);
	

    return pre + acc.amount * products[i].price * 1000;
  }, 0);
  
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Spatula company",
      payment_method: id,
      confirm: true,
    });
    console.log("Payment", amount);
    res.json({
      message: `you 've paid $${amount/1000} with success .`,
      success: true,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment failed",
      success: false,
    });
  }
});

module.exports = router;
