// ============================================
// CNBC ARABIA TICKER - FREE VERSION
// Works on Render Free Tier!
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

// Your Google Apps Script URL (we'll add this later)
const GOOGLE_SCRIPT_URL = process.env.SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

// Keep-alive endpoint
app.get("/", (request, response) => {
  response.send(`
    <h1>🚀 CNBC Arabia Ticker Server is RUNNING!</h1>
    <p>Server Time: ${new Date()}</p>
    <p>Status: ✅ Online 24/7</p>
    <hr>
    <h2>Your RSS Feeds:</h2>
    <ul>
      <li><a href="/market-rss">📈 Market Data RSS (with Green/Red Triangles)</a></li>
      <li><a href="/news-rss">📰 News RSS (Arabic Translated)</a></li>
    </ul>
    <hr>
    <p><strong>For Singular:</strong> Use these URLs in your RSS Ticker settings</p>
    <p>Market RSS: <code>https://your-app.onrender.com/market-rss</code></p>
  `);
});

// Market data with green/red triangles
app.get("/market-rss", async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SCRIPT_URL + '?type=market', {
      timeout: 10000
    });
    
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'no-cache');
    res.send(response.data);
    
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// News RSS
app.get("/news-rss", async (req, res) => {
  try {
    const response = await axios.get(GOOGLE_SCRIPT_URL, {
      timeout: 10000
    });
    
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'no-cache');
    res.send(response.data);
    
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Health check for monitoring
app.get("/health", (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Server running on port ' + PORT);
});
