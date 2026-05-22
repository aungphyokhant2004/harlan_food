import express from "express";
import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { auth } from "../middleware/auth";

export const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email နှင့် Password ထည့်သွင်းရန် လိုအပ်ပါသည်" });
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email သို့မဟုတ် Password မှားယွင်းနေပါသည်" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is missing in .env file");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      message: "Login အောင်မြင်ပါသည်",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.password,
        lastLogin: user.lastLogin,
        cratedAt: user.createdAt,
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

router.post("/change-password", auth, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // ၁။ Inputs အားလုံး ဖြည့်ထားခြင်း ရှိ/မရှိ စစ်မယ်
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "အချက်အလက်များ အပြည့်အစုံ ဖြည့်စွက်ပေးပါ" });
    }

    // ၂။ Password အသစ်နှစ်ခု ကိုက်ညီမှု ရှိ/မရှိ စစ်မယ်
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Password အသစ်နှင့် အတည်ပြု Password မကိုက်ညီပါ" });
    }

    // ၃။ 🎯 ဖြေရှင်းချက်: Token ထဲမှာ 'userId' လို့ ပါလာတဲ့အတွက် ဒီအတိုင်း ယူရပါမယ်
    const userId = res.locals.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "ဦးစွာ အကောင့်ဝင်ရောက်ပါ (Unauthorized)" });
    }

    // ၄။ 🎯 ဖြေရှင်းချက်: Database မှာ ရှာဖွေတဲ့အခါမှာလည်း userId နဲ့ ရှာပေးပါမယ်
    const user = await prisma.adminUser.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      return res.status(404).json({ message: "အသုံးပြုသူအား ရှာမတွေ့ပါ" });
    }

    // ၅။ User ရိုက်လိုက်တဲ့ currentPassword နဲ့ Database ထဲက user.password ကို တိုက်စစ်တယ်
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "လက်ရှိအသုံးပြုနေသော Password မှားယွင်းနေပါသည်" });
    }

    // ၆။ တူတယ်ဆိုမှ Password အသစ်ကို Hash လုပ်ပြီး Update လုပ်ခွင့်ပေးမယ်
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    // 🎯 ဖြေရှင်းချက်: ဒီနေရာမှာလည်း userId ကို သုံးပြီး update လုပ်ရပါမယ်
   const updatedUser =  await prisma.adminUser.update({
      where: { id: Number(userId) },
      data: { password: hashedConfirmPassword, lastLogin: new Date() },
    });

    return res.status(200).json({
       message: "Password အောင်မြင်စွာ လဲလှယ်ပြီးပါပြီ။" ,
       success: true,
        user: {
        id: user.id,
        email: user.email,
        password: user.password,
        lastLogin: user.lastLogin,
        cratedAt: user.createdAt,
      },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "ဆာဗာပိုင်းဆိုင်ရာ အမှားအယွင်းရှိနေပါသည်" });
  }
});
