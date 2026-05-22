import express from "express";
import jwt from "jsonwebtoken";

export function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  console.log("=== 🚀 AUTH MIDDLEWARE ထဲ ရောက်လာပြီ ===");
  const authHeader = req.headers.authorization;
  console.log("ပို့လိုက်တဲ့ Header:", authHeader);

  const token = (authHeader as string)?.split(" ")[1];
  console.log("ဖြတ်ထုတ်လိုက်တဲ့ Token:", token);

  if (!token) {
    console.log("❌ Token မပါလာလို့ ပယ်ချလိုက်ပြီ");
    return res.status(401).json({ message: "access token is required" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string);
    console.log("✅ Token မှန်ကန်တယ်၊ User Data:", user);
    res.locals.user = user;
    next();
  } catch (e) {
    console.log("❌ JWT Verify လုပ်တာ ကျသွားပြီ (Invalid Token):", e);
    return res.status(401).json({ message: "invalid token" });
  }
}
