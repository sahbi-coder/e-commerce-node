const verifyTokenAndGetUser = require("./verifyToken");
const User = require("../models/User");
const router = require("express").Router();

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.params.id === req.user.id || req.user.isAdmin) {
      const updatedUser = await User.updateOne(
        { id: req.params.id },
        { $set: req.body }
      );
      return res.status(200).json(updatedUser);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorizer" }] });
  } catch (e) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin || req.user.id === req.params.id) {
      const deletedUser = await User.deleteOne({ id: req.params.id });

      return res.status(200).json(deletedUser);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch (e) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const users = await User.find()
      return res.status(200).json(users);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch (e) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});
//GET USER STATS

router.get("/stats", verifyTokenAndGetUser, async (req, res) => {
  try {
    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (eq.user.isAdmin || req.user.id === req.params.id) {
      const fetchedUser = await User.findOne({ id: req.params.id });

      return res.status(200).json(fetchedUser);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch (e) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});
module.exports = router;
