import "dotenv/config";

const rawClientUrl = process.env.CLIENT_URL || "";
const corsOrigins = rawClientUrl
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

export const ENV = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  /** CORS: array of allowed origins (supports comma-separated CLIENT_URL for multiple frontends) */
  CORS_ORIGINS: corsOrigins.length > 0 ? corsOrigins : ["http://localhost:5173"],
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  ARCJET_KEY: process.env.ARCJET_KEY,
  ARCJET_ENV: process.env.ARCJET_ENV,
};
