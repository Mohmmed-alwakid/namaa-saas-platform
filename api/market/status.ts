// Market status API endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface MarketStatus {
  market: 'US' | 'SA';
  is_open: boolean;
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  current_time: Date;
  next_open: Date | null;
  next_close: Date | null;
  timezone: string;
}

function getUSMarketStatus(): MarketStatus {
  const now = new Date();
  const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const hours = nyTime.getHours();
  const minutes = nyTime.getMinutes();
  const day = nyTime.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's weekend
  if (day === 0 || day === 6) {
    // Weekend - market closed
    const nextMonday = new Date(nyTime);
    nextMonday.setDate(nyTime.getDate() + (day === 0 ? 1 : 2)); // Next Monday
    nextMonday.setHours(9, 30, 0, 0); // 9:30 AM ET
    
    return {
      market: 'US',
      is_open: false,
      status: 'CLOSED',
      current_time: now,
      next_open: nextMonday,
      next_close: null,
      timezone: 'America/New_York'
    };
  }
  
  const currentMinutes = hours * 60 + minutes;
  const marketOpen = 9 * 60 + 30; // 9:30 AM
  const marketClose = 16 * 60; // 4:00 PM
  const preMarketStart = 4 * 60; // 4:00 AM
  const afterHoursEnd = 20 * 60; // 8:00 PM
  
  let status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  let is_open = false;
  let next_open: Date | null = null;
  let next_close: Date | null = null;
  
  if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
    // Regular market hours
    status = 'OPEN';
    is_open = true;
    next_close = new Date(nyTime);
    next_close.setHours(16, 0, 0, 0);
  } else if (currentMinutes >= preMarketStart && currentMinutes < marketOpen) {
    // Pre-market hours
    status = 'PRE_MARKET';
    is_open = false;
    next_open = new Date(nyTime);
    next_open.setHours(9, 30, 0, 0);
  } else if (currentMinutes >= marketClose && currentMinutes < afterHoursEnd) {
    // After-hours trading
    status = 'AFTER_HOURS';
    is_open = false;
    next_open = new Date(nyTime);
    next_open.setDate(nyTime.getDate() + 1);
    next_open.setHours(9, 30, 0, 0);
  } else {
    // Market closed (night time)
    status = 'CLOSED';
    is_open = false;
    next_open = new Date(nyTime);
    if (currentMinutes < preMarketStart) {
      // Same day
      next_open.setHours(9, 30, 0, 0);
    } else {
      // Next day
      next_open.setDate(nyTime.getDate() + 1);
      next_open.setHours(9, 30, 0, 0);
    }
  }
  
  return {
    market: 'US',
    is_open,
    status,
    current_time: now,
    next_open,
    next_close,
    timezone: 'America/New_York'
  };
}

function getSaudiMarketStatus(): MarketStatus {
  const now = new Date();
  const riyadhTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Riyadh"}));
  const hours = riyadhTime.getHours();
  const minutes = riyadhTime.getMinutes();
  const day = riyadhTime.getDay();
  
  // Saudi market: Sunday to Thursday, 10:00 AM to 3:00 PM AST
  // Friday and Saturday are weekends
  if (day === 5 || day === 6) {
    // Weekend - market closed
    const nextSunday = new Date(riyadhTime);
    nextSunday.setDate(riyadhTime.getDate() + (day === 5 ? 2 : 1)); // Next Sunday
    nextSunday.setHours(10, 0, 0, 0); // 10:00 AM AST
    
    return {
      market: 'SA',
      is_open: false,
      status: 'CLOSED',
      current_time: now,
      next_open: nextSunday,
      next_close: null,
      timezone: 'Asia/Riyadh'
    };
  }
  
  const currentMinutes = hours * 60 + minutes;
  const marketOpen = 10 * 60; // 10:00 AM
  const marketClose = 15 * 60; // 3:00 PM
  
  let status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  let is_open = false;
  let next_open: Date | null = null;
  let next_close: Date | null = null;
  
  if (currentMinutes >= marketOpen && currentMinutes < marketClose) {
    // Market open
    status = 'OPEN';
    is_open = true;
    next_close = new Date(riyadhTime);
    next_close.setHours(15, 0, 0, 0);
  } else {
    // Market closed
    status = 'CLOSED';
    is_open = false;
    next_open = new Date(riyadhTime);
    
    if (currentMinutes < marketOpen) {
      // Same day
      next_open.setHours(10, 0, 0, 0);
    } else {
      // Next trading day
      let nextDay = riyadhTime.getDate() + 1;
      let nextDayOfWeek = (day + 1) % 7;
      
      // Skip Friday and Saturday
      if (nextDayOfWeek === 5) {
        nextDay += 2; // Skip to Sunday
      } else if (nextDayOfWeek === 6) {
        nextDay += 1; // Skip to Sunday
      }
      
      next_open.setDate(nextDay);
      next_open.setHours(10, 0, 0, 0);
    }
  }
  
  return {
    market: 'SA',
    is_open,
    status,
    current_time: now,
    next_open,
    next_close,
    timezone: 'Asia/Riyadh'
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
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
    const { market } = req.query;
    
    if (market === 'US') {
      const usStatus = getUSMarketStatus();
      return res.status(200).json({
        success: true,
        data: usStatus
      });
    }
    
    if (market === 'SA') {
      const saStatus = getSaudiMarketStatus();
      return res.status(200).json({
        success: true,
        data: saStatus
      });
    }
    
    // Return both markets
    const usStatus = getUSMarketStatus();
    const saStatus = getSaudiMarketStatus();
    
    return res.status(200).json({
      success: true,
      data: {
        US: usStatus,
        SA: saStatus
      }
    });
    
  } catch (error) {
    console.error('Market Status API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
}
