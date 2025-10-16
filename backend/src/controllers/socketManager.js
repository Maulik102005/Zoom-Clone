import { Server } from "socket.io";

let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      allowedHeaders: ["*"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-call", (path) => {
      // like add event listener
      if (connections[path] === undefined) {
        connections[path] = [];
      }

      connections[path].push(socket.id);
      timeOnline[socket.id] = new Date();

      for (let a = 0; a < connections[path].length; a++) {
        io.to(connections[path][a]).emit(
          "user-joined",
          socket.id,
          connections[path]
        );
      }

      if (messages[path] !== undefined) {
        for (let a = 0; a < messages[path].length; a++) {
          io.to(socket.id).emit(
            "chat-message",
            messages[path][a]["data"],
            messages[path][a]["sender"],
            messages[path][a]["socket-id-sender"]
          );
        }
      }
    });

    socket.on("signal", (toId, message) => {
      io.to(toId).emit("signal", socket.id, message);
    });

    socket.on("chat-message", (data, sender) => {
      const [matchingRoom, found] = Object.entries(connections).reduce(
        ([roomKey, isFound], [room, roomValue]) => {
          if (!isFound && roomValue.includes(socket.id)) {
            return [room, true];
          }
          return [roomKey, isFound];
        },
        [null, false]
      );
    });

    socket.on("disconnect", (toId, message) => {
      var diffTime = Math.abs(new Date() - timeOnline[socket.id]);

      for (const [k, v] of Object.entries(
        JSON.parse(JSON.stringify(connections))
      )) {
        // deep copy to avoid mutation (shallow copy => reference)
        for (let a = 0; a < v.length; a++) {
          if (v[a] === socket.id) {
            let key = k;

            for (let b = 0; b < connections[key].length; b++) {
              io.to(connections[key][b]).emit("user-left", socket.id);
            }

            var index = connections[key].indexOf(socket.id);
            connections[key].splice(index, 1);

            if (connections[key].length === 0) {
              delete connections[key]; // delete room if empty
            }
          }
        }
      }
    });
  });

  return io;
};
