import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// ✅ ALLOW BOTH LOCAL + VERCEL FRONTEND (FIX)
const allowedOrigins = [
  "http://localhost:5173",
  "https://chatify-gamma-one.vercel.app"
];

app.use(express.json({ limit: "5mb" })); // req.body

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(null, false);
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const frontendDist = path.join(__dirname, "../frontend/dist");

if (ENV.NODE_ENV === "production") {
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) return next();
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  } else {
    app.get("/", (_, res) => {
      res.set("Content-Type", "text/html");
      res.send(`
        <!DOCTYPE html>
        <html><head><meta charset="utf-8"><title>Chatify API</title></head>
        <body style="font-family:sans-serif;max-width:600px;margin:2rem auto;padding:1rem;background:#1e293b;color:#e2e8f0;">
          <h1>Chatify API</h1>
          <p>Backend is running. Use the frontend to sign in:</p>
          <p><a href="https://chatify-gamma-one.vercel.app" style="color:#818cf8;">chatify-gamma-one.vercel.app</a></p>
          <p><small>API: /api/auth, /api/messages</small></p>
        </body></html>
      `);
    });
  }
}

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  console.log("🌐 Allowed CORS origins:", allowedOrigins);
  console.log("🔐 Environment:", ENV.NODE_ENV);
  connectDB();
});
