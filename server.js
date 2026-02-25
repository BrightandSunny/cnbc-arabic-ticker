// ============================================
// CNBC ARABIA TICKER - COMPLETE FREE VERSION
// Full Arabic translations, real stock data, green/red triangles
// ============================================

const express = require('express');
const axios = require('axios');
const app = express();

// ============================================
// STOCK DATA FROM YAHOO FINANCE (FREE)
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
// TRANSLATION DICTIONARY
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

const newsTranslations = {
  'S&P 500 hits new record high amid tech rally': 'إس آند بي 500 يسجل مستوى قياسي جديد بدعم من قطاع التكنولوجيا',
  'Oil prices surge on Middle East tensions': 'أسعار النفط ترتفع مع تصاعد التوترات في الشرق الأوسط',
  'Federal Reserve signals potential rate cuts': 'الاحتياطي الفيدرالي يشير إلى احتمال خفض أسعار الفائدة',
  'Dollar strengthens against major currencies': 'الدولار يقوى مقابل العملات الرئيسية',
  'Tech stocks lead market gains': 'أسهم التكنولوجيا تقود مكاسب السوق',
  'Inflation data shows cooling prices': 'بيانات التضخم تظهر تباطؤ الأسعار',
  'Bitcoin reaches new all-time high': 'البيتكوين يسجل مستوى قياسي جديد',
  'Gold prices rise on safe-haven demand': 'أسعار الذهب ترتفع مع الطلب على الملاذات الآمنة',
  'Apple announces record quarterly earnings': 'آبل تعلن عن أرباح فصلية قياسية',
  'Tesla deliveries exceed analyst expectations': 'تسلا تتجاوز توقعات المحللين في التسليمات'
};

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
      <li>📈 <a href="/market-rss">Market Data RSS (with Green/Red Triangles)</a></li>
      <li>📰 <a href="/news-rss">News RSS (Arabic Translated)</a></li>
    </ul>
    <hr>
    <p><strong>For Singular:</strong></p>
    <p>Market RSS: <code>https://cnbc-arabic-ticker.onrender.com/market-rss</code></p>
    <p>News RSS: <code>https://cnbc-arabic-ticker.onrender.com/news-rss</code></p>
  `);
});

// MARKET DATA RSS - Real stocks with Arabic names and triangles
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
        const arabicName = stockNames[stock.symbol] || stock.symbol;
        
        // Build Arabic headline: "▲ آبل يرتفع 2.24% إلى $272.14"
        const direction = stock.isUp ? 'يرتفع' : 'ينخفض';
        const arTitle = `${triangle} ${arabicName} ${direction} ${Math.abs(stock.changePercent)}% إلى $${stock.price}`;
        
        output += '  <item>\n';
        output += `    <title><![CDATA[${arTitle}]]></title>\n`;
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

// NEWS RSS - Fully translated to Arabic
app.get("/news-rss", async (req, res) => {
  try {
    const newsItems = [
      { en: 'S&P 500 hits new record high amid tech rally', category: 'green' },
      { en: 'Oil prices surge on Middle East tensions', category: 'red' },
      { en: 'Federal Reserve signals potential rate cuts', category: 'green' },
      { en: 'Dollar strengthens against major currencies', category: 'green' },
      { en: 'Tech stocks lead market gains', category: 'green' },
      { en: 'Inflation data shows cooling prices', category: 'green' },
      { en: 'Bitcoin reaches new all-time high', category: 'green' },
      { en: 'Gold prices rise on safe-haven demand', category: 'green' },
      { en: 'Apple announces record quarterly earnings', category: 'green' },
      { en: 'Tesla deliveries exceed analyst expectations', category: 'green' }
    ];
    
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
    output += '<rss version="2.0">\n';
    output += '<channel>\n';
    output += '  <title>CNBC Arabia Style - Financial News</title>\n';
    output += '  <link>https://cnbc-arabic-ticker.onrender.com</link>\n';
    output += '  <description>Financial news in Arabic</description>\n';
    output += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
    
    for (const item of newsItems) {
      const arTitle = newsTranslations[item.en] || item.en;
      
      output += '  <item>\n';
      output += `    <title><![CDATA[${arTitle}]]></title>\n`;
      output += `    <description><![CDATA[${item.en}]]></description>\n`;
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
  console.log('✅ CNBC Arabia Ticker Server running on port ' + PORT);
});
