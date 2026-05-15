import express from "express";
const app = express();
app.use(express.json());
app.use(express.urlencoded());

import cors from "cors";
app.use(cors());

import path from "path";
import { router as LoginRouter } from "./routes/login";
import { router as HoursRouter } from "./routes/hours";
import { router as GalleryRouter } from "./routes/gallerys";
import { router as ContactRouter } from "./routes/contacts";
import { router as ReservationRouter } from "./routes/reservations";
import { router as ForgetRouter } from "./routes/forget";
import { router as CategoryRouter } from "./routes/category";
import { router as ItemRouter } from "./routes/item";

// အပေါ်ဆုံးမှာ path ကို import လုပ်ပါ
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🔥 လမ်းကြောင်းတစ်ခုချင်းစီကို prefix တပ်ပေးပါ (ဒါမှ စနစ်တကျ ရှိမှာပါ)
// index.js ထဲက route ချိတ်တဲ့အပိုင်းကို ဒီလိုပြင်ပါ
app.use(ReservationRouter);
app.use(CategoryRouter);
app.use(ItemRouter);
app.use(ContactRouter);
app.use(GalleryRouter);
app.use(HoursRouter);
app.use(LoginRouter);
app.use(ForgetRouter); // ဒီနေရာမှာ /api/auth ခံလိုက်ပါ
// ... ကျန်တဲ့ ကုဒ်များ ...

app.get("/", (req, res) => {
  res.json({ message: "Food-API up and running..." });
});

app.listen(8800, () => {
  console.log("Server is running on port 8800...");
});
