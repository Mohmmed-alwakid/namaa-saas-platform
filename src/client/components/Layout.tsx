import { BarChart3, Briefcase, Menu, TrendingUp, X } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();

  const navigation = [
    { 
      name: 'لوحة التحكم', 
      href: '/dashboard', 
      current: location.pathname === '/dashboard',
      icon: BarChart3
    },
    { 
      name: 'المحافظ', 
      href: '/portfolios', 
      current: location.pathname === '/portfolios',
      icon: Briefcase
    },
    { 
      name: 'أسعار الأسهم', 
      href: '/stocks', 
      current: location.pathname === '/stocks',
      icon: TrendingUp
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="container-center">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0">
                <Link to="/" className="flex items-center px-4 text-lg font-bold text-gray-900">
                  <BarChart3 className="h-8 w-8 text-blue-600 ml-2" />
                  <span className="text-blue-600">نماء</span>
                  <span className="text-gray-700 mr-1">للاستثمار</span>
                </Link>
              </div>
              <div className="hidden sm:mr-6 sm:flex sm:space-x-reverse sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors`}
                  >
                    <item.icon className="h-4 w-4 ml-1" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="hidden sm:mr-6 sm:flex sm:items-center">
              <div className="ml-3 relative">
                <Link
                  to="/login"
                  className="btn btn-primary"
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>

            <div className="-ml-2 flex items-center sm:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <span className="sr-only">فتح القائمة الرئيسية</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  } flex items-center pr-3 pl-4 py-2 border-r-4 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 ml-2" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container-center py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 منصة نماء للاستثمار. جميع الحقوق محفوظة.</p>
            <p className="mt-1">منصة رقمية متطورة لإدارة الاستثمارات في الأسواق الأمريكية والسعودية</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;