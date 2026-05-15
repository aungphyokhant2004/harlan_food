import express from "express";
import jwt from "jsonwebtoken";

export function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  // token ကို ယူတာ
  // 'as string' ကို ထည့်ပေးလိုက်ပါ
  const token = (req.headers.authorization as string)?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "access token is required" });
  }
  // token ကို တိုက်စစ်မယ်
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
    };

    //မှန်လို့ရှိရင် res ရဲ့ locals user မှာ ရလာတဲ့ user ကို သိမ်းထားပါတယ်။
    res.locals.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ message: "invalid token" });
  }
}
