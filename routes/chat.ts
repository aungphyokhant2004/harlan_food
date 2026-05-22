import { prisma } from "../libs/prisma";
import express from "express";

export const router = express.Router();

// 📥 ၁။ Admin Dashboard အတွက် Chat Rooms အားလုံး ဆွဲထုတ်ရန် API
// (GET http://localhost:5000/api/chat/rooms)
router.get("/rooms", async (req, res) => {
  try {
    const rooms = await prisma.chatRoom.findMany({
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// 📥 ၂။ User (Guest) ဘက်မှ Website ကနေ စာစပို့လျှင် Room ရှိမရှိစစ်ပြီး စာသိမ်းပေးမည့် API
// (POST http://localhost:5000/api/chat/guest/start)
router.post("/guest/start", async (req, res) => {
  const { guestName, phoneNumber, text } = req.body;
  try {
    // ဖုန်းနံပါတ်တူတဲ့ Room ရှိပြီးသားလား အရင်စစ်မယ်
    let room = await prisma.chatRoom.findFirst({
      where: { phoneNumber },
    });

    // မရှိသေးရင် Room အသစ်ဆောက်မယ်
    if (!room) {
      room = await prisma.chatRoom.create({
        data: { guestName, phoneNumber },
      });
    }

    // မက်ဆေ့ခ်ျကို သိမ်းမယ်
    const message = await prisma.message.create({
      data: {
        roomId: room.id,
        senderType: "GUEST",
        text,
      },
    });

    // Room ရဲ့ ဝင်စာထွက်စာ အချိန်ကို Update လုပ်မယ်
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ room, message });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

// 💥 မှတ်ချက် - Admin ဆီက စာပို့တာကိုတော့ ပုံမှန် API နဲ့ မသွားတော့ဘဲ
// Socket.io ရဲ့ "send_message" event ကနေ တိုက်ရိုက် သိမ်းပြီး Live ဖြန့်ပေးမှာဖြစ်လို့
// ဒီ router ထဲမှာ sendMessage API ဆောက်ပေးစရာ မလိုတော့ပါဘူးဗျာ။

export default router;
