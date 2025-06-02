import express from "express";
import playlistRouter from "./routes/playlist.router.js";
import userRouter from "./routes/user.router.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
const app = express();
app.use(
  cors({
    origin: "https://spotify-frontend-lemon.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Authorization"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/playlist", playlistRouter);
app.use("/user", userRouter);

export { app };
