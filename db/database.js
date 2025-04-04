import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbURL = `${process.env.MONGO_URL}?retryWrites=true&w=majority&ssl=true/${process.env.DB_NAME}`;
    
    const connectionInstance = await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 50000,
      connectTimeoutMS: 50000,
    });

    console.log("Connected to the database... || HOSTNAME:", connectionInstance.connection.host);
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1);
  }
};

export { connectDB };
