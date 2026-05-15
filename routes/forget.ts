// backend/routes/auth.js (ဥပမာ)
import nodemailer from "nodemailer";
import crypto from "crypto";
import { Router } from "express";
import { prisma } from "../libs/prisma";
import bcrypt from "bcrypt";

export const router = Router();

router.post("/forget", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "ဤ Email နဲ့ User မရှိပါ။" });

    // ၁။ Token ထုတ်ခြင်း
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.adminUser.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // ၂။ Email ပို့ခြင်း (App Password သုံးရန် မမေ့ပါနှင့်)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "aungphyokhant.official@gmail.com",
        pass: "noyd epri eofn pizx", // Gmail App Password ၁၆ လုံး
      },
    });

    const resetUrl = `http://localhost:5173/reset/${resetToken}`;

    const mailOptions = {
      from: '"Harlan Restaurant" <your-email@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h3>Password ပြန်ယူရန် တောင်းဆိုမှု</h3>
          <p>အောက်ပါ Link ကို နှိပ်ပြီး Password အသစ် ပြောင်းလဲနိုင်ပါသည်။ (၁ နာရီအတွင်းသာ အကျုံးဝင်ပါသည်)</p>
          <a href="${resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">အကယ်၍ သင် တောင်းဆိုထားခြင်း မဟုတ်ပါက ဤ Email ကို လျစ်လျူရှုလိုက်ပါ။</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password Reset Link ကို Email သို့ ပို့ပေးလိုက်ပါပြီ။" });
  } catch (error) {
    console.log("Forgot Password Error:", error);
    res.status(500).json({ message: "လုပ်ဆောင်ချက် မှားယွင်းနေပါသည်။" });
  }
});

router.post("/reset/:token", async (req, res) => {
  const { token } = req.params;
  const { password, email } = req.body;

  try {
    // ၁။ Email နဲ့ Token နှစ်ခုလုံးနဲ့ တိုက်စစ်ပြီး ရှာပါ
    const user = await prisma.adminUser.findFirst({
      where: {
        email: email,
        resetToken: token,
      },
    });

    // ၂။ User မရှိရင် (Email မှားတာ ဒါမှမဟုတ် Token မကိုက်တာ)
    if (!user) {
      return res.status(400).json({ message: "Email သို့မဟုတ် Reset Link မှားယွင်းနေပါသည်။" });
    }

    // ၃။ Token သက်တမ်းကုန်၊ မကုန် စစ်ပါ (Optional Chaining သုံးထားပါတယ်)
    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return res.status(400).json({ message: "Reset link သက်တမ်းကုန်သွားပါပြီ။" });
    }

    // ၄။ အားလုံးမှန်ကန်ရင် Password အသစ်ကို Hash လုပ်ပြီး သိမ်းပါ
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.adminUser.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    res.json({ message: "Password update လုပ်ခြင်း အောင်မြင်ပါသည်။" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error ဖြစ်ပွားခဲ့ပါသည်။" });
  }
});
