const router = require("express").Router();
const verifyTokenAndGetUser = require("./verifyToken");
const Product = require("../models/Product");



router.post("/", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin) {
    
    const newProduct = new Product(req.body);
    
   
    try {
      const savedProduct = await newProduct.save();
      return res.status(200).json(savedProduct);
    } catch (err) {
    
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});


router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedProduct);
    } catch (err) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internel server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});


router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json("Product has been deleted...");
    } catch (err) {
      return res
        .status(500)
        .json({ errors: [{ msg: "internal server error" }] });
    }
  }
  res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
});


router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});


router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const div = req.query.division
 

  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
        division: {
          $in: [div],
        },
      });
    } else {
      products = await Product.find();
    }

    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

module.exports = router;
