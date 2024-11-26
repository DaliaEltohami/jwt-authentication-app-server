require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRouter = require("./routes/userRoutes");
const path = require("path");
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// MongoDB Connection
const connectionString = "mongodb://127.0.0.1:27017/user-auth";
mongoose.connect(process.env.MONGO_URI || connectionString).then(() => {
  console.log("MongoDB Connected Successfully");
});

console.log(path.join(__dirname, "public", "index.html"));

// API routes
app.use("/api/auth", userRouter);

// Handle Files serving in production environment
if (process.env.NODE_ENV === "production") {
  console.log(path.join(__dirname, "public", "index.html"));

  app.use(express.static(path.join(__dirname, "public")));

  app.use("*", (req, res) => (req, res) => {
    console.log("Received request for:", req.path);
    res.send(path.join(__dirname, "public", "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("API Running");
  });
}

// Global Error Handler
app.use(async (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server Running on Port", PORT);
});
