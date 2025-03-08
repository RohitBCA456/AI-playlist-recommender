import express from "express";
import dotenv from "dotenv";
import userRouter from "./routes/user.route.js";
import cors from "cors";
dotenv.config({ path: "./.env" });
const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["POST"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRouter);
export { app };
