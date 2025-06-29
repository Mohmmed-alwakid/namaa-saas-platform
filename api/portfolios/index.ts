import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

// إعداد Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Types
interface Portfolio {
  id?: string;
  name: string;
  description?: string;
  initial_investment?: number;
  currency?: string;
  benchmark_symbol?: string;
  portfolio_type?: 'REAL' | 'PAPER';
}

interface CreatePortfolioRequest {
  name: string;
  description?: string;
  initial_investment?: number;
  currency?: string;
}

// Handler الرئيسي
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // إضافة CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // التحقق من وجود Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'غير مصرح لك بالوصول - يرجى تسجيل الدخول' 
      });
    }

    // استخراج التوكن
    const token = authHeader.split(' ')[1];
    
    // التحقق من المستخدم
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ 
        success: false, 
        error: 'توكن غير صالح' 
      });
    }

    switch (req.method) {
      case 'GET':
        return await getPortfolios(req, res, user.id);
      case 'POST':
        return await createPortfolio(req, res, user.id);
      default:
        return res.status(405).json({ 
          success: false, 
          error: 'طريقة غير مدعومة' 
        });
    }
  } catch (error) {
    console.error('خطأ في API المحافظ:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'خطأ داخلي في الخادم' 
    });
  }
}

// الحصول على جميع المحافظ للمستخدم
async function getPortfolios(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { data: portfolios, error } = await supabase
      .from('portfolios')
      .select(`
        id,
        name,
        description,
        initial_investment,
        currency,
        benchmark_symbol,
        portfolio_type,
        created_at,
        updated_at
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // حساب إحصائيات سريعة لكل محفظة
    const portfoliosWithStats = await Promise.all(
      (portfolios || []).map(async (portfolio) => {
        // حساب عدد المعاملات
        const { count: transactionsCount } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('portfolio_id', portfolio.id);

        // حساب عدد الأسهم المختلفة
        const { data: uniqueStocks } = await supabase
          .from('transactions')
          .select('stock_id')
          .eq('portfolio_id', portfolio.id);

        const uniqueStocksCount = new Set(uniqueStocks?.map(t => t.stock_id)).size;

        return {
          ...portfolio,
          stats: {
            transactions_count: transactionsCount || 0,
            stocks_count: uniqueStocksCount,
            last_transaction_date: null // سنحسبها لاحقاً
          }
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        portfolios: portfoliosWithStats,
        total: portfoliosWithStats.length
      }
    });
  } catch (error) {
    console.error('خطأ في جلب المحافظ:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في جلب المحافظ'
    });
  }
}

// إنشاء محفظة جديدة
async function createPortfolio(req: VercelRequest, res: VercelResponse, userId: string) {
  try {
    const { name, description, initial_investment, currency } = req.body as CreatePortfolioRequest;

    // التحقق من صحة البيانات
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'اسم المحفظة مطلوب'
      });
    }

    if (name.length > 255) {
      return res.status(400).json({
        success: false,
        error: 'اسم المحفظة طويل جداً (الحد الأقصى 255 حرف)'
      });
    }

    // التحقق من عدم وجود محفظة بنفس الاسم
    const { data: existingPortfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', userId)
      .eq('name', name.trim())
      .eq('is_active', true)
      .single();

    if (existingPortfolio) {
      return res.status(400).json({
        success: false,
        error: 'يوجد محفظة بنفس الاسم بالفعل'
      });
    }

    // إنشاء المحفظة
    const portfolioData: Portfolio = {
      name: name.trim(),
      description: description?.trim() || undefined,
      initial_investment: initial_investment || 0,
      currency: currency || 'USD',
      benchmark_symbol: 'SPY',
      portfolio_type: 'REAL'
    };

    const { data: newPortfolio, error } = await supabase
      .from('portfolios')
      .insert([{
        ...portfolioData,
        user_id: userId
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      data: {
        portfolio: newPortfolio,
        message: 'تم إنشاء المحفظة بنجاح'
      }
    });
  } catch (error) {
    console.error('خطأ في إنشاء المحفظة:', error);
    return res.status(500).json({
      success: false,
      error: 'فشل في إنشاء المحفظة'
    });
  }
}
