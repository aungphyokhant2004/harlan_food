import { prisma } from "../libs/prisma";
import express from "express";
import { auth } from "../middleware/auth";
// import multer from "multer";
// import path from "path";
// import fs from "fs";

export const router = express.Router();

// // --- Multer Configuration ---
// const uploadDir = "uploads/";
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// --- 1. GET ALL (Categories with Items) ---
router.get("/categories", async (req, res) => {
  try {
    const data = await prisma.menuCategory.findMany({
      include: {
        menuItems: true, // Dropdown ထဲမှာပြဖို့ item list
        _count: {
          select: { menuItems: true }, // Badge ထဲမှာပြဖို့ အရေအတွက်
        },
      },
      orderBy: { id: "asc" },
    });
    res.json(data);
  } catch (error) {
    console.error("GET Error:", error);
    res.status(500).json({ error: "Data ဆွဲယူ၍ မရပါ" });
  }
});

router.get("/categories/:id", async (req, res) => {
  try {
    const data = await prisma.menuCategory.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        menuItems: true,
      },
    });
    res.json(data);
  } catch (error) {
    console.error("GET Error:", error);
    res.status(500).json({ error: "Data ဆွဲယူ၍ မရပါ" });
  }
});

// --- Admin Routes ---

router.post("/categories", auth, async (req, res) => {
  const { name, image } = req.body;

  if (!name || !image) {
    return res.status(400).json({ error: "name, image and adminUserId are required" });
  }

  try {
    const userId = res.locals.user.id;
    const category = await prisma.menuCategory.create({
      data: {
        name: name,
        image: image,
        userId: userId,
      },
      include: {
        menuItems: true,
      },
    });
    res.json(category);
  } catch (error) {
    console.error("POST Error:", error);
    res.status(500).json({ error: "Data သိမ်းဆည်း၍ မရပါ" });
  }
});

router.put("/categories/:id", auth, async (req, res) => {
  const { id } = req.params;
  const { name, image } = req.body;
  if (!name && !image) {
    return res.status(400).json({ error: "name and image are required" });
  }
  try {
    const category = await prisma.menuCategory.updateMany({
      where: {
        id: Number(id),
      },
      data: {
        name: name,
        image: image,
      },
    });

    if (category.count === 0) {
      return res.status(404).json({ msg: "Category not found or you do not have permission to update it" });
    }
    res.json(category);
  } catch (error) {
    console.error("PUT Error:", error);
    res.status(500).json({ error: "Data သိမ်းဆည်း၍ မရပါ" });
  }
});

router.delete("/categories/:id", auth, async (req, res) => {
  const categoryId = Number(req.params.id);
  const userId = res.locals.user.id;

  try {
    const category = await prisma.menuCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ msg: "Category not found" });
    }

    await prisma.menuCategory.delete({
      where: { id: categoryId },
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE Error:", error);
    res.status(500).json({ error: "Data သိမ်းဆည်း၍ မရပါ" });
  }
});
