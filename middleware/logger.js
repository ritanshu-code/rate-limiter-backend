import { response } from "express";
import redis from "../redisClient.js";
import { getIO } from "../socket.js";

export const logger = async (req, res, next) => {
    if (req.path.includes(".well-known")) return next();
    if (req.path.startsWith("/dashboard")) return next();

    const startTime = Date.now();

    res.on("finish", async () => {
        try {
            const log = {
                ip: req.headers["x-forwarded-for"] || req.ip,
                path: req.path,
                method: req.method,
                status: res.statusCode,
                time: Date.now(),
                responseTime: Date.now() - startTime
            };

            await redis.rpush("rate-limiter:logs", JSON.stringify(log));
            await redis.ltrim("rate-limiter:logs", 0, 99);
            await redis.expire("rate-limiter:logs", 600);

            const io = getIO();
            io.emit("new_log", log);

        } catch (error) {
            console.error("Logging Error:", error);
        }
    });

    next();
};