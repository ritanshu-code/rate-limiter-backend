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