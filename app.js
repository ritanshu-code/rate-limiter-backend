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

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
];
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
app.use(cors({
  origin: true,
  credentials: true,
}));

const server = http.createServer(app);


initSocket(server);



app.use(logger);
app.use(rateLimiter);

app.get("/", (req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Status</title>
    <style>
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #e2e8f0;
        background: radial-gradient(ellipse at top, #1e3a5f, #0f172a 65%);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(100%, 440px);
        padding: 40px 32px;
        text-align: center;
        background: rgba(15, 23, 42, 0.82);
        border: 1px solid rgba(148, 163, 184, 0.24);
        border-radius: 20px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
      }
      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 12px;
        color: #bbf7d0;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(74, 222, 128, 0.25);
        border-radius: 999px;
        font-size: 13px;
        font-weight: 600;
      }
      h1 { margin: 22px 0 8px; font-size: 28px; }
      p { margin: 0; color: #94a3b8; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main>
      <span class="status">● Service online</span>
      <h1>API working fine ✅</h1>
      <p>Your API rate limiter is up and running.</p>
    </main>
  </body>
</html>`);
});

app.use("/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 4000;

console.log("Using PORT:", PORT);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});