

const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); 


router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Category name is required" });
    }


    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(409).json({ message: "Category already exists" });
    }

    const category = new Category({ name });
    await category.save();


    res.status(201).json({
      id: category._id,
      name: category.name,
      bookCount: 0,
      status: "active",
    });
  } catch (error) {
    console.error("Category creation error:", error);
    res.status(500).json({ message: "Server error while adding category" });
  }
});


router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    const formatted = categories.map(cat => ({
      id: cat._id,
      name: cat.name,
      bookCount: cat.bookCount || 0,
      status: "active",
    }));
    res.status(200).json(formatted);
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

module.exports = router;
