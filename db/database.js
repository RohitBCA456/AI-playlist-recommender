import mongoose from "mongoose";

const connectDB = async (req, res) => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URL}/${process.env.DB_NAME}`,
    );
    console.log(
      "Connected to the database... || HOSTNAME: ",
      connectionInstance.connection.host
    );
  } catch (error) {
          console.error("Error connecting to the database: ", error);
        res.status(500).send("Server error, could not connect to the database.");
  }
};

export { connectDB };
