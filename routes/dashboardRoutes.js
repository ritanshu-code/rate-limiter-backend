import express from "express";
import redis from "../redisClient.js";

const router = express.Router();

// GET /logs
router.get("/logs", async (req, res) => {
    try {
        const logs = await redis.lrange("logs", 0, 49);

        const parsedLogs = logs.map(log => JSON.parse(log));

        res.json({
            total: parsedLogs.length,
            logs: parsedLogs
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching logs" });
    }
});

// GET /stats
router.get("/stats", async (req, res) => {
    try {
        const logs = await redis.lrange("logs", 0, -1);
        const parsedLogs = logs.map(log => JSON.parse(log));

        let totalRequests = parsedLogs.length;
        let blockedRequests = 0;

        const routeCount = {};

        parsedLogs.forEach(log => {

            
            // count blocked requests
            if (log.status === 429) blockedRequests++;

            // count per route
            routeCount[log.path] = (routeCount[log.path] || 0) + 1;
        });

        const blockedPercentage = totalRequests === 0
            ? 0
            : (blockedRequests / totalRequests) * 100;

        console.log(totalRequests, blockedRequests, routeCount, blockedPercentage);

        const successRequests = totalRequests - blockedRequests;

        res.json({
            totalRequests,
            blockedRequests,
            successRequests,
            routeCount,
            blockedPercentage
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching stats" });
    }
});

export default router;