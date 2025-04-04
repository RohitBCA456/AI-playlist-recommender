import app from "./app.js";
import { connectDB } from "./db/database.js";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Server error", error);
      process.exit(1);
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to the database...", err);
    process.exit(1);
  });