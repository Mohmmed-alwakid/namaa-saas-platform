import { Filter, Plus, RefreshCw, Search, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Types
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
}

const StocksPage: React.FC = () => {
  const [stocks, setStocks] = useState<StockPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'US' | 'SA'>('ALL');
  const [sortBy, setSortBy] = useState<'symbol' | 'price' | 'change'>('symbol');

  // البيانات التجريبية
  const mockStocks: StockPrice[] = [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 185.25,
      change: 2.15,
      change_percent: 1.17,
      volume: 45234567,
      market_cap: 2.85e12,
      market: 'US',
      sector: 'Technology'
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
      sector: 'Technology'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 142.80,
      change: 3.45,
      change_percent: 2.47,
      volume: 28456789,
      market_cap: 1.78e12,
      market: 'US',
      sector: 'Technology'
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
      sector: 'Automotive'
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
      sector: 'Energy'
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
      sector: 'Banking'
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
      sector: 'Utilities'
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
      sector: 'Banking'
    }
  ];

  useEffect(() => {
    const loadStocks = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStocks(mockStocks);
      setLoading(false);
    };

    loadStocks();
  }, []);

  const refreshPrices = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // محاكاة تحديث الأسعار
    const updatedStocks = stocks.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 2,
      change: (Math.random() - 0.5) * 5,
      change_percent: (Math.random() - 0.5) * 3
    }));
    setStocks(updatedStocks);
    setRefreshing(false);
  };

  // تصفية وترتيب الأسهم
  const filteredAndSortedStocks = stocks
    .filter(stock => {
      const matchesSearch = stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stock.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMarket = filterMarket === 'ALL' || stock.market === filterMarket;
      return matchesSearch && matchesMarket;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return b.price - a.price;
        case 'change':
          return b.change_percent - a.change_percent;
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });

  const formatMarketCap = (marketCap?: number) => {
    if (!marketCap) return 'غير متاح';
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)} تريليون`;
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(2)} مليار`;
    return `${(marketCap / 1e6).toFixed(2)} مليون`;
  };

  const formatVolume = (volume?: number) => {
    if (!volume) return 'غير متاح';
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}م`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}ك`;
    return volume.toLocaleString('ar-SA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل أسعار الأسهم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container-center py-8">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">أسعار الأسهم</h1>
            <p className="mt-2 text-gray-600">متابعة أسعار الأسهم الأمريكية والسعودية</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={refreshPrices}
              disabled={refreshing}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              تحديث الأسعار
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إضافة للمتابعة
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث عن سهم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={filterMarket}
                  onChange={(e) => setFilterMarket(e.target.value as 'ALL' | 'US' | 'SA')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">جميع الأسواق</option>
                  <option value="US">السوق الأمريكي</option>
                  <option value="SA">السوق السعودي</option>
                </select>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'symbol' | 'price' | 'change')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="symbol">ترتيب بالرمز</option>
                <option value="price">ترتيب بالسعر</option>
                <option value="change">ترتيب بالتغيير</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stocks Table */}
        <div className="card p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">الرمز</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">اسم الشركة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">السعر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">التغيير</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">النسبة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">الحجم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">القيمة السوقية</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">السوق</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {stock.symbol}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{stock.name}</div>
                        {stock.sector && (
                          <div className="text-sm text-gray-500">{stock.sector}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {stock.market === 'US' ? '$' : ''}{stock.price.toFixed(2)}
                      {stock.market === 'SA' ? ' ر.س' : ''}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 ml-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 ml-1" />
                        )}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        stock.change_percent >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change_percent >= 0 ? '+' : ''}{stock.change_percent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatVolume(stock.volume)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {formatMarketCap(stock.market_cap)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        stock.market === 'US' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {stock.market === 'US' ? 'أمريكي' : 'سعودي'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        إضافة للمتابعة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedStocks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                لا توجد أسهم مطابقة
              </h3>
              <p className="text-gray-600">
                جرب تغيير كلمات البحث أو المرشحات
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {filteredAndSortedStocks.length}
              </div>
              <div className="text-sm text-gray-600">إجمالي الأسهم</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredAndSortedStocks.filter(s => s.change >= 0).length}
              </div>
              <div className="text-sm text-gray-600">أسهم صاعدة</div>
            </div>
          </div>
          <div className="card p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredAndSortedStocks.filter(s => s.change < 0).length}
              </div>
              <div className="text-sm text-gray-600">أسهم هابطة</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StocksPage;
