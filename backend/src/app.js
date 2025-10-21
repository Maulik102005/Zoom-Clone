import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
// Create HTTP server
const server = createServer(app);
// Attach socket.io to HTTP server
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);
app.use(cors());
app.use(express.json({ limit: "40kb" })); //less payload; prevents attack
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);

const dbUrl = process.env.ATLASDB_URL;

// Test route
app.get("/home", (req, res) => {
  res.send("hello");
});

// Start server
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(dbUrl);

    console.log("MongoDB connected");

    server.listen(app.get("port"), () => {
      console.log("Listening on port 8000");
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

start();
