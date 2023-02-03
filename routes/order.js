const Order = require("../models/Order");
const verifyTokenAndGetUser = require("./verifyToken");
const router = require("express").Router();

router.post("/", verifyTokenAndGetUser, async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    const savedOrder = await newOrder.save();
    return res.status(200).json(savedOrder);
  } catch (e) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  const regexCode = /^.{1,13}$/;
  const regexNumber = /^[0-9]{5,20}$/;
  const regexAddress = /^.{5,50}$/;

  try {  
    if (req.user.isAdmin) {
      const order = req.body.order;
      const userOrders = await Order.findOne({ userId: req.params.id });
      const orders = userOrders.orders;
      const index = orders.reduce(function (pre, acc, index) {
        if (acc._id.toString() === order._id) {
          return index;
        }
        return pre;
      }, 0);

      orders[index].status = order.status;
      userOrders.orders = orders;
      const savedOrders  =await userOrders.save();
      return res.status(200).json(savedOrders);
    }
    const orders = req.body.orders;

    const badRequest =
      orders.reduce((pre, order) => {
        if (
          regexCode.test(order.phone.countryCode) &&
          regexNumber.test(order.phone.number) &&
          regexAddress.test(order.address)
        ) {
          return pre + 1;
        }
        return pre;
      }, 0) !== orders.length;

    if (!badRequest) {
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );

      return res.status(200).json(updatedOrder);
    }
    return res.status(400).json({ errors: [{ msg: "bad request" }] });
  } catch (e) {
   
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    await Order.findById(req.params.id);
    return res.status(200).json({ message: "Order has been deleted..." });
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/find/:userId", verifyTokenAndGetUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(200).json(orders);
  } catch {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});
router.get("/findbyadmin/:userId", verifyTokenAndGetUser, async (req, res) => {
  try {
    const orders = await Order.aggregate([
      { $match: { userId: req.params.userId } },
      { $unwind: "$orders" },
      { $project: { orders: 1 } },
    ]);
    return res.status(200).json(orders);
  } catch {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.find();
      return res.status(200).json(orders);
    }
    return res
      .status(401)
      .json({ errors: [{ msg: "you are not autherized" }] });
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});
// GET MONTHLY INCOME

router.get("/income", verifyTokenAndGetUser, async (req, res) => {
  try {
    const productId = req.query.pid;
    const date = new Date();
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
    const previousMonth = new Date(
      new Date().setMonth(lastMonth.getMonth() - 1)
    );

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

router.get("/latest/:num", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const orders = await Order.aggregate([
        { $match: { orders: { $gt: [] } } },
        { $unwind: "$orders" },
        { $sort: { "orders.createdAt": 1 } },
        { $limit: parseInt(req.params.num) },
      ]);
      return res.status(200).json(orders);
    }
    return res
      .status(401)
      .json({ errors: [{ msg: "you are not autherized" }] });
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

module.exports = router;
