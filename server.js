// ============================================
// CNBC ARABIA TICKER - CLASSIC STYLE
// Green ▲ for UP, Red ▼ for DOWN
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

// ============================================
// CORS - ALLOW ALL ORIGINS
// ============================================

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// ============================================
// STOCK DATA FROM YAHOO FINANCE
// ============================================

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

// ============================================
// TRANSLATIONS
// ============================================

const stockNames = {
  'AAPL': 'آبل',
  'TSLA': 'تسلا',
  'MSFT': 'مايكروسوفت',
  'GOOGL': 'جوجل',
  'AMZN': 'أمازون',
  'NVDA': 'انفيديا',
  'META': 'ميتا',
  'SPY': 'إس آند بي 500',
  'QQQ': 'ناسداك 100'
};

// ============================================
// CNBC STYLE FORMATTING
// ============================================

function formatCNBCStyle(stock) {
  const arabicName = stockNames[stock.symbol] || stock.symbol;
  
  // CNBC Classic: ▲ for UP (green), ▼ for DOWN (red)
  const triangle = stock.isUp ? '▲' : '▼';
  const color = stock.isUp ? 'green' : 'red';
  
  // Format: "▲ آبل +2.24% $272.14" or "▼ تسلا -1.50% $242.50"
  const sign = stock.isUp ? '+' : '';
  const changeStr = `${sign}${stock.changePercent}%`;
  
  // Arabic format: Triangle + Name + Change% + Price
  const title = `${triangle} ${arabicName} ${changeStr} $${stock.price}`;
  
  return {
    title: title,
    color: color,
    description: `Price: $${stock.price} | Change: ${stock.changePercent}%`
  };
}

// ============================================
// ROUTES
// ============================================

// Homepage
app.get("/", (request, response) => {
  response.send(`
    <h1>🚀 CNBC Arabia Ticker Server is RUNNING!</h1>
    <p>Server Time: ${new Date()}</p>
    <p>Status: ✅ Online 24/7</p>
    <hr>
    <h2>Your RSS Feeds:</h2>
    <ul>
      <li>📈 <a href="/market-rss">Market Data RSS (CNBC Classic Style)</a></li>
    </ul>
    <hr>
    <p><strong>For Singular:</strong></p>
    <p>Market RSS: <code>https://cnbc-arabic-ticker.onrender.com/market-rss</code></p>
  `);
});

// MARKET DATA RSS - CNBC Classic Style
app.get("/market-rss", async (req, res) => {
  try {
    const stocks = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'SPY', 'QQQ'];
    const stockData = await Promise.all(stocks.map(getStockData));
    
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
    output += '<rss version="2.0">\n';
    output += '<channel>\n';
    output += '  <title>CNBC Arabia Style - Market Data</title>\n';
    output += '  <link>https://cnbc-arabic-ticker.onrender.com</link>\n';
    output += '  <description>Real-time stock market data - CNBC Classic Style</description>\n';
    output += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
    
    for (const stock of stockData) {
      if (stock) {
        const formatted = formatCNBCStyle(stock);
        
        output += '  <item>\n';
        output += `    <title><![CDATA[${formatted.title}]]></title>\n`;
        output += `    <description>${formatted.description}</description>\n`;
        output += `    <category>${formatted.color}</category>\n`;
        output += '  </item>\n';
      }
    }
    
    output += '</channel>\n';
    output += '</rss>';
    
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Access-Control-Allow-Origin', '*');
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
  console.log('✅ CNBC Arabia Ticker Server running on port ' + PORT);
});
