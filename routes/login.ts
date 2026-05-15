import express from "express";
import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // ၁။ Validation: အချက်အလက် ပြည့်စုံမှု ရှိမရှိ အရင်စစ်မယ်
    if (!email || !password) {
      return res.status(400).json({ message: "Email နှင့် Password ထည့်သွင်းရန် လိုအပ်ပါသည်" });
    }

    // ၂။ User ရှာဖွေခြင်း
    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() }, // Email ကို
      // စာလုံးသေးပြောင်းပြီး space တွေဖြတ်စစ်တာ ပိုကောင်းပါတယ်
    });
    console.log(user);

    // ၃။ User မရှိခြင်း သို့မဟုတ် Password မှားခြင်း (လုံခြုံရေးအရ Message ကို တူတူပဲ ပေးသင့်ပါတယ်)
    if (!user) {
      return res.status(401).json({ message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်" });
    }

    // ၄။ JWT Secret ရှိမရှိ စစ်ဆေးခြင်း (Crash မဖြစ်အောင်)
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing in .env file");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // ၅။ Token ထုတ်ခြင်း
    // အချိန်ကို ၁ ရက် သတ်မှတ်ထားတာ အဆင်ပြေပါတယ်
    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "1d" });

    // ၆။ Response ပြန်ခြင်း
    // Password ကို response ထဲမှာ မပါသွားအောင် သေချာဖယ်ထုတ်ခဲ့ပါ
    return res.status(200).json({
      success: true,
      message: "Login အောင်မြင်ပါသည်",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.password, // အကယ်၍ Database မှာ name ပါရင် ထည့်ပေးလို့ရပါတယ်
      },
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return res.status(500).json({
      message: "ဆာဗာတွင် အမှားတစ်ခု ရှိနေပါသည်",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});
