const express = require("express");
const authMiddleware = require("./middleware/authMiddleware");

const router = express.Router();

// GET USER SCAN HISTORY
router.get("/", authMiddleware, async (req, res) => {
    try {
        const db = req.app.locals.db;

        const history = await db.collection("scanHistory")
            .find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        res.json({
            success: true,
            total: history.length,
            history
        });

    } catch (error) {
        console.error("History error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch scan history"
        });
    }
});

module.exports = router;