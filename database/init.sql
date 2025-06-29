-- 🏗️ إعداد قاعدة البيانات الكاملة لمنصة إدارة الاستثمارات
-- تشغيل هذا الملف في Supabase SQL Editor

-- تفعيل UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================
-- جداول المستخدمين والمحافظ
-- =======================

-- جدول المحافظ الاستثمارية
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    initial_investment DECIMAL(20,4) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    benchmark_symbol VARCHAR(20) DEFAULT 'SPY',
    portfolio_type VARCHAR(10) DEFAULT 'REAL' CHECK (portfolio_type IN ('REAL', 'PAPER')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول الأسهم
CREATE TABLE stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    market VARCHAR(2) NOT NULL CHECK (market IN ('US', 'SA')),
    exchange VARCHAR(50), -- NYSE, NASDAQ, Tadawul
    sector VARCHAR(100),
    industry VARCHAR(100),
    currency VARCHAR(3) NOT NULL,
    country VARCHAR(2) DEFAULT 'US',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(symbol, market)
);

-- جدول المعاملات
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    stock_id UUID REFERENCES stocks(id),
    transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'DIVIDEND')),
    quantity DECIMAL(15,6) NOT NULL,
    price DECIMAL(15,6) NOT NULL,
    total_amount DECIMAL(20,4) GENERATED ALWAYS AS (quantity * price) STORED,
    fees DECIMAL(10,4) DEFAULT 0,
    tax DECIMAL(10,4) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    transaction_date DATE NOT NULL,
    notes TEXT,
    broker VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- جدول أسعار الأسهم
CREATE TABLE stock_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    price_type VARCHAR(15) DEFAULT 'CLOSE' CHECK (price_type IN ('OPEN', 'HIGH', 'LOW', 'CLOSE', 'ADJUSTED_CLOSE')),
    price DECIMAL(15,6) NOT NULL,
    volume BIGINT,
    market_cap BIGINT,
    price_date DATE NOT NULL,
    source VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(stock_id, price_date, price_type, source)
);

-- جدول التوزيعات المالية
CREATE TABLE dividends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stock_id UUID REFERENCES stocks(id) ON DELETE CASCADE,
    dividend_type VARCHAR(10) DEFAULT 'CASH' CHECK (dividend_type IN ('CASH', 'STOCK', 'SPECIAL')),
    amount_per_share DECIMAL(10,6) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    announcement_date DATE,
    ex_dividend_date DATE NOT NULL,
    record_date DATE,
    payment_date DATE,
    frequency VARCHAR(15) CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL', 'SPECIAL')),
    yield_percentage DECIMAL(6,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================
-- الفهارس لتحسين الأداء
-- =======================

-- فهارس المحافظ
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_active ON portfolios(is_active);

-- فهارس المعاملات
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX idx_transactions_stock_id ON transactions(stock_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- فهارس الأسعار
CREATE INDEX idx_stock_prices_stock_date ON stock_prices(stock_id, price_date);
CREATE INDEX idx_stock_prices_date ON stock_prices(price_date);

-- فهارس الأسهم
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_market ON stocks(market);
CREATE INDEX idx_stocks_active ON stocks(is_active);

-- فهارس التوزيعات
CREATE INDEX idx_dividends_stock_ex_date ON dividends(stock_id, ex_dividend_date);
CREATE INDEX idx_dividends_ex_date ON dividends(ex_dividend_date);

-- =======================
-- Row Level Security (RLS)
-- =======================

-- تفعيل RLS على جميع الجداول
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- سياسات أمان المحافظ
CREATE POLICY "Users can manage their own portfolios" 
ON portfolios FOR ALL 
USING (auth.uid() = user_id);

-- سياسات أمان المعاملات
CREATE POLICY "Users can manage their portfolio transactions" 
ON transactions FOR ALL 
USING (
    auth.uid() = (
        SELECT user_id FROM portfolios 
        WHERE id = portfolio_id
    )
);

-- سياسات قراءة الأسهم (عامة للجميع)
CREATE POLICY "Anyone can read stocks" 
ON stocks FOR SELECT 
USING (true);

-- سياسات قراءة الأسعار (عامة للجميع)
CREATE POLICY "Anyone can read stock prices" 
ON stock_prices FOR SELECT 
USING (true);

-- سياسات قراءة التوزيعات (عامة للجميع)
CREATE POLICY "Anyone can read dividends" 
ON dividends FOR SELECT 
USING (true);

-- =======================
-- Triggers للتحديث التلقائي
-- =======================

-- دالة تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة triggers
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================
-- إدخال بيانات أولية للاختبار
-- =======================

-- أسهم أمريكية شائعة
INSERT INTO stocks (symbol, name, market, exchange, sector, currency, country) VALUES
('AAPL', 'Apple Inc.', 'US', 'NASDAQ', 'Technology', 'USD', 'US'),
('GOOGL', 'Alphabet Inc.', 'US', 'NASDAQ', 'Technology', 'USD', 'US'),
('MSFT', 'Microsoft Corporation', 'US', 'NASDAQ', 'Technology', 'USD', 'US'),
('AMZN', 'Amazon.com Inc.', 'US', 'NASDAQ', 'Consumer Discretionary', 'USD', 'US'),
('TSLA', 'Tesla Inc.', 'US', 'NASDAQ', 'Consumer Discretionary', 'USD', 'US'),
('NVDA', 'NVIDIA Corporation', 'US', 'NASDAQ', 'Technology', 'USD', 'US'),
('META', 'Meta Platforms Inc.', 'US', 'NASDAQ', 'Technology', 'USD', 'US'),
('SPY', 'SPDR S&P 500 ETF Trust', 'US', 'NYSE', 'ETF', 'USD', 'US');

-- أسهم سعودية شائعة
INSERT INTO stocks (symbol, name, market, exchange, sector, currency, country) VALUES
('2222.SR', 'أرامكو السعودية', 'SA', 'Tadawul', 'Energy', 'SAR', 'SA'),
('1120.SR', 'بنك الأهلي التجاري', 'SA', 'Tadawul', 'Financial', 'SAR', 'SA'),
('2030.SR', 'سافكو', 'SA', 'Tadawul', 'Materials', 'SAR', 'SA'),
('2010.SR', 'سابك', 'SA', 'Tadawul', 'Materials', 'SAR', 'SA'),
('1211.SR', 'معادن', 'SA', 'Tadawul', 'Materials', 'SAR', 'SA'),
('7010.SR', 'المراعي', 'SA', 'Tadawul', 'Consumer Staples', 'SAR', 'SA'),
('4001.SR', 'زين السعودية', 'SA', 'Tadawul', 'Telecommunications', 'SAR', 'SA');

-- =======================
-- Views مفيدة للتحليلات
-- =======================

-- عرض تفاصيل المحافظ مع القيم الحالية
CREATE OR REPLACE VIEW portfolio_summary AS
SELECT 
    p.id,
    p.user_id,
    p.name,
    p.description,
    p.initial_investment,
    p.currency,
    p.created_at,
    COUNT(DISTINCT t.stock_id) as stocks_count,
    COUNT(t.id) as transactions_count,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.total_amount + t.fees ELSE 0 END), 0) as total_invested,
    COALESCE(SUM(CASE WHEN t.transaction_type = 'SELL' THEN t.total_amount - t.fees ELSE 0 END), 0) as total_sold
FROM portfolios p
LEFT JOIN transactions t ON p.id = t.portfolio_id
WHERE p.is_active = true
GROUP BY p.id, p.user_id, p.name, p.description, p.initial_investment, p.currency, p.created_at;

-- عرض الحيازات الحالية
CREATE OR REPLACE VIEW current_holdings AS
SELECT 
    t.portfolio_id,
    t.stock_id,
    s.symbol,
    s.name as stock_name,
    s.market,
    SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE -t.quantity END) as total_quantity,
    AVG(CASE WHEN t.transaction_type = 'BUY' THEN t.price ELSE NULL END) as avg_buy_price,
    SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.total_amount + t.fees ELSE 0 END) as total_cost
FROM transactions t
JOIN stocks s ON t.stock_id = s.id
GROUP BY t.portfolio_id, t.stock_id, s.symbol, s.name, s.market
HAVING SUM(CASE WHEN t.transaction_type = 'BUY' THEN t.quantity ELSE -t.quantity END) > 0;

-- تعليقات وملاحظات
COMMENT ON TABLE portfolios IS 'جدول المحافظ الاستثمارية للمستخدمين';
COMMENT ON TABLE stocks IS 'جدول الأسهم المتاحة في النظام';
COMMENT ON TABLE transactions IS 'جدول جميع المعاملات الاستثمارية';
COMMENT ON TABLE stock_prices IS 'جدول أسعار الأسهم التاريخية والحالية';
COMMENT ON TABLE dividends IS 'جدول التوزيعات المالية للأسهم';

-- رسالة إكمال
SELECT 'تم إنشاء قاعدة البيانات بنجاح! ✅' as status;
