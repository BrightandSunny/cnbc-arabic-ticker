// NEWS RSS with FULL Arabic translation
app.get("/news-rss", async (req, res) => {
  try {
    // English news headlines
    const newsItems = [
      { en: 'S&P 500 hits new record high amid tech rally', category: 'green' },
      { en: 'Oil prices surge on Middle East tensions', category: 'red' },
      { en: 'Federal Reserve signals potential rate cuts', category: 'green' },
      { en: 'Dollar strengthens against major currencies', category: 'green' },
      { en: 'Tech stocks lead market gains', category: 'green' },
      { en: 'Inflation data shows cooling prices', category: 'green' }
    ];
    
    // Full Arabic translations (pre-translated for reliability)
    const translations = {
      'S&P 500 hits new record high amid tech rally': 'إس آند بي 500 يسجل مستوى قياسي جديد بدعم من قطاع التكنولوجيا',
      'Oil prices surge on Middle East tensions': 'أسعار النفط ترتفع مع تصاعد التوترات في الشرق الأوسط',
      'Federal Reserve signals potential rate cuts': 'الاحتياطي الفيدرالي يشير إلى احتمال خفض أسعار الفائدة',
      'Dollar strengthens against major currencies': 'الدولار يقوى مقابل العملات الرئيسية',
      'Tech stocks lead market gains': 'أسهم التكنولوجيا تقود مكاسب السوق',
      'Inflation data shows cooling prices': 'بيانات التضخم تظهر تباطؤ الأسعار'
    };
    
    let output = '<?xml version="1.0" encoding="UTF-8"?>\n';
    output += '<rss version="2.0">\n';
    output += '<channel>\n';
    output += '  <title>CNBC Arabia Style - Financial News</title>\n';
    output += '  <link>https://cnbc-arabic-ticker.onrender.com</link>\n';
    output += '  <description>Financial news in Arabic</description>\n';
    output += '  <lastBuildDate>' + new Date().toUTCString() + '</lastBuildDate>\n';
    
    for (const item of newsItems) {
      const arTitle = translations[item.en] || item.en; // Use Arabic if available, else English
      
      output += '  <item>\n';
      output += `    <title><![CDATA[${arTitle}]]></title>\n`;
      output += `    <description><![CDATA[${item.en}]]></description>\n`; // Keep English in description
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
