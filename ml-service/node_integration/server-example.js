// server-example.js – shows how to expose the ML result from your existing Express backend.
// Copy the route into your own app (npm i express if you don't have it already).
const express = require("express");
const { checkMessage } = require("./baitbreakClient");

const app = express();
app.use(express.json());

// Your frontend calls THIS route; the browser never talks to the Python service directly.
app.post("/api/check-message", async (req, res) => {
  const { message } = req.body || {};
  if (typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ success: false, error: "message is required" });
  }
  const result = await checkMessage(message);
  if (!result.success) {
    return res.status(502).json(result);         // ML service problem or rejected input
  }
  res.json(result);                              // {success:true, prediction:"scam", confidence:0.94}
});

if (require.main === module) {
  app.listen(3000, () => console.log("Node backend on http://localhost:3000"));
}
module.exports = app;
