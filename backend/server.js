const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./src/confing/db");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/test", (req, res) => {
  res.status(200).json({ message: "Tiffin Service API is running perfectly!" });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error("Starting without MongoDB:", error.message);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
