import { prisma } from "../libs/prisma";
import express from "express";
import nodemailer from "nodemailer";
import multer from "multer";

export const router = express.Router();

// Multer ကို Memory Storage သုံးရန် Setup လုပ်ခြင်း
const upload = multer({ storage: multer.memoryStorage() });

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aungphyokhant.official@gmail.com",
    pass: "noyd epri eofn pizx", // App Password
  },
});

// --- ၁။ User: Booking တင်ခြင်း (ပုံကို Base64 String အဖြစ်သိမ်းမည်) ---
router.post("/reservations", upload.single("paymentScreenshot"), async (req, res) => {
  try {
    const { bookingDate, bookingTime, guestsCount, guestName, phoneNumber, email, selectedMenu, specialNotes, agreedToTerms } = req.body;

    const guests = Number(guestsCount);

    // ပုံကို Base64 ပြောင်းခြင်း
    let base64Image = null;
    if (req.file) {
      base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
    }

    // ဧည့်သည် ၆ ယောက်ထက်ကျော်ပြီး ငွေလွှဲပုံမပါရင် Error ပေးမယ်
    if (guests >= 6 && !base64Image) {
      return res.status(400).json({ message: "ဧည့်သည် ၆ ယောက်နှင့်အထက်အတွက် ငွေလွှဲမှတ်တမ်း တင်ပေးရန် လိုအပ်ပါသည်။" });
    }

    const newReservation = await prisma.reservation.create({
      data: {
        bookingDate,
        bookingTime,
        guestsCount: guests,
        guestName,
        phoneNumber,
        email,
        selectedMenu,
        specialNotes,
        agreedToTerms: String(agreedToTerms) === "true",
        // ဘယ်နှစ်ယောက်ဖြစ်ဖြစ် အစမှာ pending ပဲထားမယ်
        status: "pending",
        paymentScreenshot: base64Image ? String(base64Image) : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: "ဘွတ်ကင်တင်ခြင်း အောင်မြင်ပါသည်။ Admin မှ အတည်ပြုပေးပါမည်။",
      data: newReservation,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({ message: "Server Error ဖြစ်နေပါသည်။" });
  }
});

// --- ၂။ Admin: ဘွတ်ကင်စာရင်းကြည့်ရန် ---
router.get("/reservations", async (req, res) => {
  try {
    const list = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    });

    // ပုံက String အနေနဲ့ရှိနေပြီးသားမို့လို့ map လုပ်စရာမလိုဘဲ တန်းပို့လို့ရပါတယ်
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ message: "Error fetching data" });
  }
});

// --- ၃။ Admin: Status Update (Confirm/Reject) ---
router.patch("/reservations/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.reservation.update({
      where: { id: Number(id) },
      data: { status },
    });

    if (status === "confirmed") {
      const mailOptions = {
        from: '"Harlan Restaurant" <aungphyokhant.official@gmail.com>',
        to: updated.email,
        subject: "✨ Reservation Confirmed - Harlan Restaurant",
        html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
      <!-- Header -->
      <div style="background-color: #000; padding: 20px; text-align: center;">
        <h1 style="color: #ffc107; margin: 0; letter-spacing: 2px; font-weight: 300;">HARLAN</h1>
        <p style="color: #ffffff; font-size: 12px; margin-top: 5px; text-transform: uppercase;">Premium Dining Experience</p>
      </div>

      <!-- Body -->
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: #333; margin-bottom: 20px;">Mingalaba, ${updated.guestName}!</h2>
        <p style="color: #555; line-height: 1.6; font-size: 16px;">
          လူကြီးမင်း၏ Reservation ကို အတည်ပြုပြီးကြောင်း ဝမ်းမြောက်စွာ အသိပေးအပ်ပါသည်။ ကျွန်ုပ်တို့ ဆိုင်သို့ လာရောက်ရန် ဖိတ်ခေါ်အပ်ပါသည်။
        </p>

        <!-- Booking Details Table -->
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Date:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${updated.bookingDate}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Time:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${updated.bookingTime}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #888; font-size: 14px;">Guests:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${updated.guestsCount} Persons</td>
            </tr>
          </table>
        </div>

        <p style="color: #d9534f; font-size: 13px; font-style: italic;">
          * သတိပြုရန်- ဘွတ်ကင်အချိန်ထက် ၁၅ မိနစ် နောက်ကျပါက ဘွတ်ကင်ကို အလိုအလျောက် ပယ်ဖျက်သွားမည် ဖြစ်ပါသည်။
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f4f4f4; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
        <p style="color: #888; font-size: 12px; margin: 0;">
          Harlan Restaurant, Yangon, Myanmar<br>
          Phone: +95 9 123 456 789
        </p>
      </div>
    </div>
    `,
      };
      await transporter.sendMail(mailOptions);
    }

    return res.json({ message: "Status updated successfully", data: updated });
  } catch (err) {
    return res.status(500).json({ message: "Update failed" });
  }
});

// --- ၄။ Admin: Delete ---
router.delete("/reservations/:id", async (req, res) => {
  try {
    await prisma.reservation.delete({ where: { id: Number(req.params.id) } });
    return res.json({ message: "Deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Delete failed" });
  }
});
