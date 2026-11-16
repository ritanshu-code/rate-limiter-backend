import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: true, //  FIX
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(" Client connected:", socket.id);
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};