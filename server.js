require("dotenv").config();
const { rateLimit } = require("express-rate-limit");

const { MongoClient } = require("mongodb");


const express = require("express");
const cors = require("cors");

const path = require("path");

const { analyzeMessage } = require("./engine/extract");
const { analyzeSequence } = require("./engine/sequence");
const { correlateResults } = require("./engine/correlate");
const { explainResults } = require("./engine/explain");

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
// Limit repeated authentication requests
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

// Limit repeated scan requests
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
const PORT = process.env.PORT || 3000;
const authRoutes = require("./auth/authRoutes");
const historyRoutes = require("./historyRoutes");
const jwt = require("jsonwebtoken");


console.log("PROJECT DIRECTORY:", __dirname);
console.log("EXTRACT MODULE:", require.resolve("./engine/extract"));
console.log("RULES FILE:", path.join(__dirname, "data", "rules.json"));

app.use(express.json({ limit: "50kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/history", historyRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "BaitBreak server is running"
  });
});

app.post("/api/analyze", analyzeLimiter, async (req, res) => {
  console.log("\n========== NEW ANALYSIS REQUEST ==========");

  try {
    const { message } = req.body || {};

    

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Please provide a non-empty message."
      });
    }

    const extraction = analyzeMessage(message);
    console.log("SERVER RULE HITS:", JSON.stringify(extraction.ruleHits, null, 2));

    console.log("EXTRACTED SIGNALS:", extraction.ruleHits);

    const sequence = analyzeSequence(extraction.ruleHits);
    const correlation = correlateResults(extraction, sequence);
    const explanation = explainResults(extraction, correlation);
    // SAVE SCAN HISTORY FOR LOGGED-IN USERS
const authHeader = req.headers.authorization;
let userId = null;

if (authHeader) {
    try {
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization header"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        userId = decoded.userId;

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

if (userId) {
    await req.app.locals.db.collection("scanHistory").insertOne({
        userId,
        message,
        riskScore: correlation.score,
        riskLevel: correlation.level,
        explanation,
        createdAt: new Date()
    });

    console.log("Scan history saved for user:", userId);
}

    console.log("FINAL RISK:", correlation.score);
    console.log("FINAL LEVEL:", correlation.level);
    console.log("==========================================\n");

    return res.json({
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
    console.error("BAITBREAK ERROR:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to analyze this message."
    });
  }
});

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  try {
    await client.connect();

    const db = client.db(process.env.DB_NAME || "baitbreak");

    app.locals.db = db;

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`BaitBreak server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();