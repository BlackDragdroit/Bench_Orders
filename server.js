// Drop — static host + Anthropic proxy.
// The API key lives here, in the server environment, never in the phone.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json({ limit: "256kb" }));

// service worker must not be cached, or updates never land
app.use((req, res, next) => {
  if (req.path === "/sw.js") res.setHeader("Cache-Control", "no-cache");
  next();
});
app.use(express.static(path.join(__dirname, "public")));

// crude rate limit: this is a single-user app
const hits = [];
app.post("/api/generate", async (req, res) => {
  const now = Date.now();
  while (hits.length && now - hits[0] > 60000) hits.shift();
  if (hits.length >= 20) return res.status(429).json({ error: "Slow down." });
  hits.push(now);

  if (!API_KEY) {
    return res.status(500).json({ error: "No ANTHROPIC_API_KEY set on the server." });
  }
  const prompt = req.body && req.body.prompt;
  if (typeof prompt !== "string" || prompt.length > 16000) {
    return res.status(400).json({ error: "Bad prompt." });
  }

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: process.env.MODEL || "claude-sonnet-4-6",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(502).json({ error: "Upstream failed." });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));
app.get("*", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, "0.0.0.0", () => console.log("Drop listening on " + PORT));
