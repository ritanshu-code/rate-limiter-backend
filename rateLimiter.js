import redis from "./redisClient.js";

// here's what i understand from that lecture - we'll have a window size and no. of requests allowed for that amount of time (i.e window size) and we'll maintain timestamps of every req and for each req we'll remove timestamps older than current time - window size and if the length of timestamps is greater than or equal to max reqs then we'll block the req otherwise we'll add the current timestamp to the list and set an expiry for that key in redis.

const WINDOW_SIZE = 60; // 60 seconds
const MAX_REQUESTS = 5;


export const rateLimiter = async (req, res, next) => {
  if (req.path.startsWith("/dashboard")) return next();

  try {
    const ip = req.headers["x-forwarded-for"] || req.ip;
    const key = `rate-limiter:ip:${ip}`;

    const now = Date.now();
    const windowStart = now - WINDOW_SIZE * 1000;

    await redis.zremrangebyscore(key, 0, windowStart);

    const currentRequests = await redis.zcard(key);

    if (currentRequests >= MAX_REQUESTS) {
      if ((req.get("accept") || "").includes("text/html")) {
        return res.status(429).type("html").send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Too Many Requests</title>
    <style>
      * { box-sizing: border-box; }
      body {
        min-height: 100vh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 24px;
        color: #e2e8f0;
        background: radial-gradient(ellipse at top, #4c1d2b, #0f172a 65%);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(100%, 440px);
        padding: 40px 32px;
        text-align: center;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(248, 113, 113, 0.3);
        border-radius: 20px;
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
      }
      h1 { margin: 0 0 12px; color: #fecaca; font-size: 28px; }
      p { margin: 0; color: #cbd5e1; line-height: 1.6; }
    </style>
  </head>
  <body>
    <main>
      <h1>Too many requests 🚫</h1>
      <p>You’ve reached the request limit. Please wait a little and try again.</p>
    </main>
  </body>
</html>`);
      }

      return res.status(429).json({
        message: "Too many requests 🚫"
      });
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, WINDOW_SIZE);

    next();

  } catch (err) {
    console.error(err);
    next();
  }
};