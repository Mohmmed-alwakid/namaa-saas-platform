# 🚀 دليل البدء السريع - منصة نماء للاستثمار

## الخطوات الأساسية للتشغيل

### 1. التحقق من المتطلبات
```bash
node --version  # يجب أن يكون >= 18
npm --version   # يجب أن يكون >= 8
```

### 2. تثبيت المكتبات
```bash
npm install
```

### 3. إعداد المتغيرات البيئية
```bash
# انسخ ملف المتغيرات البيئية
cp .env.example .env

# قم بتعديل .env وإضافة:
# - مفاتيح Supabase
# - مفتاح Alpha Vantage (مجاني)
```

### 4. تشغيل المشروع
```bash
# التشغيل الكامل (مُستحسن)
npm run dev:fullstack

# أو منفصل
npm run dev:client    # Frontend على http://localhost:5180
npm run dev:local     # Backend API على http://localhost:3005
```

## 🎯 ما تم إنجازه

### ✅ APIs جاهزة
- `/api/health` - فحص صحة الخادم
- `/api/portfolios` - إدارة المحافظ (GET, POST)
- `/api/stocks/price` - جلب أسعار الأسهم

### ✅ واجهات المستخدم
- **لوحة التحكم** (`/dashboard`) - إحصائيات ومتابعة
- **إدارة المحافظ** (`/portfolios`) - إنشاء وإدارة المحافظ
- **أسعار الأسهم** (`/stocks`) - متابعة الأسعار والبحث

### ✅ قاعدة البيانات
- سكريبت إعداد كامل في `database/init.sql`
- جداول للمحافظ، الأسهم، المعاملات، الأسعار
- سياسات أمان Row Level Security
- بيانات أولية للاختبار

### ✅ مكونات تقنية
- React Hooks مخصصة للمحافظ والأسهم
- TypeScript types شاملة
- تصميم responsive باللغة العربية
- React Query للبيانات
- Tailwind CSS للتصميم

## 🔧 الخطوات التالية

### 1. إعداد Supabase (مطلوب)
1. أنشئ حساب في [supabase.com](https://supabase.com)
2. أنشئ مشروع جديد
3. انسخ URL و API keys إلى `.env`
4. نفذ `database/init.sql` في SQL Editor

### 2. إعداد Alpha Vantage (اختياري)
1. سجل في [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. احصل على مفتاح API مجاني
3. أضفه لـ `.env` كـ `ALPHA_VANTAGE_API_KEY`

### 3. الاختبار
```bash
# فحص TypeScript
npm run type-check

# بناء المشروع
npm run build

# اختبار الأداء
npm run preview
```

## 📋 قائمة المهام

### 🏗️ أساسي (منجز)
- [x] إعداد React + TypeScript + Vite
- [x] تصميم قاعدة البيانات
- [x] APIs أساسية للمحافظ والأسهم
- [x] واجهات مستخدم أساسية
- [x] نظام التوجيه (Routing)
- [x] Hooks مخصصة للبيانات

### 🚧 التطوير (قيد العمل)
- [ ] ربط APIs الحقيقية
- [ ] نظام المعاملات الكامل
- [ ] التحليلات المالية
- [ ] نظام المصادقة
- [ ] التوزيعات المالية

### 🔮 مستقبلي
- [ ] الرسوم البيانية
- [ ] الإشعارات
- [ ] تطبيق جوال
- [ ] ذكاء اصطناعي

## 🐛 استكشاف الأخطاء

### مشكلة تشغيل Frontend
```bash
# تأكد من النود 18+
node --version

# أعد تثبيت المكتبات
rm -rf node_modules package-lock.json
npm install
```

### مشكلة APIs
- تأكد من تشغيل `npm run dev:local`
- تحقق من ملف `.env`
- اختبر `http://localhost:3005/api/health`

### مشكلة قاعدة البيانات
- تأكد من إعداد Supabase
- نفذ `database/init.sql`
- تحقق من مفاتيح API في `.env`

## 📞 المساعدة
- راجع `docs/` للوثائق المفصلة
- اطلع على `CONTRIBUTING.md` للمساهمة
- فتح issue في GitHub للأخطاء

---
**نصيحة**: ابدأ بتشغيل `npm run dev:fullstack` واختبر الصفحات الأساسية أولاً!
