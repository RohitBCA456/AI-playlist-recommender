import express from "express";
import userRouter from "./routes/user.route.js";
import cors from "cors";

const app = express();
app.use(cors({
  origin: "https://yourmoodplaylist.netlify.app", // Your frontend URL
  credentials: true, // Allow cookies to be sent with requests
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Accept", "Authorization"], // Allowed headers
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRouter);

export { app };
