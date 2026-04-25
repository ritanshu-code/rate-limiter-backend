import express from 'express';
import { rateLimiter } from './rateLimiter.js';
import { logger } from './middleware/logger.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import { initSocket } from './socket.js';
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(cors({
    origin: true, // allow all origins temporarily
    credentials: true,
}));

const server = http.createServer(app);


initSocket(server);



app.use(logger);
app.use(rateLimiter);

app.get("/", (req, res) => {
    res.send("Api working fine ✅");
})

app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 4000;

console.log("Using PORT:", PORT);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});