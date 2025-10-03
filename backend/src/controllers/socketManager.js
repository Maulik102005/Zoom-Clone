import { Server } from "socket.io";

let connections = {};
let message = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {});

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });
  });
  return io;
};
