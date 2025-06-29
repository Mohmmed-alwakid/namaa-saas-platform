import { BarChart3, DollarSign, Eye, Plus, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';
import { formatCurrency, usePortfolioCalculations, usePortfolios } from '../hooks/usePortfolio';
import { useWatchlist } from '../hooks/useStocks';

const DashboardPage: React.FC = () => {
  const { data: portfolios = [], isLoading: portfoliosLoading, refetch: refetchPortfolios } = usePortfolios();
  const { data: watchlist = [], isLoading: watchlistLoading, refetch: refetchWatchlist } = useWatchlist();
  const { totalValue, totalReturn, totalDailyChange, totalReturnPercent } = usePortfolioCalculations(portfolios);

  const refreshData = async () => {
    await Promise.all([refetchPortfolios(), refetchWatchlist()]);
  };

  if (portfoliosLoading || watchlistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="container-center py-8">
        {/* Page header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
            <p className="mt-2 text-gray-600">مرحباً بك في منصة إدارة الاستثمارات</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={refreshData}
              className="btn btn-secondary flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              تحديث البيانات
            </button>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" />
              محفظة جديدة
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي القيمة</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalValue.toLocaleString('ar-SA')} ر.س
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className={`${totalDailyChange >= 0 ? 'text-green-600' : 'text-red-600'} font-medium flex items-center`}>
                  {totalDailyChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 ml-1" />
                  )}
                  {Math.abs(totalDailyChange).toLocaleString('ar-SA')} ر.س
                </span>
                <span className="text-gray-500 mr-2">اليوم</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">إجمالي العائد</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalReturn.toLocaleString('ar-SA')} ر.س
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className={`${totalReturnPercent >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                  {totalReturnPercent.toFixed(2)}%
                </span>
                <span className="text-gray-500 mr-2">نسبة العائد</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BarChart3 className="h-6 w-6 text-purple-500" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">عدد المحافظ</dt>
                  <dd className="text-lg font-medium text-gray-900">{portfolios.length}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">
                  {portfolios.filter(p => p.portfolio_type === 'REAL').length} حقيقية، {' '}
                  {portfolios.filter(p => p.portfolio_type === 'PAPER').length} تجريبية
                </span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Eye className="h-6 w-6 text-orange-500" />
              </div>
              <div className="mr-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">قائمة المتابعة</dt>
                  <dd className="text-lg font-medium text-gray-900">{watchlist.length}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">أسهم للمتابعة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolios Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {portfolios.map((portfolio) => (
            <div key={portfolio.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{portfolio.name}</h3>
                  <p className="text-sm text-gray-600">{portfolio.description}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-2 ${
                    portfolio.portfolio_type === 'REAL' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {portfolio.portfolio_type === 'REAL' ? 'حقيقية' : 'تجريبية'}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">القيمة الحالية</span>
                  <span className="font-medium">
                    {formatCurrency(portfolio.stats.current_value || 0, portfolio.currency)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">العائد الإجمالي</span>
                  <span className={`font-medium ${
                    (portfolio.stats.total_return || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(portfolio.stats.total_return || 0, portfolio.currency)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">التغيير اليومي</span>
                  <span className={`font-medium flex items-center ${
                    (portfolio.stats.daily_change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(portfolio.stats.daily_change || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 ml-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 ml-1" />
                    )}
                    {formatCurrency(Math.abs(portfolio.stats.daily_change || 0), portfolio.currency)}
                  </span>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{portfolio.stats.stocks_count} سهم</span>
                    <span>{portfolio.stats.transactions_count} معاملة</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Watchlist */}
        <div className="card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">قائمة المتابعة</h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              عرض الكل
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">الرمز</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">الاسم</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">السعر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">التغيير</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-900">السوق</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((stock) => (
                  <tr key={stock.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{stock.symbol}</td>
                    <td className="py-3 px-4 text-gray-600">{stock.name}</td>
                    <td className="py-3 px-4 font-medium">{stock.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center ${
                        stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stock.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 ml-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 ml-1" />
                        )}
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.change_percent.toFixed(2)}%)
                      </span>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
