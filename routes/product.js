const router = require("express").Router();
const verifyTokenAndGetUser = require("./verifyToken");
const Product = require("../models/Product");

router.post("/", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const newProduct = new Product(req.body);

      const savedProduct = await newProduct.save();
      return res.status(200).json(savedProduct);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch (err) {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

router.put("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      return res.status(200).json(updatedProduct);
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch {
    return res.status(500).json({ errors: [{ msg: "internel server error" }] });
  }
});

router.delete("/:id", verifyTokenAndGetUser, async (req, res) => {
  try {
    if (req.user.isAdmin) {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(200).json("Product has been deleted...");
    }
    res.status(401).json({ errors: [{ msg: "you are not authorized" }] });
  } catch {
    return res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
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
  try {
    const qCategory = req.query.category;
    const div = req.query.division;

    let colors = [];
    let products = [];

    if (qCategory && (div === "men" || div === "women")) {
      const unfilteredColors = await Product.aggregate([
        { $unwind: "$categories" },
        { $match: { categories: qCategory, division: div } },
        { $unwind: "$color" },
        {
          $group: {
            _id: "c",
            colors: { $push: "$color" },
          },
        },
      ]);
      colors = [...new Set(unfilteredColors[0].colors)];
  
    
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
        division: {
          $in: [div],
        },
      });
    } else if (qCategory) {
      const unfilteredColors = await Product.aggregate([
        { $unwind: "$categories" },
        { $match: { categories: qCategory } },
        { $unwind: "$color" },
        {
          $group: {
            _id: "c",
            colors: { $push: "$color" },
          },
        },
      ]);
      colors = [...new Set(unfilteredColors[0].colors)];
      
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find().sort({'createdAt':1}).limit(8);
    
    }
 
    res.status(200).json({ products, colors });
  } catch (err) {
    res.status(500).json({ errors: [{ msg: "internal server error" }] });
  }
});

module.exports = router;
