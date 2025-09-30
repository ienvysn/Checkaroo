const express = require("express");
const mongoose = require("mongoose");
const itemRoutes = require("./routes/items");
const authRoutes = require("./routes/auth");
const groupRoutes = require("./routes/group");
const activityRoutes = require("./routes/activity");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = 5000;
const MONGO_URI = "mongodb://localhost:27017/sharelist";

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Express server and MongoDB are running!");
});

app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/groups/:groupId/activities", activityRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
