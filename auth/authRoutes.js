const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        // Validate required fields
        if (
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Validate name and email length
        if (
            name.trim().length > 100 ||
            email.trim().length > 254
        ) {
            return res.status(400).json({
                success: false,
                message: "Name or email is too long"
            });
        }

        // Validate password length
        if (password.length < 8 || password.length > 72) {
            return res.status(400).json({
                success: false,
                message: "Password must be between 8 and 72 characters"
            });
        }

        const db = req.app.locals.db;
        const users = db.collection("users");

        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await users.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Save user
        const result = await users.insertOne({
            name: name.trim(),
            email: normalizedEmail,
            passwordHash,
            createdAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            userId: result.insertedId
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Registration failed"
        });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};

        // Validate input
        if (
            typeof email !== "string" ||
            typeof password !== "string" ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "Valid email and password are required"
            });
        }

        const db = req.app.locals.db;
        const users = db.collection("users");

        // Find user
        const user = await users.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check JWT configuration
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id.toString() },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});

module.exports = router;