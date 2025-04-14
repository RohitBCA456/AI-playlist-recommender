import express from "express";
import userRouter from "./routes/user.route.js";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "https://spotify-frontend-lemon.vercel.app",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept", "Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/user", userRouter);

export { app };
