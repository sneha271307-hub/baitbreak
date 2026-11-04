const jwt = require("jsonwebtoken");

module.exports = function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.userId;
    req.user = { id: decoded.userId };   // works whether your routes use req.userId or req.user.id
    next();
  } catch (error) {
    console.error("JWT verify failed:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};