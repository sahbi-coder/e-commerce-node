const Wishlist = require("../models/Wishlist");
const verifyTokenAndGetUser = require("./verifyToken");
const router = require("express").Router();
router.post("/", async (req, res) => {
  const newWhishlist = new Wishlist(req.body);

  try {
    const savedList = await newWhishlist.save();
    res.status(200).json(savedList);
  } catch (err) {
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
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.id);
    return res.status(200).json("Whishlist has been deleted...");
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/find/:userId", verifyTokenAndGetUser, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    return res.status(200).json(wishlist);
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.get("/", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.iAdmin) {
    try {
      const wishlist = await Wishlist.find();
      return res.status(200).json(wishlist);
    } catch (err) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});

module.exports = router;
