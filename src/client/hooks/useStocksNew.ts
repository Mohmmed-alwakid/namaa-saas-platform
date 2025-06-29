import { useState, useCallback } from 'react';
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

export interface StockSearchParams {
  symbol?: string;
  market?: 'US' | 'SA';
  sector?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  message?: string;
}

// Mock data functions (fallback when API is not available)
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
    last_updated: new Date().toISOString(),
    is_real_time: false
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
    last_updated: new Date().toISOString(),
    is_real_time: false
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
    last_updated: new Date().toISOString(),
    is_real_time: false
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
    last_updated: new Date().toISOString(),
    is_real_time: false
  },
];

// API client functions with fallback to mock data
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
    
    return result.data.map(stock => ({
      ...stock,
      is_real_time: true,
      timestamp: new Date(stock.timestamp || new Date())
    }));
  } catch (error) {
    console.warn('Real-time API not available, using mock data:', error);
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
    console.warn('Market status API not available, using fallback:', error);
    // Fallback to default status
    const fallbackStatus: MarketStatus = {
      market: (market || 'US') as 'US' | 'SA',
      is_open: false,
      status: 'CLOSED',
      current_time: new Date(),
      next_open: null,
      next_close: null,
      timezone: market === 'SA' ? 'Asia/Riyadh' : 'America/New_York'
    };
    
    return market ? fallbackStatus : { US: fallbackStatus, SA: { ...fallbackStatus, market: 'SA' } };
  }
}

// Enhanced hooks with real-time support
export const useRealTimeStocks = (symbols?: string[], refreshInterval = 15000) => {
  const queryClient = useQueryClient();
  
  const {
    data: stocks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['stocks', 'real-time', symbols],
    queryFn: () => fetchRealTimeStocks(symbols),
    refetchInterval: refreshInterval,
    staleTime: 10000, // Consider data stale after 10 seconds
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors
      if (failureCount < 3 && error.message.includes('fetch')) {
        return true;
      }
      return false;
    }
  });
  
  // Manual refresh function
  const refresh = useCallback(async () => {
    await refetch();
  }, [refetch]);
  
  // Invalidate cache and force refresh
  const forceRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['stocks', 'real-time'] });
    await refetch();
  }, [queryClient, refetch]);
  
  return {
    data: stocks,
    isLoading,
    error,
    refetch: refresh,
    forceRefresh,
    lastUpdated: stocks.length > 0 && stocks[0].timestamp ? new Date(stocks[0].timestamp) : null
  };
};

// Hook for market status
export const useMarketStatus = (market?: 'US' | 'SA') => {
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['market', 'status', market],
    queryFn: () => fetchMarketStatus(market),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Consider stale after 30 seconds
  });
  
  // Extract market data based on whether we're fetching single or multiple markets
  const marketData = market && data && typeof data === 'object' && 'market' in data 
    ? data as MarketStatus
    : data as Record<string, MarketStatus>;
  
  const isMarketOpen = market 
    ? (marketData as MarketStatus)?.is_open || false
    : Object.values(marketData || {}).some(status => status.is_open);
  
  return {
    data: marketData,
    isMarketOpen,
    isLoading,
    error,
    refetch
  };
};

// Hook for stock watchlist with real-time updates
export const useWatchlist = (watchlistSymbols: string[] = []) => {
  const [symbols, setSymbols] = useState<string[]>(watchlistSymbols);
  
  const {
    data: stocks,
    isLoading,
    error,
    refetch,
    forceRefresh,
    lastUpdated
  } = useRealTimeStocks(symbols.length > 0 ? symbols : undefined);
  
  // Add stock to watchlist
  const addToWatchlist = useCallback((symbol: string) => {
    setSymbols(prev => {
      if (!prev.includes(symbol)) {
        return [...prev, symbol.toUpperCase()];
      }
      return prev;
    });
  }, []);
  
  // Remove stock from watchlist
  const removeFromWatchlist = useCallback((symbol: string) => {
    setSymbols(prev => prev.filter(s => s !== symbol.toUpperCase()));
  }, []);
  
  // Clear watchlist
  const clearWatchlist = useCallback(() => {
    setSymbols([]);
  }, []);
  
  return {
    data: stocks || [],
    symbols,
    isLoading,
    error,
    refetch,
    forceRefresh,
    lastUpdated,
    addToWatchlist,
    removeFromWatchlist,
    clearWatchlist
  };
};

// Legacy compatibility hooks
export const useStockPrice = (symbol: string, enabled: boolean = true) => {
  console.warn('useStockPrice is deprecated. Use useRealTimeStocks([symbol]) instead.');
  return useQuery({
    queryKey: ['stock', symbol],
    queryFn: () => fetchRealTimeStocks([symbol]).then(stocks => stocks[0]),
    enabled,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Refetch every 2 minutes
  });
};

export const useStockSearch = (params: StockSearchParams) => {
  console.warn('useStockSearch is deprecated. Use useRealTimeStocks with filtered symbols instead.');
  return useQuery({
    queryKey: ['stocks', 'search', params],
    queryFn: () => fetchRealTimeStocks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllStocks = () => {
  console.warn('useAllStocks is deprecated. Use useRealTimeStocks() instead.');
  return useRealTimeStocks();
};

// Export new primary hooks as default
export const useStocks = useRealTimeStocks;
export const useUSMarketStatus = () => useMarketStatus('US');
export const useSaudiMarketStatus = () => useMarketStatus('SA');
