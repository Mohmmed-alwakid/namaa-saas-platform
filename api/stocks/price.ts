import { VercelRequest, VercelResponse } from '@vercel/node';

// Types
interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  market: 'US' | 'SA';
  lastUpdated: string;
}

interface AlphaVantageResponse {
  'Global Quote': {
    '01. symbol': string;
    '05. price': string;
    '09. change': string;
    '10. change percent': string;
  };
}

// Handler الرئيسي
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // إضافة CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'طريقة غير مدعومة' 
    });
  }

  try {
    const { symbol } = req.query;

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'رمز السهم مطلوب'
      });
    }

    // تحديد السوق بناءً على رمز السهم
    const market = symbol.includes('.SR') ? 'SA' : 'US';
    
    let stockData: StockQuote;

    if (market === 'US') {
      stockData = await getUSStockPrice(symbol);
    } else {
      // للسوق السعودي، سنعيد بيانات تجريبية لدء
      stockData = await getSaudiStockPrice(symbol);
    }

    return res.status(200).json({
      success: true,
      data: stockData
    });

  } catch (error) {
    console.error('خطأ في جلب سعر السهم:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب سعر السهم'
    });
  }
}

// جلب سعر السهم الأمريكي من Alpha Vantage
async function getUSStockPrice(symbol: string): Promise<StockQuote> {
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  
  if (!API_KEY) {
    // إذا لم يكن هناك API key، أعيد بيانات تجريبية
    return {
      symbol,
      name: `${symbol} Inc.`,
      price: 150.00 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      market: 'US',
      lastUpdated: new Date().toISOString()
    };
  }

  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('فشل في الاتصال بـ Alpha Vantage');
    }

    const data: AlphaVantageResponse = await response.json();
    const quote = data['Global Quote'];

    if (!quote || !quote['01. symbol']) {
      throw new Error('رمز السهم غير موجود');
    }

    const price = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol,
      name: `${symbol} Inc.`, // يمكن تحسينها لاحقاً بجلب الاسم الحقيقي
      price,
      change,
      changePercent,
      market: 'US',
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('خطأ Alpha Vantage:', error);
    // أعيد بيانات تجريبية في حالة الخطأ
    return {
      symbol,
      name: `${symbol} Inc.`,
      price: 150.00 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      market: 'US',
      lastUpdated: new Date().toISOString()
    };
  }
}

// جلب سعر السهم السعودي (بيانات تجريبية للآن)
async function getSaudiStockPrice(symbol: string): Promise<StockQuote> {
  // بيانات تجريبية للأسهم السعودية
  const saudiStocks: Record<string, { name: string; basePrice: number }> = {
    '2222.SR': { name: 'أرامكو السعودية', basePrice: 35.0 },
    '1120.SR': { name: 'بنك الأهلي التجاري', basePrice: 41.5 },
    '2030.SR': { name: 'سافكو', basePrice: 85.2 },
    '2010.SR': { name: 'سابك', basePrice: 89.7 },
    '1211.SR': { name: 'معادن', basePrice: 45.8 },
    '7010.SR': { name: 'المراعي', basePrice: 52.3 },
    '4001.SR': { name: 'زين السعودية', basePrice: 12.4 }
  };

  const stockInfo = saudiStocks[symbol] || { 
    name: symbol.replace('.SR', ''), 
    basePrice: 50.0 
  };

  // محاكاة تغيرات السعر
  const randomChange = (Math.random() - 0.5) * 2; // تغيير بين -1 و +1
  const currentPrice = stockInfo.basePrice + randomChange;
  const change = randomChange;
  const changePercent = (change / stockInfo.basePrice) * 100;

  return {
    symbol,
    name: stockInfo.name,
    price: Math.round(currentPrice * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    market: 'SA',
    lastUpdated: new Date().toISOString()
  };
}
