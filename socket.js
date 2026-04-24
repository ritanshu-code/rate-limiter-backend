import { Server } from "socket.io";
import dotenv from "dotenv";
dotenv.config();

let io;
const frontendUrl = process.env.FRONTEND_URL
console.log(frontendUrl);

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: frontendUrl,
      
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
};