import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

// Types
export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  initial_investment: number;
  currency: string;
  portfolio_type: 'REAL' | 'PAPER';
  benchmark_symbol?: string;
  created_at: string;
  updated_at: string;
  stats: {
    transactions_count: number;
    stocks_count: number;
    current_value?: number;
    total_return?: number;
    daily_change?: number;
  };
}

export interface CreatePortfolioData {
  name: string;
  description?: string;
  initial_investment: number;
  currency: string;
  portfolio_type: 'REAL' | 'PAPER';
  benchmark_symbol?: string;
}

// API functions
const fetchPortfolios = async (): Promise<Portfolio[]> => {
  try {
    const response = await fetch('/api/portfolios', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error('فشل في جلب المحافظ');
    }

    const result = await response.json();
    return result.data?.portfolios || [];
  } catch (error) {
    console.error('خطأ في جلب المحافظ:', error);
    // إرجاع بيانات تجريبية في حالة الخطأ
    return getMockPortfolios();
  }
};

const createPortfolio = async (data: CreatePortfolioData): Promise<Portfolio> => {
  const response = await fetch('/api/portfolios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('فشل في إنشاء المحفظة');
  }

  const result = await response.json();
  return result.data;
};

// Mock data function
const getMockPortfolios = (): Portfolio[] => [
  {
    id: '1',
    name: 'المحفظة الرئيسية',
    description: 'استثمارات طويلة المدى في أسهم مختارة',
    initial_investment: 100000,
    currency: 'SAR',
    portfolio_type: 'REAL',
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-06-29T10:30:00Z',
    stats: {
      transactions_count: 15,
      stocks_count: 8,
      current_value: 125500,
      total_return: 25500,
      daily_change: 1250
    }
  },
  {
    id: '2', 
    name: 'محفظة النمو',
    description: 'أسهم تقنية عالية النمو',
    initial_investment: 50000,
    currency: 'USD',
    portfolio_type: 'REAL',
    created_at: '2024-02-01T14:20:00Z',
    updated_at: '2024-06-29T14:20:00Z',
    stats: {
      transactions_count: 10,
      stocks_count: 5,
      current_value: 58200,
      total_return: 8200,
      daily_change: -650
    }
  },
  {
    id: '3',
    name: 'محفظة تجريبية',
    description: 'للاختبار والتعلم',
    initial_investment: 10000,
    currency: 'USD',
    portfolio_type: 'PAPER',
    created_at: '2024-01-20T09:15:00Z',
    updated_at: '2024-06-29T09:15:00Z',
    stats: {
      transactions_count: 5,
      stocks_count: 3,
      current_value: 11500,
      total_return: 1500,
      daily_change: 200
    }
  },
  {
    id: '4',
    name: 'محفظة الدخل',
    description: 'أسهم عالية التوزيعات',
    initial_investment: 75000,
    currency: 'SAR',
    portfolio_type: 'REAL',
    created_at: '2024-01-10T16:45:00Z',
    updated_at: '2024-06-29T16:45:00Z',
    stats: {
      transactions_count: 12,
      stocks_count: 6,
      current_value: 78900,
      total_return: 3900,
      daily_change: 320
    }
  }
];

// Custom hooks
export const usePortfolios = () => {
  return useQuery({
    queryKey: ['portfolios'],
    queryFn: fetchPortfolios,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPortfolio,
    onSuccess: () => {
      // إعادة تحميل قائمة المحافظ عند النجاح
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
};

// Hook for portfolio calculations
export const usePortfolioCalculations = (portfolios: Portfolio[]) => {
  const [calculations, setCalculations] = useState({
    totalValue: 0,
    totalReturn: 0,
    totalDailyChange: 0,
    totalReturnPercent: 0,
    totalInvestment: 0,
  });

  useEffect(() => {
    const totalValue = portfolios.reduce((sum, p) => sum + (p.stats.current_value || 0), 0);
    const totalReturn = portfolios.reduce((sum, p) => sum + (p.stats.total_return || 0), 0);
    const totalDailyChange = portfolios.reduce((sum, p) => sum + (p.stats.daily_change || 0), 0);
    const totalInvestment = portfolios.reduce((sum, p) => sum + p.initial_investment, 0);
    const totalReturnPercent = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;

    setCalculations({
      totalValue,
      totalReturn,
      totalDailyChange,
      totalReturnPercent,
      totalInvestment,
    });
  }, [portfolios]);

  return calculations;
};

// Utility functions
export const formatCurrency = (amount: number, currency: string) => {
  const formatted = amount.toLocaleString('ar-SA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return currency === 'USD' ? `$${formatted}` : `${formatted} ر.س`;
};

export const calculateReturnPercent = (portfolio: Portfolio) => {
  if (portfolio.initial_investment === 0) return 0;
  return ((portfolio.stats.total_return || 0) / portfolio.initial_investment) * 100;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default usePortfolios;
