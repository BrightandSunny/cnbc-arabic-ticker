// ============================================
// CNBC ARABIA TICKER - FREE VERSION
// No Google Script needed - works directly!
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

// Free Yahoo Finance API (unofficial but works!)
async function getStockData(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });
    
    const result = response.data.chart.result[0];
    const price = result.meta.regularMarketPrice;
    const previousClose = result.meta.previousClose || result.meta.chartPreviousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol: symbol,
      price: price.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      isUp: change >= 0
    };
  } catch (error) {
    console.log(`Error fetching ${symbol}:`, error.message);
    return null;
  }
}

// Simple Arabic translation function (basic but works!)
function toArabic(text) {
  // Common financial terms translation
  const translations = {
    'AAPL': 'آبل',
    'TSLA': 'تسلا',
    'MSFT': 'مايكروسوفت',
    'GOOGL': 'جوجل',
    'AMZN': 'أمازون',
    'NVDA': 'انفيديا',
    'META': 'ميتا',
    'SPY': 'إس آند بي 500',
    'QQQ': 'ناسداك 100',
    'stock': 'السهم',
    'up': 'يرتفع',
    'down': 'ينخفض',
    'percent': 'بالمئة',
    'to': 'إلى',
    'price': 'السعر'
  };
  
  let arabic = text;
  for (const [en, ar] of Object.entries(translations)) {
    arabic = arabic.replace(new RegExp(en, 'g'), ar);
  }
  return arabic;
}

// Homepage
app.get("/", (request, response) => {
  response.send(`
    <h1>🚀 CNBC Arabia Ticker Server is RUNNING!</h1>
    <p>Server Time: ${new Date()}</p>
    <p>Status: ✅ Online 24/7</p>
    <hr>
    <h2>Your RSS Feeds:</h2>
    <ul>
      <li>📈 <a href="/market-rss">Market Data RSS (with Green/Red Triangles)</a></li>
      <li>📰 <a href="/news-rss">News RSS (Arabic Translated)</a></li>
    </ul>
    <hr>
    <p><strong>For Singular:</strong></p>
    <p>Market RSS: <code>https://cnbc-arabic-ticker.onrender.com/market-rss</code></p>
    <p>News RSS: <code>https://cnbc-arabic-ticker.onrender.com/news-rss</code></p>
  `);
});

// MARKET DATA RSS with Green/Red Triangles
app.get("/market-rss", async (req, res) => {
  try {
    const stocks = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'SPY', 'QQQ'];
    const stockData = await Promise.all(stocks.map(getStockData));
    
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
    output += '<rss version="2.0">\n';
    output += '<channel>\n';
    output += '  <title>CNBC Arabia Style - Market Data</title>\n';
    output += '  <link>https://cnbc-arabic-ticker.onrender.com</link>\n';
    output += '  <description>Real-time stock market data with Arabic translation</description>\n';
    output += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
    
    for (const stock of stockData) {
      if (stock) {
        const triangle = stock.isUp ? '▲' : '▼';
        const color = stock.isUp ? 'green' : 'red';
        
        // Create Arabic headline
        const enText = `${stock.symbol} stock ${stock.isUp ? 'up' : 'down'} ${Math.abs(stock.changePercent)}% to $${stock.price}`;
        const arText = toArabic(enText);
        
        output += '  <item>\n';
        output += `    <title><![CDATA[${triangle} ${arText}]]></title>\n`;
        output += `    <description>Price: $${stock.price} | Change: ${stock.changePercent}%</description>\n`;
        output += `    <category>${color}</category>\n`;
        output += '  </item>\n';
      }
    }
    
    output += '</channel>\n';
    output += '</rss>';
    
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(output);
    
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// NEWS RSS (Mock data with Arabic)
app.get("/news-rss", async (req, res) => {
  try {
    // Sample financial news (in real use, you could fetch from a free news API)
    const newsItems = [
      { title: 'S&P 500 hits new record high amid tech rally', category: 'green' },
      { title: 'Oil prices surge on Middle East tensions', category: 'red' },
      { title: 'Federal Reserve signals potential rate cuts', category: 'green' },
      { title: 'Dollar strengthens against major currencies', category: 'green' }
    ];
    
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
    output += '<rss version="2.0">\n';
    output += '<channel>\n';
    output += '  <title>CNBC Arabia Style - Financial News</title>\n';
    output += '  <link>https://cnbc-arabic-ticker.onrender.com</link>\n';
    output += '  <description>Financial news in Arabic</description>\n';
    output += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
    
    for (const item of newsItems) {
      const arTitle = toArabic(item.title);
      output += '  <item>\n';
      output += `    <title><![CDATA[${arTitle}]]></title>\n`;
      output += `    <category>${item.category}</category>\n`;
      output += '  </item>\n';
    }
    
    output += '</channel>\n';
    output += '</rss>';
    
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.send(output);
    
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('✅ Server running on port ' + PORT);
});
