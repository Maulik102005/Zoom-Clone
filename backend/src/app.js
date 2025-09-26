import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

import { connectToSocket } from "./controllers/socketManager.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "40kb" })); //less payload; prevents attack
app.use(express.urlencoded({ limit: "40kb", extended: true }));

// Test route
app.get("/home", (req, res) => {
  res.send("hello");
});

// Create HTTP server
const server = createServer(app);

// Attach socket.io to HTTP server
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

// Start server
const start = async () => {
  try {
    const connectionDb = await mongoose.connect(
      "mongodb+srv://maulikdave2005:qSDDauyCVH9to1bM@cluster0.31psizi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("MongoDB connected");

    server.listen(app.get("port"), () => {
      console.log("Listening on port 8000");
    });
  } catch (err) {
    console.error("Error starting server:", err);
  }
};

start();
