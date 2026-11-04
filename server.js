require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const { MongoClient } = require("mongodb");
const { rateLimit } = require("express-rate-limit");

// BaitBreak Detection Engine
const { analyzeMessage } = require("./engine/extract");
const { analyzeSequence } = require("./engine/sequence");
const { correlateResults } = require("./engine/correlate");
const { explainResults } = require("./engine/explain");

// Routes
const authRoutes = require("./auth/authRoutes");
const historyRoutes = require("./historyRoutes");

const app = express();

const PORT = process.env.PORT || 3000;

// ================================
// CORS
// ================================

// For hackathon/demo deployment
app.use(cors({
    origin: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ================================
// MIDDLEWARE
// ================================

app.use(express.json({ limit: "50kb" }));

// Serve frontend files locally
app.use(express.static(path.join(__dirname, "public")));

// ================================
// RATE LIMITERS
// ================================

// Limit authentication attempts
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many authentication attempts. Please try again later."
    }
});

// Limit scan requests
const analyzeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many scan requests. Please try again later."
    }
});

// ================================
// ROUTES
// ================================

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/history", historyRoutes);

// ================================
// HEALTH CHECK
// ================================

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "BaitBreak server is running"
    });
});

// ================================
// ANALYZE MESSAGE
// ================================

app.post("/api/analyze", analyzeLimiter, async (req, res) => {

    console.log("\n========== NEW ANALYSIS REQUEST ==========");

    try {

        const { message } = req.body || {};

        // Validate message
        if (typeof message !== "string" || !message.trim()) {

            return res.status(400).json({
                success: false,
                error: "Please provide a non-empty message."
            });
        }

        // ==================================
        // STEP 1: EXTRACT SCAM SIGNALS
        // ==================================

        const extraction = analyzeMessage(message);

        console.log(
            "SERVER RULE HITS:",
            JSON.stringify(extraction.ruleHits, null, 2)
        );

        // ==================================
        // STEP 2: ANALYZE ATTACK SEQUENCE
        // ==================================

        const sequence = analyzeSequence(
            extraction.ruleHits
        );

        // ==================================
        // STEP 3: CORRELATE RESULTS
        // ==================================

        const correlation = correlateResults(
            extraction,
            sequence
        );

        // ==================================
        // STEP 4: GENERATE EXPLANATION
        // ==================================

        const explanation = explainResults(
            extraction,
            correlation
        );

        // ==================================
        // STEP 5: OPTIONAL USER AUTHENTICATION
        // ==================================

        const authHeader = req.headers.authorization;

        let userId = null;

        if (
            authHeader &&
            authHeader.startsWith("Bearer ")
        ) {

            try {

                const token = authHeader.split(" ")[1];

                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET
                );

                userId = decoded.userId;

            } catch (error) {

                // Don't stop scam analysis
                // if an old token exists

                console.log(
                    "Invalid or expired token. Continuing without saving history."
                );

                userId = null;
            }
        }

        // ==================================
        // STEP 6: SAVE HISTORY
        // ==================================

        if (userId && req.app.locals.db) {

            try {

                await req.app.locals.db
                    .collection("scanHistory")
                    .insertOne({

                        userId,

                        message,

                        riskScore: correlation.score,

                        riskLevel: correlation.level,

                        explanation,

                        createdAt: new Date()
                    });

                console.log(
                    "Scan history saved for user:",
                    userId
                );

            } catch (error) {

                console.error(
                    "Failed to save scan history:",
                    error.message
                );
            }
        }

        // ==================================
        // FINAL LOGS
        // ==================================

        console.log(
            "FINAL RISK:",
            correlation.score
        );

        console.log(
            "FINAL LEVEL:",
            correlation.level
        );

        console.log(
            "==========================================\n"
        );

        // ==================================
        // SEND RESPONSE
        // ==================================

        return res.status(200).json({

            success: true,

            input: message,

            extraction,

            sequence,

            risk: {
                score: correlation.score,
                level: correlation.level,
                matchedPattern: correlation.matchedPattern
            },

            explanation
        });

    } catch (error) {

        console.error(
            "BAITBREAK ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            error: "Unable to analyze this message."
        });
    }
});

// ================================
// DATABASE CONNECTION
// ================================

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {

    console.error(
        "ERROR: MONGODB_URI environment variable is missing!"
    );

    process.exit(1);
}

const client = new MongoClient(mongoUri);

// ================================
// START SERVER
// ================================

async function startServer() {

    try {

        console.log(
            "PROJECT DIRECTORY:",
            __dirname
        );

        console.log(
            "EXTRACT MODULE:",
            require.resolve("./engine/extract")
        );

        console.log(
            "RULES FILE:",
            path.join(
                __dirname,
                "data",
                "rules.json"
            )
        );

        // Connect MongoDB
        await client.connect();

        const db = client.db(
            process.env.DB_NAME || "baitbreak"
        );

        app.locals.db = db;

        console.log(
            "MongoDB connected successfully!"
        );

        // Start Express server
        app.listen(PORT, "0.0.0.0", () => {

            console.log(
                `BaitBreak server running on port ${PORT}`
            );

        });

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        process.exit(1);
    }
}

startServer();