import { prisma } from "../libs/prisma";
import express from "express";
import { auth } from "../middleware/auth";
import multer from "multer";
import path from "path";
import fs from "fs";

export const router = express.Router();

// --- Helper: ဖိုင်လမ်းကြောင်း သတ်မှတ်ရန် ---
const getFullPath = (dbUrl: string) => {
  const cleanPath = dbUrl.startsWith("/") ? dbUrl.slice(1) : dbUrl;
  return path.join(process.cwd(), cleanPath);
};

// --- Multer Storage ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads/gallery/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}).single("file"); // Route ထဲမှာ manual handle လုပ်ဖို့ single ကို ဒီမှာ ခွဲထုတ်ထားလိုက်မယ်

// --- 1. Upload Route ---
router.post("/gallery", auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: "Upload Error: " + err.message });
    }

    try {
      const { title, category } = req.body;
      if (!req.file) return res.status(400).json({ message: "ဖိုင်ရွေးချယ်ပါ" });

      const isVideo = req.file.mimetype.startsWith("video");
      const newItem = await prisma.galleryItem.create({
        data: {
          title: title || req.file.originalname,
          type: isVideo ? "VIDEO" : "IMAGE",
          url: `/uploads/gallery/${req.file.filename}`,
          category: category || "General",
        },
      });

      return res.status(201).json(newItem); // Response ပြန်တာ သေချာစေရမယ်
    } catch (dbError: any) {
      return res.status(500).json({ message: "Database Error: " + dbError.message });
    }
  });
});

// --- 2. Edit Route ---
router.put("/gallery/:id", auth, (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { id } = req.params;
      const { title, category } = req.body;

      const oldItem = await prisma.galleryItem.findUnique({ where: { id: Number(id) } });
      if (!oldItem) return res.status(404).json({ message: "ရှာမတွေ့ပါ။" });

      let updateData: any = {
        title: title || oldItem.title,
        category: category || oldItem.category,
      };

      if (req.file) {
        // ဖိုင်ဟောင်းဖျက်ခြင်း (Error မတက်အောင် try-catch ခံထားသင့်တယ်)
        try {
          const oldFilePath = getFullPath(oldItem.url);
          if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
        } catch (e) {
          console.log("File deletion failed:", e);
        }

        updateData.url = `/uploads/gallery/${req.file.filename}`;
        updateData.type = req.file.mimetype.startsWith("video") ? "VIDEO" : "IMAGE";
      }

      const updated = await prisma.galleryItem.update({
        where: { id: Number(id) },
        data: updateData,
      });

      return res.json(updated);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });
});

// --- 3. Delete Route ---
router.delete("/gallery/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const item = await prisma.galleryItem.findUnique({ where: { id: Number(id) } });

    if (!item) return res.status(404).json({ message: "ရှာမတွေ့ပါ။" });

    try {
      const filePath = getFullPath(item.url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch (e) {
      console.log("File system error:", e);
    }

    await prisma.galleryItem.delete({ where: { id: Number(id) } });
    return res.json({ message: "ဖျက်ပြီးပါပြီ။" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
});

// --- 4. Get All Route ---
router.get("/gallery", async (req, res) => {
  try {
    const items = await prisma.galleryItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching items" });
  }
});
