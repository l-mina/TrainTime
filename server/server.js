import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import { initDB } from "./config/initDB.js";
import { aj } from "./lib/arcjet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
    optionSuccessStatus: 200,
}

app.use(express.json());
app.use(cors(corsOptions));

// Security middleware protects by setting various HTTP headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// Logs requests
app.use(morgan("dev"));

// Arcjet sets rate-limits to all routes
app.use(async(req, res, next)=>{
    try{
        const decision = await aj.protect(req, {
            // Each request consumes 1 token
            requested: 1,
        });

        if (decision.isDenied()){
            if (decision.reason.isRateLimit()){
                res.status(429).json({ error: "Too many requests" });
            } else if (decision.reason.isBot()){
                res.status(403).json({ error: "Bot access denied" });
            } else {
                res.status(403).json({ error: "Forbidden "});
            }
            return;
        }

        // Check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())){
            res.status(403).json({ error: "Spoofed bot detected" });
            return;
        }

        next();
    } catch(error) {
        console.log("Arcjet error ",error);
        next(error);
    }
});

// app.use("/api/", Routes);

initDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server is running on port ", PORT);
    })
});