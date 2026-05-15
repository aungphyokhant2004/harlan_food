import { prisma } from "../libs/prisma";
import express from "express";
import { auth } from "../middleware/auth";

export const router = express.Router();

// ---2. GET ALL THE ITEMS
router.get("/items", async (req, res) => {
  try {
    const data = await prisma.menuItem.findMany({
      include: {
        menuCategory: true,
      },
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch (error) {
    console.error("GET Error:", error);
    res.status(500).json({ error: "Data ဆွဲယူ၍ မရပါ" });
  }
});

router.get("/items/:id", async (req, res) => {
  try {
    const data = await prisma.menuItem.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        menuCategory: true,
      },
    });
    res.json(data);
  } catch (error) {
    console.error("GET Error:", error);
    res.status(500).json({ error: "Data ဆွဲယူ၍ မရပါ" });
  }
});

// --- Admin Routes ---

router.post("/items", auth, async (req, res) => {
  const { name, price, image, categoryId } = req.body;
  if (!name || !price || !image || !categoryId) {
    return res.status(400).json({ error: "name,  price, image and categoryId are required" });
  }

  try {
    const categroryExists = await prisma.menuCategory.findUnique({
      where: { id: Number(categoryId) },
    });

    if (!categroryExists) {
      return res.status(400).json({ error: "Category မရှိပါ။ Category အရင်တည်ဆောက်ပေးပါ သို့မဟုတ် ID မှန်ကန်စွာရွေးချယ်ပါ" });
    }

    const item = await prisma.menuItem.create({
      data: {
        name,
        price: Number(price),
        image,
        menuCategoryId: Number(categoryId),
      },
    });
    res.json(item);
  } catch (error) {
    console.error("POST Error:", error);
    res.status(500).json({ error: "Data သိမ်းဆည်း၍ မရပါ" });
  }
});

router.put("/items/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { name, price, image, categoryId } = req.body;

  if (!name && !price && !image && !categoryId) {
    return res.status(400).json({ error: "name, description, price, image and categoryId are required" });
  }
  try {
    const item = await prisma.menuItem.update({
      where: {
        id: Number(id),
      },

      data: {
        name,
        price: Number(price),
        image,
        menuCategoryId: Number(categoryId),
      },
    });

    if (item === null) {
      return res.status(404).json({ msg: "Item not found or you do not have permission to update it" });
    }
    res.json(item);
  } catch (error) {
    console.error("PUT Error:", error);
    res.status(500).json({ error: " သင်ရွေးချယ်ထားသော items မှာ မရှိပါ, ပြန်လည်ရွေးချယ်ပါ" });
  }
});

router.delete("/items/:id", auth, async (req, res) => {
  const itemId = Number(req.params.id);

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ msg: "Item not found" });
    }

    await prisma.menuItem.delete({
      where: { id: itemId },
    });

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    res.status(500).json({ error: "Data သိမ်းဆည်း၍ မရပါ" });
  }
});
