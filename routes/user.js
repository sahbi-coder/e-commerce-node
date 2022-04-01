const verifyTokenAndGetUser = require("./verifyToken");
const User = require("../models/User");
const router = require("express").Router();

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  if (req.params.id === req.user.id || req.user.isAdmin) {
    try {
      const updatedUser = await User.updateOne(
        { id: req.params.id },
        { $set: req.body }
      );
      return res.status(200).json(updatedUser);
    } catch (e) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorizer" }] });
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin || req.user.id === req.params.id) {
    try {
      const deletedUser = await User.deleteOne({ id: req.params.id });

      return res.status(200).json(deletedUser);
    } catch (e) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});

router.get("/:id", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin || req.user.id === req.params.id) {
    try {
      const fetchedUser = await User.findOne({ id: req.params.id });

      return res.status(200).json(fetchedUser);
    } catch (e) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const limit = req.body.limit ? req.body.limit : 5;
      const users = await User.find().limit(limit);

      return res.status(200).json(users);
    } catch (e) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});

module.exports = router;
