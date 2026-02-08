import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks: cross-site scripting
    sameSite: ENV.NODE_ENV === "development" ? "strict" : "none", // "none" for cross-origin (Vercel ↔ Render)
    secure: ENV.NODE_ENV === "development" ? false : true, // required when sameSite="none"
  });

  return token;
};

// http://localhost
// https://dsmakmk.com
