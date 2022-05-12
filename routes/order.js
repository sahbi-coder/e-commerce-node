const Order = require("../models/Order");
const verifyTokenAndGetUser = require("./verifyToken");
const router = require("express").Router();

router.post("/", verifyTokenAndGetUser, async (req, res) => {
  const newOrder = new Order(req.body);

  try {
    const savedOrder = await newOrder.save();
    res.status(200).json(savedOrder);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedOrder);
    } catch (err) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }

});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {

    try {
      await Order.findByIdAndDelete(req.params.id);
      return res.status(200).json("Order has been deleted...");
    } catch (err) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  

});

router.get("/find/:userId", verifyTokenAndGetUser, async (req, res) => {
  
    try {
      const orders = await Order.find({ userId: req.params.userId });
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ errors: [{ msg: "internal server error" }] });
    }
  
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const orders = await Order.find();
      return res.status(200).json(orders);
    } catch (err) {
      return res.status(500).json({ errors: [{ msg: "internal server error" }] });
    }
  }
   return res.status(401).json({ errors: [{ msg: "you are not autherized" }] });
});
// GET MONTHLY INCOME

router.get("/income", verifyTokenAndGetUser, async (req, res) => {
  const productId = req.query.pid;
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
 
  
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: previousMonth },
          ...(productId && {
            products: { $elemMatch: { productId } },
          }),
        },
      },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
