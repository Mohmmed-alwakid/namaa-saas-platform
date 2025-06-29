import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Types
export interface StockPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume?: number;
  market_cap?: number;
  market: 'US' | 'SA';
  sector?: string;
  timestamp?: Date;
  is_real_time?: boolean;
  last_updated?: string;
}

interface MarketStatus {
  market: 'US' | 'SA';
  is_open: boolean;
  status: 'OPEN' | 'CLOSED' | 'PRE_MARKET' | 'AFTER_HOURS';
  current_time: Date;
  next_open: Date | null;
  next_close: Date | null;
  timezone: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// API client functions
async function fetchRealTimeStocks(symbols?: string[]): Promise<StockPrice[]> {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3005' 
    : '';
  
  const url = symbols?.length 
    ? `${baseUrl}/api/stocks/real-time?symbols=${symbols.join(',')}`
    : `${baseUrl}/api/stocks/real-time`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks: ${response.status}`);
    }
    
    const result: ApiResponse<StockPrice[]> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch stock data');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching real-time stocks:', error);
    // Fallback to mock data if API fails
    return getMockWatchlist();
  }
}

async function fetchMarketStatus(market?: 'US' | 'SA'): Promise<MarketStatus | Record<string, MarketStatus>> {
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3005' 
    : '';
  
  const url = market 
    ? `${baseUrl}/api/market/status?market=${market}`
    : `${baseUrl}/api/market/status`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market status: ${response.status}`);
    }
    
    const result: ApiResponse<MarketStatus | Record<string, MarketStatus>> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch market status');
    }
    
    return result.data;
  } catch (error) {
    console.error('Error fetching market status:', error);
    // Fallback to default status
    return {
      market: market || 'US',
      is_open: false,
      status: 'CLOSED',
      current_time: new Date(),
      next_open: null,
      next_close: null,
      timezone: market === 'SA' ? 'Asia/Riyadh' : 'America/New_York'
    } as MarketStatus;
  }
}
    console.error('خطأ في جلب قائمة المتابعة:', error);
    return getMockWatchlist();
  }
};

const searchStocks = async (params: StockSearchParams): Promise<StockPrice[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (params.symbol) queryParams.append('symbol', params.symbol);
    if (params.market) queryParams.append('market', params.market);
    if (params.sector) queryParams.append('sector', params.sector);

    const response = await fetch(`/api/stocks/search?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('فشل في البحث عن الأسهم');
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('خطأ في البحث عن الأسهم:', error);
    return getMockStocks();
  }
};

// Mock data functions
const getMockWatchlist = (): StockPrice[] => [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 185.25,
    change: 2.15,
    change_percent: 1.17,
    volume: 45234567,
    market_cap: 2.85e12,
    market: 'US',
    sector: 'Technology',
    last_updated: new Date().toISOString()
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 338.50,
    change: -1.25,
    change_percent: -0.37,
    volume: 32145678,
    market_cap: 2.52e12,
    market: 'US',
    sector: 'Technology',
    last_updated: new Date().toISOString()
  },
  {
    symbol: '2222.SR',
    name: 'أرامكو السعودية',
    price: 27.85,
    change: 0.45,
    change_percent: 1.64,
    volume: 12345678,
    market_cap: 2.1e12,
    market: 'SA',
    sector: 'Energy',
    last_updated: new Date().toISOString()
  },
  {
    symbol: '1120.SR',
    name: 'مصرف الراجحي',
    price: 85.20,
    change: -0.60,
    change_percent: -0.70,
    volume: 8765432,
    market_cap: 1.28e11,
    market: 'SA',
    sector: 'Banking',
    last_updated: new Date().toISOString()
  },
];

const getMockStocks = (): StockPrice[] => [
  ...getMockWatchlist(),
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.80,
    change: 3.45,
    change_percent: 2.47,
    volume: 28456789,
    market_cap: 1.78e12,
    market: 'US',
    sector: 'Technology',
    last_updated: new Date().toISOString()
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.30,
    change: -5.67,
    change_percent: -2.23,
    volume: 67890123,
    market_cap: 7.89e11,
    market: 'US',
    sector: 'Automotive',
    last_updated: new Date().toISOString()
  },
  {
    symbol: '2380.SR',
    name: 'الشركة السعودية للكهرباء',
    price: 18.45,
    change: 0.25,
    change_percent: 1.37,
    volume: 5432167,
    market_cap: 9.23e10,
    market: 'SA',
    sector: 'Utilities',
    last_updated: new Date().toISOString()
  },
  {
    symbol: '7010.SR',
    name: 'مصرف الإنماء',
    price: 55.70,
    change: 1.20,
    change_percent: 2.20,
    volume: 3456789,
    market_cap: 8.9e10,
    market: 'SA',
    sector: 'Banking',
    last_updated: new Date().toISOString()
  }
];

// Custom hooks
export const useStockPrice = (symbol: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchStockPrice(symbol),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute for stock prices
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useWatchlist = () => {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: fetchWatchlist,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useStockSearch = (params: StockSearchParams) => {
  return useQuery({
    queryKey: ['stocks', 'search', params],
    queryFn: () => searchStocks(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useAllStocks = () => {
  return useQuery({
    queryKey: ['stocks', 'all'],
    queryFn: () => searchStocks({}),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Utility functions
export const formatMarketCap = (marketCap?: number): string => {
  if (!marketCap) return 'غير متاح';
  if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)} تريليون`;
  if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)} مليار`;
  return `${(marketCap / 1e6).toFixed(2)} مليون`;
};

export const formatVolume = (volume?: number): string => {
  if (!volume) return 'غير متاح';
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}م`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}ك`;
  return volume.toLocaleString('ar-SA');
};

export const formatStockPrice = (price: number, market: 'US' | 'SA'): string => {
  const formatted = price.toFixed(2);
  return market === 'US' ? `$${formatted}` : `${formatted} ر.س`;
};

export const getMarketStatus = (market: 'US' | 'SA'): { isOpen: boolean; status: string } => {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (market === 'US') {
    // سوق أمريكي مفتوح من 9:30 إلى 16:00 EST (15:30 - 22:00 بتوقيت السعودية)
    const saudiHour = currentHour + 8; // تقريبي
    const isOpen = saudiHour >= 15.5 && saudiHour <= 22;
    return {
      isOpen,
      status: isOpen ? 'مفتوح' : 'مغلق'
    };
  } else {
    // سوق سعودي مفتوح من 10:00 إلى 15:00
    const isOpen = currentHour >= 10 && currentHour <= 15;
    return {
      isOpen,
      status: isOpen ? 'مفتوح' : 'مغلق'
    };
  }
};

export const isPositiveChange = (change: number): boolean => change >= 0;

export const getChangeColor = (change: number): string => {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
};

export const getChangeBgColor = (change: number): string => {
  return change >= 0 ? 'bg-green-100' : 'bg-red-100';
};

export default useStockPrice;
