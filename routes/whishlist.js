const Wishlist = require("../models/Wishlist");
const verifyTokenAndGetUser = require("./verifyToken");
const router = require("express").Router();
router.post("/", async (req, res) => {
  try {
    const newWhishlist = new Wishlist(req.body);
    const savedList = await newWhishlist.save();
    res.status(200).json(savedList);
  } catch {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    const updatedList = await Wishlist.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json(updatedList);
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    return res.status(200).json("Whishlist has been deleted...");
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/find/:userId", verifyTokenAndGetUser, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    return res.status(200).json(wishlist);
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.iAdmin) {
      const wishlist = await Wishlist.find();
      return res.status(200).json(wishlist);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

module.exports = router;
