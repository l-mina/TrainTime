import arcjet, { tokenBucket, shield, detectBot } from "@arcjet/node";

import "dotenv/config";

export const aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["ip.src"],
    rules: [
        // Shield protects from common attacks
        shield({ mode: "LIVE" }),

        // Create a token bucket rate limit
        tokenBucket({
            mode: "LIVE",
            refillRate: 5,
            interval: 10,
            capacity: 10,
        }),
    ],
});