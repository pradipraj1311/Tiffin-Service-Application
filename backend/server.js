const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const tiffinRoutes = require("./routes/tiffinRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/tiffins", tiffinRoutes);
app.use("/api/orders", orderRoutes);

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
