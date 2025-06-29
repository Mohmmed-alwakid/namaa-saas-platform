#!/bin/bash

# Smart Development Starter for Linux/Mac
# بداية ذكية للتطوير على Linux/Mac

echo "🚀 تحقق من حالة المنافذ والعمليات لمشروع Namaa Investment Platform"
echo ""

# فحص Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت أو غير موجود في PATH"
    exit 1
fi

# فحص npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت أو غير موجود في PATH"
    exit 1
fi

echo "✅ Node.js و npm متوفران"

# التأكد من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المكتبات المطلوبة..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ فشل في تثبيت المكتبات"
        exit 1
    fi
fi

echo ""
echo "🔍 فحص المنافذ والعمليات..."
echo ""

# فحص المنفذ 5180 (الواجهة الأمامية)
if lsof -ti:5180 >/dev/null 2>&1; then
    echo "⚠️  المنفذ 5180 مستخدم حالياً"
    echo "المنفذ 5180 - العمليات:"
    lsof -ti:5180 | while read pid; do
        process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
        echo "   - $process_name (PID: $pid)"
    done
else
    echo "✅ المنفذ 5180 متاح"
fi

# فحص المنفذ 3005 (الخادم الخلفي)
if lsof -ti:3005 >/dev/null 2>&1; then
    echo "⚠️  المنفذ 3005 مستخدم حالياً"
    echo "المنفذ 3005 - العمليات:"
    lsof -ti:3005 | while read pid; do
        process_name=$(ps -p $pid -o comm= 2>/dev/null || echo "Unknown")
        echo "   - $process_name (PID: $pid)"
    done
else
    echo "✅ المنفذ 3005 متاح"
fi

echo ""
echo "🟢 عمليات Node.js النشطة:"
if pgrep -f node >/dev/null 2>&1; then
    ps aux | grep node | grep -v grep | while read line; do
        pid=$(echo $line | awk '{print $2}')
        echo "   - node (PID: $pid)"
    done
else
    echo "   لا توجد عمليات Node.js تعمل حالياً"
fi

echo ""
echo "📊 خيارات التشغيل:"
echo ""
echo "[1] تشغيل السيرفر الذكي (يتجنب تضارب المنافذ تلقائياً)"
echo "[2] تشغيل السيرفر العادي (المنافذ الافتراضية)"
echo "[3] تنظيف المنافذ المستخدمة"
echo "[4] فحص مفصل للمنافذ"
echo "[5] الخروج"
echo ""

read -p "اختر رقماً (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🚀 بدء السيرفر الذكي..."
        node smart-dev-server.js
        ;;
    2)
        echo ""
        echo "🚀 بدء السيرفر العادي..."
        npm run dev:fullstack
        ;;
    3)
        echo ""
        echo "🧹 تنظيف المنافذ..."
        node -e "import('./scripts/process-manager.js').then(m => m.cleanupProjectPorts())"
        read -p "اضغط أي مفتاح للمتابعة..."
        ;;
    4)
        echo ""
        echo "🔍 فحص مفصل..."
        node scripts/check-ports.js
        read -p "اضغط أي مفتاح للمتابعة..."
        ;;
    5)
        echo "وداعاً! 👋"
        exit 0
        ;;
    *)
        echo "❌ اختيار غير صحيح"
        exit 1
        ;;
esac
