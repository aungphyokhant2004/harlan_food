import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http"; // 🚀 အသစ်ထည့်ရမည်
import { Server } from "socket.io"; // 🚀 အသစ်ထည့်ရမည်
import { prisma } from "./libs/prisma"; // 🚀 အစ်ကို့ prisma လမ်းကြောင်းအတိုင်း သေချာပေးပါ

// Routes Imports
import { router as LoginRouter } from "./routes/login";
import { router as HoursRouter } from "./routes/hours";
import { router as GalleryRouter } from "./routes/gallerys";
import { router as ContactRouter } from "./routes/contacts";
import { router as ReservationRouter } from "./routes/reservations";
import { router as ForgetRouter } from "./routes/forget";
import { router as CategoryRouter } from "./routes/category";
import { router as ItemRouter } from "./routes/item";
import { router as ChatRouter } from "./routes/chat"; 

const app = express();

// 🚀 Socket.io အတွက် Express app ကို HTTP Server ပြောင်းလဲဖန်တီးခြင်း
const server = http.createServer(app);

// 🚀 Socket.io Server အား CORS ခွင့်ပြုချက်ဖြင့် ဆောက်ခြင်း
const io = new Server(server, {
  cors: {
    origin: "*", // စမ်းသပ်ဆဲကာလတွင် အားလုံးခွင့်ပြုထားခြင်း (လိုအပ်က frontend port ပေးပါ ဥပမာ- http://localhost:5173)
    methods: ["GET", "POST"]
  }
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes Middlewares
app.use(ReservationRouter);
app.use(CategoryRouter);
app.use(ItemRouter);
app.use(ContactRouter);
app.use(GalleryRouter);
app.use(HoursRouter);
app.use(LoginRouter);
app.use(ForgetRouter);

// 🚀 Chat API အတွက် Prefix ခံပြီး ချိတ်ဆက်ခြင်း
// ဒါကြောင့် front-end က စာဟောင်းဖတ်ရင် http://localhost:8800/api/chat/rooms ကို ခေါ်ရပါမယ်
app.use("/api/chat", ChatRouter);

app.get("/", (req, res) => {
  res.json({ message: "Food-API up and running..." });
});

// ─── 🚀 SOCKET.IO REAL-TIME LOGIC (ဒီနေရာတွင် ရေးရပါမည်) ───
// ─── 🚀 SOCKET.IO REAL-TIME LOGIC (ဒီနေရာတွင် ရေးရပါမည်) ───
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // User သို့မဟုတ် Admin စကားပြောခန်းထဲဝင်လျှင် သတ်မှတ် Room ID ထဲ သီးသန့်ထည့်ခြင်း
  socket.on("join_room", (roomId) => {
    socket.join(roomId.toString());
    console.log(`User joined room: ${roomId}`);
  });

  // ၁။ Admin သို့မဟုတ် User က စာပို့လိုက်သည့်အချိန်
  socket.on("send_message", async (data) => {
    const { roomId, senderType, text } = data;
    try {
      const newMessage = await prisma.message.create({
        data: { 
          roomId: Number(roomId), 
          senderType, 
          text 
        }
      });

      await prisma.chatRoom.update({
        where: { id: Number(roomId) },
        data: { updatedAt: new Date() }
      });

      io.to(roomId.toString()).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Socket Message Save Error:", err);
    }
  });

  // 📝 ၂။ မက်ဆေ့ခ်ျကို ပြန်ပြင်သည့်အချိန် (Edit Message)
  socket.on("edit_message", async (data) => {
    const { id, roomId, text } = data; // id က Message ID ဖြစ်ပါတယ်
    try {
      // Prisma သုံးပြီး DB ထဲက မက်ဆေ့ခ်ျကို သွားပြင်မယ်
      const updatedMessage = await prisma.message.update({
        where: { id: Number(id) },
        data: { text: text }
      });

      // ထို Room ထဲကလူတွေအားလုံးဆီ စာပြင်သွားကြောင်း Live ပို့မယ်
      io.to(roomId.toString()).emit("message_edited", updatedMessage);
      console.log(`Message Edited in room ${roomId}: ${text}`);
    } catch (err) {
      console.error("Socket Message Edit Error:", err);
    }
  });

  // 🗑️ ၃။ မက်ဆေ့ခ်ျတစ်ခုချင်းစီကို ဖျက်သည့်အချိန် (Delete Message)
  socket.on("delete_message", async (data) => {
    const { roomId, messageId } = data;
    try {
      // Prisma နဲ့ DB ထဲက မက်ဆေ့ခ်ျကို ဖျက်မယ်
      await prisma.message.delete({
        where: { id: Number(messageId) }
      });

      // Frontend ဘက်က UI မှာပါ တန်းပျောက်သွားအောင် လှမ်းပြောမယ်
      io.to(roomId.toString()).emit("message_deleted", { roomId, messageId });
      console.log(`Message Deleted: ${messageId} from room ${roomId}`);
    } catch (err) {
      console.error("Socket Message Delete Error:", err);
    }
  });

  // ❌ ၄။ Chat Room တစ်ခုလုံးကို ဖျက်ပစ်သည့်အချိန် (Delete User Room)
  socket.on("delete_room", async (roomId) => {
    try {
      // 💡 အရေးကြီးချက်: Prisma မှာ Cascade Delete မခံထားရင် 
      // Room မဖျက်ခင် သူနဲ့သက်ဆိုင်တဲ့ မက်ဆေ့ခ်ျတွေကို အရင် အကုန်ဖျက်ပေးရပါမယ်
      await prisma.message.deleteMany({
        where: { roomId: Number(roomId) }
      });

      // ပြီးမှ Chat Room ကို ဖျက်မယ်
      await prisma.chatRoom.delete({
        where: { id: Number(roomId) }
      });

      // Server ထဲက Client အားလုံး (Admin ရော User ပါ) ဆီ Room ပျက်သွားကြောင်း အသိပေးမယ်
      io.emit("room_deleted", Number(roomId));
      console.log(`Chat Room Deleted Entirely: ${roomId}`);
    } catch (err) {
      console.error("Socket Room Delete Error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

// 💥 အရေးကြီးသတိပြုရန် - app.listen မသုံးရတော့ပါ!
// Socket အလုပ်လုပ်ဖို့အတွက် စောစောက ဆောက်ခဲ့တဲ့ server.listen ကို ပြောင်းသုံးရပါမယ်။
server.listen(8800, () => {
  console.log("Server is running on port 8800 with Socket.io...");
});