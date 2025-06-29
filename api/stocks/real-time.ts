// Real-time stock data API endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  market_cap?: number;
  market: 'US' | 'SA';
  sector?: string;
  timestamp: Date;
  is_real_time: boolean;
}

// Free API integration - Alpha Vantage alternative
const FREE_API_KEY = 'demo'; // Replace with actual API key
const API_BASE_URL = 'https://www.alphavantage.co/query';

async function fetchRealTimeStock(symbol: string): Promise<StockPrice | null> {
  try {
    // Using Alpha Vantage free tier for demonstration
    const response = await fetch(
      `${API_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${FREE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const quote = data['Global Quote'];
    
    if (!quote) {
      console.warn(`No data found for symbol: ${symbol}`);
      return null;
    }
    
    return {
      symbol: quote['01. symbol'],
      name: `${symbol} Corp`, // Would need company name API
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      market_cap: 0, // Would need additional API call
      market: 'US',
      sector: 'Technology', // Would need additional API call
      timestamp: new Date(),
      is_real_time: true
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

// Popular stock symbols for demo
const POPULAR_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX'];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers for frontend access
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }
  
  try {
    const { symbol, symbols } = req.query;
    
    if (symbol && typeof symbol === 'string') {
      // Single stock request
      const stockData = await fetchRealTimeStock(symbol.toUpperCase());
      
      if (!stockData) {
        return res.status(404).json({
          success: false,
          error: `Stock data not found for symbol: ${symbol}`
        });
      }
      
      return res.status(200).json({
        success: true,
        data: stockData
      });
    }
    
    if (symbols && typeof symbols === 'string') {
      // Multiple stocks request
      const symbolList = symbols.split(',').map(s => s.trim().toUpperCase());
      const stockPromises = symbolList.map(fetchRealTimeStock);
      const stockResults = await Promise.all(stockPromises);
      
      const validStocks = stockResults.filter(stock => stock !== null);
      
      return res.status(200).json({
        success: true,
        data: validStocks,
        count: validStocks.length
      });
    }
    
    // Default: return popular stocks
    console.log('Fetching popular stocks:', POPULAR_STOCKS);
    const stockPromises = POPULAR_STOCKS.map(fetchRealTimeStock);
    const stockResults = await Promise.all(stockPromises);
    
    const validStocks = stockResults.filter(stock => stock !== null);
    
    return res.status(200).json({
      success: true,
      data: validStocks,
      count: validStocks.length,
      message: 'Popular US stocks data'
    });
    
  } catch (error) {
    console.error('Stock API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
