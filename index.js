import app from "./app.js";
import { connectDB } from "./db/database.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

try {
  connectDB()
    .then(() => {
      app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
      });
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
      process.exit(1);
    });
} catch (error) {
  console.error("Unexpected error:", error);
  process.exit(1);
}
