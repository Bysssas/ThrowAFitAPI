import Item from "../models/Item.js";

// GET all items or by category
export const getItems = async (req, res, category) => {
  try {
    let items;
    if (category) {
      items = await Item.find({ category }); // filter by category
    } else {
      items = await Item.find(); // get all items
    }
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST a new item
export const createItem = async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const newItem = await Item.create({ name, price, category, imageUrl });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
