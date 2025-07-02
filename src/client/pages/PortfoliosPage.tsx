import { Edit, Eye, Filter, Plus, Search, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// Types
interface Portfolio {
  id: string;
  name: string;
  description?: string;
  initial_investment: number;
  currency: string;
  portfolio_type: 'REAL' | 'PAPER';
  created_at: string;
  stats: {
    transactions_count: number;
    stocks_count: number;
    current_value?: number;
    total_return?: number;
    daily_change?: number;
  };
}

// البيانات التجريبية - moved outside component to avoid dependency issues
const mockPortfolios: Portfolio[] = [
  {
    id: '1',
    name: 'المحفظة الرئيسية',
    description: 'استثمارات طويلة المدى في أسهم مختارة',
    initial_investment: 100000,
    currency: 'SAR',
    portfolio_type: 'REAL',
    created_at: '2024-01-15T10:30:00Z',
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
      stats: {
        transactions_count: 12,
        stocks_count: 6,
        current_value: 78900,
        total_return: 3900,
        daily_change: 320
      }
    }
  ];

const PortfoliosPage: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'REAL' | 'PAPER'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const loadPortfolios = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPortfolios(mockPortfolios);
      setLoading(false);
    };

    loadPortfolios();
  }, []);

  // تصفية المحافظ
  const filteredPortfolios = portfolios.filter(portfolio => {
    const matchesSearch = portfolio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (portfolio.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesFilter = filterType === 'ALL' || portfolio.portfolio_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateReturnPercent = (portfolio: Portfolio) => {
    if (portfolio.initial_investment === 0) return 0;
    return ((portfolio.stats.total_return || 0) / portfolio.initial_investment) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المحافظ...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">إدارة المحافظ</h1>
            <p className="mt-2 text-gray-600">قم بإنشاء ومتابعة محافظك الاستثمارية</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            محفظة جديدة
          </button>
        </div>

        {/* Search and Filter */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="البحث في المحافظ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'ALL' | 'REAL' | 'PAPER')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">جميع المحافظ</option>
                <option value="REAL">المحافظ الحقيقية</option>
                <option value="PAPER">المحافظ التجريبية</option>
              </select>
            </div>
          </div>
        </div>

        {/* Portfolios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPortfolios.map((portfolio) => (
            <div key={portfolio.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {portfolio.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {portfolio.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      portfolio.portfolio_type === 'REAL' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {portfolio.portfolio_type === 'REAL' ? 'حقيقية' : 'تجريبية'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(portfolio.created_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50">
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-green-600 rounded-lg hover:bg-green-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">الاستثمار الأولي</span>
                  <span className="font-medium">
                    {portfolio.initial_investment.toLocaleString('ar-SA')} {portfolio.currency}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">القيمة الحالية</span>
                  <span className="font-medium text-lg">
                    {portfolio.stats.current_value?.toLocaleString('ar-SA')} {portfolio.currency}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">العائد الإجمالي</span>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${
                      (portfolio.stats.total_return || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {portfolio.stats.total_return?.toLocaleString('ar-SA')} {portfolio.currency}
                    </span>
                    <span className={`text-sm ${
                      calculateReturnPercent(portfolio) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ({calculateReturnPercent(portfolio).toFixed(2)}%)
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">التغيير اليومي</span>
                  <span className={`font-medium flex items-center ${
                    (portfolio.stats.daily_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(portfolio.stats.daily_change || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 ml-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 ml-1" />
                    )}
                    {Math.abs(portfolio.stats.daily_change || 0).toLocaleString('ar-SA')} {portfolio.currency}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{portfolio.stats.stocks_count} سهم</span>
                    <span>{portfolio.stats.transactions_count} معاملة</span>
                  </div>
                </div>

                <button className="w-full mt-4 btn btn-secondary">
                  عرض التفاصيل
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPortfolios.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد محافظ مطابقة
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'جرب تغيير كلمات البحث أو المرشحات' : 'قم بإنشاء محفظتك الأولى للبدء'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary"
              >
                إنشاء محفظة جديدة
              </button>
            )}
          </div>
        )}

        {/* Create Portfolio Modal - نموذج بسيط */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">إنشاء محفظة جديدة</h3>
              <p className="text-gray-600 mb-4">
                سيتم تطوير نموذج إنشاء المحافظ في المرحلة التالية
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  إلغاء
                </button>
                <button className="btn btn-primary flex-1">
                  إنشاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfoliosPage;
