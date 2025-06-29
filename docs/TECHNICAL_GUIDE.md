# 🛠️ الدليل التقني المفصل - منصة إدارة الاستثمارات

## 📋 معمارية النظام

### هيكل قاعدة البيانات المحسن

```sql
-- إعداد المخططات (Schemas)
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS notifications;

-- جدول المستخدمين المحسن
CREATE TABLE finance.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR UNIQUE NOT NULL,
    full_name VARCHAR,
    avatar_url VARCHAR,
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    timezone VARCHAR DEFAULT 'UTC',
    risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 10),
    investment_experience VARCHAR CHECK (investment_experience IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    notification_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- جدول المحافظ المحسن
CREATE TABLE finance.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES finance.users(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description TEXT,
    initial_investment DECIMAL(20,4),
    currency VARCHAR(3) DEFAULT 'USD',
    benchmark_symbol VARCHAR DEFAULT 'SPY', -- للمقارنة
    portfolio_type VARCHAR CHECK (portfolio_type IN ('REAL', 'PAPER')), -- حقيقي أو تجريبي
    is_public BOOLEAN DEFAULT FALSE, -- للمشاركة
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- جدول الأسهم المحسن
CREATE TABLE finance.stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    market VARCHAR NOT NULL CHECK (market IN ('US', 'SA')),
    exchange VARCHAR, -- NYSE, NASDAQ, Tadawul
    sector VARCHAR,
    industry VARCHAR,
    currency VARCHAR(3) NOT NULL,
    country VARCHAR(2),
    isin VARCHAR, -- International Securities Identification Number
    market_cap BIGINT,
    shares_outstanding BIGINT,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, market)
);

-- جدول المعاملات المحسن
CREATE TABLE finance.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES finance.portfolios(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES finance.stocks(id),
    transaction_type VARCHAR NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'DIVIDEND', 'SPLIT', 'MERGER')),
    quantity DECIMAL(15,6) NOT NULL,
    price DECIMAL(15,6) NOT NULL,
    total_amount DECIMAL(20,4) GENERATED ALWAYS AS (quantity * price) STORED,
    fees DECIMAL(10,4) DEFAULT 0,
    tax DECIMAL(10,4) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0, -- للتحويل للعملة الأساسية
    transaction_date DATE NOT NULL,
    execution_time TIME,
    notes TEXT,
    broker VARCHAR,
    order_id VARCHAR, -- للربط مع أنظمة الوساطة
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول أسعار الأسهم المحسن
CREATE TABLE finance.stock_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID REFERENCES finance.stocks(id) ON DELETE CASCADE,
    price_type VARCHAR DEFAULT 'CLOSE' CHECK (price_type IN ('OPEN', 'HIGH', 'LOW', 'CLOSE', 'ADJUSTED_CLOSE')),
    price DECIMAL(15,6) NOT NULL,
    volume BIGINT,
    market_cap BIGINT,
    pe_ratio DECIMAL(8,4),
    price_date DATE NOT NULL,
    source VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stock_id, price_date, price_type, source)
);

-- جدول التوزيعات المحسن
CREATE TABLE finance.dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID REFERENCES finance.stocks(id) ON DELETE CASCADE,
    dividend_type VARCHAR DEFAULT 'CASH' CHECK (dividend_type IN ('CASH', 'STOCK', 'SPECIAL')),
    amount_per_share DECIMAL(10,6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    announcement_date DATE,
    ex_dividend_date DATE NOT NULL,
    record_date DATE,
    payment_date DATE,
    frequency VARCHAR CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'SPECIAL')),
    yield_percentage DECIMAL(6,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول أداء المحافظ
CREATE TABLE analytics.portfolio_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES finance.portfolios(id) ON DELETE CASCADE,
    calculation_date DATE NOT NULL,
    total_value DECIMAL(20,4) NOT NULL,
    total_cost DECIMAL(20,4) NOT NULL,
    total_gain_loss DECIMAL(20,4) GENERATED ALWAYS AS (total_value - total_cost) STORED,
    gain_loss_percentage DECIMAL(8,4),
    dividend_income DECIMAL(15,4) DEFAULT 0,
    benchmark_return DECIMAL(8,4), -- عائد المؤشر المرجعي
    alpha DECIMAL(8,4), -- الأداء الزائد عن السوق
    beta DECIMAL(8,4), -- معامل بيتا
    sharpe_ratio DECIMAL(8,4), -- نسبة شارب
    volatility DECIMAL(8,4), -- التقلبات
    max_drawdown DECIMAL(8,4), -- أقصى انخفاض
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(portfolio_id, calculation_date)
);

-- جدول الإشعارات
CREATE TABLE notifications.user_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES finance.users(id) ON DELETE CASCADE,
    notification_type VARCHAR NOT NULL CHECK (notification_type IN ('PRICE_ALERT', 'DIVIDEND', 'NEWS', 'PERFORMANCE')),
    title VARCHAR NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول تنبيهات الأسعار
CREATE TABLE notifications.price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES finance.users(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES finance.stocks(id) ON DELETE CASCADE,
    alert_type VARCHAR NOT NULL CHECK (alert_type IN ('ABOVE', 'BELOW', 'PERCENTAGE_CHANGE')),
    target_price DECIMAL(15,6),
    percentage_change DECIMAL(6,2),
    is_active BOOLEAN DEFAULT TRUE,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### الفهارس والتحسينات

```sql
-- فهارس للأداء
CREATE INDEX idx_portfolios_user_id ON finance.portfolios(user_id);
CREATE INDEX idx_transactions_portfolio_id ON finance.transactions(portfolio_id);
CREATE INDEX idx_transactions_stock_id ON finance.transactions(stock_id);
CREATE INDEX idx_transactions_date ON finance.transactions(transaction_date);
CREATE INDEX idx_stock_prices_stock_date ON finance.stock_prices(stock_id, price_date);
CREATE INDEX idx_dividends_stock_ex_date ON finance.dividends(stock_id, ex_dividend_date);

-- فهارس للبحث
CREATE INDEX idx_stocks_symbol_gin ON finance.stocks USING gin(to_tsvector('english', symbol || ' ' || name));
CREATE INDEX idx_stocks_market ON finance.stocks(market, is_active);
```

## 🔐 سياسات الأمان (RLS)

```sql
-- تفعيل RLS على جميع الجداول
ALTER TABLE finance.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.portfolio_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications.price_alerts ENABLE ROW LEVEL SECURITY;

-- سياسات المحافظ
CREATE POLICY "Users can manage their own portfolios" 
ON finance.portfolios FOR ALL 
USING (auth.uid() = user_id);

-- سياسات المعاملات
CREATE POLICY "Users can manage their portfolio transactions" 
ON finance.transactions FOR ALL 
USING (
    auth.uid() = (
        SELECT user_id FROM finance.portfolios 
        WHERE id = portfolio_id
    )
);

-- سياسات الأداء
CREATE POLICY "Users can view their portfolio performance" 
ON analytics.portfolio_performance FOR SELECT 
USING (
    auth.uid() = (
        SELECT user_id FROM finance.portfolios 
        WHERE id = portfolio_id
    )
);

-- سياسات الإشعارات
CREATE POLICY "Users can manage their notifications" 
ON notifications.user_notifications FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their price alerts" 
ON notifications.price_alerts FOR ALL 
USING (auth.uid() = user_id);
```

## 🎯 APIs المفصلة

### 1. APIs إدارة المحافظ

```typescript
// api/portfolios/index.ts
export interface PortfolioAPI {
  // إنشاء محفظة جديدة
  POST: {
    body: {
      name: string;
      description?: string;
      initial_investment: number;
      currency: string;
      benchmark_symbol?: string;
      portfolio_type: 'REAL' | 'PAPER';
    };
    response: Portfolio;
  };

  // الحصول على جميع المحافظ
  GET: {
    query?: {
      type?: 'REAL' | 'PAPER';
      page?: number;
      limit?: number;
    };
    response: {
      portfolios: Portfolio[];
      total: number;
      page: number;
      limit: number;
    };
  };
}

// api/portfolios/[id].ts
export interface PortfolioDetailAPI {
  // تفاصيل محفظة
  GET: {
    params: { id: string };
    response: PortfolioWithHoldings;
  };

  // تحديث محفظة
  PUT: {
    params: { id: string };
    body: Partial<Portfolio>;
    response: Portfolio;
  };

  // حذف محفظة
  DELETE: {
    params: { id: string };
    response: { success: boolean };
  };
}
```

### 2. APIs المعاملات

```typescript
// api/transactions/index.ts
export interface TransactionAPI {
  // إضافة معاملة
  POST: {
    body: {
      portfolio_id: string;
      stock_symbol: string;
      transaction_type: 'BUY' | 'SELL';
      quantity: number;
      price: number;
      fees?: number;
      transaction_date: string;
      notes?: string;
    };
    response: Transaction;
  };

  // الحصول على المعاملات
  GET: {
    query?: {
      portfolio_id?: string;
      stock_id?: string;
      type?: string;
      from_date?: string;
      to_date?: string;
      page?: number;
      limit?: number;
    };
    response: {
      transactions: Transaction[];
      total: number;
      summary: TransactionSummary;
    };
  };
}
```

### 3. APIs بيانات الأسهم

```typescript
// api/stocks/search.ts
export interface StockSearchAPI {
  GET: {
    query: {
      q: string; // البحث
      market?: 'US' | 'SA';
      limit?: number;
    };
    response: {
      stocks: Stock[];
      suggestions: string[];
    };
  };
}

// api/stocks/[symbol]/price.ts
export interface StockPriceAPI {
  GET: {
    params: { symbol: string };
    query?: {
      period?: '1d' | '5d' | '1m' | '3m' | '6m' | '1y' | '5y';
      interval?: '1m' | '5m' | '15m' | '1h' | '1d';
    };
    response: {
      current_price: number;
      change: number;
      change_percentage: number;
      historical_prices: HistoricalPrice[];
    };
  };
}
```

### 4. APIs التحليلات

```typescript
// api/analytics/portfolio/[id]/performance.ts
export interface PortfolioAnalyticsAPI {
  GET: {
    params: { id: string };
    query?: {
      period?: string;
      benchmark?: string;
    };
    response: {
      current_value: number;
      total_cost: number;
      total_return: number;
      total_return_percentage: number;
      dividend_yield: number;
      beta: number;
      alpha: number;
      sharpe_ratio: number;
      max_drawdown: number;
      volatility: number;
      benchmark_comparison: BenchmarkComparison;
      sector_allocation: SectorAllocation[];
      top_holdings: Holding[];
      performance_chart: PerformanceDataPoint[];
    };
  };
}
```

## 📱 مكونات React المتقدمة

### 1. مكون لوحة التحكم الرئيسية

```typescript
// src/client/components/dashboard/DashboardOverview.tsx
interface DashboardOverviewProps {
  user: User;
  portfolios: Portfolio[];
  marketData: MarketData;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  user,
  portfolios,
  marketData
}) => {
  const totalValue = useMemo(() => 
    portfolios.reduce((sum, p) => sum + p.current_value, 0)
  , [portfolios]);

  const totalReturn = useMemo(() => 
    portfolios.reduce((sum, p) => sum + p.total_return, 0)
  , [portfolios]);

  return (
    <div className="dashboard-overview">
      {/* بطاقات الملخص */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="إجمالي القيمة"
          value={totalValue}
          format="currency"
          currency={user.preferred_currency}
        />
        <SummaryCard
          title="إجمالي العائد"
          value={totalReturn}
          format="currency"
          trend={totalReturn >= 0 ? 'up' : 'down'}
        />
        <SummaryCard
          title="عدد المحافظ"
          value={portfolios.length}
          format="number"
        />
        <SummaryCard
          title="الأداء مقابل السوق"
          value={calculateMarketComparison(portfolios, marketData)}
          format="percentage"
          trend="up"
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceChart
          data={getPortfolioPerformanceData(portfolios)}
          benchmark={marketData.sp500}
        />
        <AllocationChart
          data={getAssetAllocationData(portfolios)}
        />
      </div>

      {/* المحافظ */}
      <PortfolioList
        portfolios={portfolios}
        onPortfolioSelect={(id) => navigate(`/portfolios/${id}`)}
      />
    </div>
  );
};
```

### 2. مكون تحليل المحفظة

```typescript
// src/client/components/portfolio/PortfolioAnalytics.tsx
interface PortfolioAnalyticsProps {
  portfolio: Portfolio;
  analytics: PortfolioAnalytics;
  benchmarkData: BenchmarkData;
}

export const PortfolioAnalytics: React.FC<PortfolioAnalyticsProps> = ({
  portfolio,
  analytics,
  benchmarkData
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1y');
  
  return (
    <div className="portfolio-analytics">
      {/* أدوات التحكم */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">تحليل المحفظة</h2>
        <TimeframeSelector
          value={timeframe}
          onChange={setTimeframe}
          options={['1m', '3m', '6m', '1y', '2y', '5y']}
        />
      </div>

      {/* مقاييس الأداء */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="العائد الإجمالي"
          value={analytics.total_return_percentage}
          format="percentage"
          comparison={benchmarkData.return_percentage}
        />
        <MetricCard
          label="نسبة شارب"
          value={analytics.sharpe_ratio}
          format="ratio"
          tooltip="نسبة شارب تقيس العائد المُعدل بالمخاطر"
        />
        <MetricCard
          label="معامل بيتا"
          value={analytics.beta}
          format="ratio"
          tooltip="بيتا يقيس حساسية المحفظة لحركة السوق"
        />
        <MetricCard
          label="أقصى انخفاض"
          value={analytics.max_drawdown}
          format="percentage"
          isNegative
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>أداء المحفظة مقابل المؤشر</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceComparisonChart
              portfolioData={analytics.performance_history}
              benchmarkData={benchmarkData.performance_history}
              timeframe={timeframe}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع القطاعات</CardTitle>
          </CardHeader>
          <CardContent>
            <SectorAllocationChart
              data={analytics.sector_allocation}
            />
          </CardContent>
        </Card>
      </div>

      {/* تحليل المخاطر */}
      <RiskAnalysis
        volatility={analytics.volatility}
        var95={analytics.value_at_risk_95}
        correlationMatrix={analytics.correlation_matrix}
      />
    </div>
  );
};
```

### 3. مكون إدارة المعاملات

```typescript
// src/client/components/transactions/TransactionManager.tsx
export const TransactionManager: React.FC<{ portfolioId: string }> = ({
  portfolioId
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const { data: transactions, isLoading } = useTransactions(portfolioId);
  const { mutate: addTransaction } = useAddTransaction();
  const { mutate: updateTransaction } = useUpdateTransaction();
  const { mutate: deleteTransaction } = useDeleteTransaction();

  const handleSubmit = (data: TransactionFormData) => {
    if (selectedTransaction) {
      updateTransaction({ id: selectedTransaction.id, ...data });
    } else {
      addTransaction({ portfolio_id: portfolioId, ...data });
    }
    setShowForm(false);
    setSelectedTransaction(null);
  };

  return (
    <div className="transaction-manager">
      {/* رأس الصفحة */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">المعاملات</h2>
        <Button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          إضافة معاملة
        </Button>
      </div>

      {/* ملخص المعاملات */}
      <TransactionSummary
        transactions={transactions}
        className="mb-6"
      />

      {/* جدول المعاملات */}
      <TransactionTable
        transactions={transactions}
        isLoading={isLoading}
        onEdit={setSelectedTransaction}
        onDelete={(id) => deleteTransaction(id)}
      />

      {/* نموذج إضافة/تعديل */}
      <TransactionDialog
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleSubmit}
        initialData={selectedTransaction}
        portfolioId={portfolioId}
      />
    </div>
  );
};
```

## 🧮 الحسابات المالية المتقدمة

```typescript
// src/shared/utils/financialCalculations.ts

/**
 * حساب العائد على الاستثمار (ROI)
 */
export function calculateROI(
  currentValue: number,
  initialInvestment: number,
  dividends: number = 0
): number {
  return ((currentValue + dividends - initialInvestment) / initialInvestment) * 100;
}

/**
 * حساب العائد السنوي المركب (CAGR)
 */
export function calculateCAGR(
  beginningValue: number,
  endingValue: number,
  numberOfYears: number
): number {
  return (Math.pow(endingValue / beginningValue, 1 / numberOfYears) - 1) * 100;
}

/**
 * حساب نسبة شارب
 */
export function calculateSharpeRatio(
  portfolioReturn: number,
  riskFreeRate: number,
  portfolioVolatility: number
): number {
  return (portfolioReturn - riskFreeRate) / portfolioVolatility;
}

/**
 * حساب معامل بيتا
 */
export function calculateBeta(
  portfolioReturns: number[],
  marketReturns: number[]
): number {
  const portfolioVariance = calculateVariance(portfolioReturns);
  const covariance = calculateCovariance(portfolioReturns, marketReturns);
  return covariance / portfolioVariance;
}

/**
 * حساب قيمة في المخاطر (VaR)
 */
export function calculateVaR(
  portfolioValue: number,
  returns: number[],
  confidenceLevel: number = 0.95
): number {
  const sortedReturns = returns.sort((a, b) => a - b);
  const index = Math.floor((1 - confidenceLevel) * returns.length);
  const percentileReturn = sortedReturns[index];
  return portfolioValue * Math.abs(percentileReturn);
}

/**
 * حساب أقصى انخفاض (Maximum Drawdown)
 */
export function calculateMaxDrawdown(values: number[]): number {
  let maxDrawdown = 0;
  let peak = values[0];
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] > peak) {
      peak = values[i];
    } else {
      const drawdown = (peak - values[i]) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
  }
  
  return maxDrawdown * 100;
}

/**
 * حساب التقلبات (Volatility)
 */
export function calculateVolatility(returns: number[]): number {
  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  return Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized
}

/**
 * حساب معامل الارتباط
 */
export function calculateCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return numerator / denominator;
}
```

## 🎨 نظام التصميم المتقدم

```typescript
// src/client/styles/theme.ts
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      900: '#1e3a8a'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d'
    },
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem', 
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem'
  },
  typography: {
    fontFamily: {
      arabic: ['Cairo', 'system-ui', 'sans-serif'],
      english: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  }
} as const;

// مكونات النظام الأساسية
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}>`
  ${({ variant = 'primary', size = 'md', theme }) => css`
    background-color: ${theme.colors[variant][500]};
    color: white;
    padding: ${size === 'sm' ? '0.5rem 1rem' : size === 'lg' ? '1rem 2rem' : '0.75rem 1.5rem'};
    border-radius: ${theme.borderRadius.md};
    font-weight: 500;
    transition: all 0.2s;
    
    &:hover {
      background-color: ${theme.colors[variant][600]};
    }
    
    &:focus {
      outline: 2px solid ${theme.colors[variant][500]};
      outline-offset: 2px;
    }
  `}
`;
```

هذا الدليل التقني المفصل يوفر أساساً قوياً لتطوير المنصة. هل تريد أن نبدأ بتنفيذ أي جزء محدد من هذه الخطة؟
