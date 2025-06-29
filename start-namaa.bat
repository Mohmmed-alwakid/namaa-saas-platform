@echo off
chcp 65001 >nul
echo 🎉 مرحباً بك في منصة نماء للاستثمار
echo ====================================
echo.

REM التحقق من Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js أولاً
    echo    تحميل من: https://nodejs.org
    pause
    exit /b 1
)

REM التحقق من npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm غير مثبت
    pause
    exit /b 1
)

echo ✅ Node.js و npm متوفران

REM التأكد من المكتبات
if not exist "node_modules" (
    echo 📦 تثبيت المكتبات للمرة الأولى...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ فشل في تثبيت المكتبات
        pause
        exit /b 1
    )
    echo ✅ تم تثبيت المكتبات بنجاح
)

:menu
cls
echo.
echo 🚀 منصة نماء للاستثمار - قائمة التشغيل
echo =========================================
echo.
echo 📊 المنافذ الافتراضية:
echo    الواجهة الأمامية: http://localhost:5180
echo    الخادم الخلفي: http://localhost:3005
echo.

REM فحص سريع للمنافذ
echo 🔍 فحص سريع للمنافذ...
netstat -ano | findstr :5180 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ⚠️  المنفذ 5180 مستخدم
) else (
    echo    ✅ المنفذ 5180 متاح
)

netstat -ano | findstr :3005 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ⚠️  المنفذ 3005 مستخدم
) else (
    echo    ✅ المنفذ 3005 متاح
)

echo.
echo 📋 خيارات التشغيل:
echo ==================
echo.
echo [1] تشغيل كامل (الواجهة + الخادم)
echo [2] الخادم الخلفي فقط (للاختبار)
echo [3] الواجهة الأمامية فقط
echo [4] فحص مفصل للمنافذ
echo [5] تنظيف المنافذ المستخدمة
echo [6] معلومات المشروع
echo [7] الخروج
echo.

set /p choice="اختر رقماً (1-7): "

if "%choice%"=="1" goto full_server
if "%choice%"=="2" goto backend_only
if "%choice%"=="3" goto frontend_only
if "%choice%"=="4" goto port_check
if "%choice%"=="5" goto cleanup
if "%choice%"=="6" goto info
if "%choice%"=="7" goto exit
goto invalid_choice

:full_server
echo.
echo 🚀 تشغيل المنصة كاملة...
echo ========================
echo.
echo سيتم تشغيل:
echo - الخادم الخلفي (APIs)
echo - الواجهة الأمامية (React)
echo.
echo ⏳ جاري البدء...
npm run dev:fullstack
pause
goto menu

:backend_only
echo.
echo 🔧 تشغيل الخادم الخلفي فقط...
echo ============================
echo.
echo سيتم تشغيل:
echo - APIs للمحافظ والأسهم
echo - خادم Express على منفذ متاح
echo.
echo 🌐 بعد التشغيل يمكنك اختبار:
echo    http://localhost:3005/api/health
echo    http://localhost:3005/api/portfolios
echo.
echo ⏳ جاري البدء...
node backend-only.cjs
pause
goto menu

:frontend_only
echo.
echo 🎨 تشغيل الواجهة الأمامية فقط...
echo ===============================
echo.
echo سيتم تشغيل:
echo - React Development Server
echo - واجهة المستخدم على منفذ 5180
echo.
echo ⚠️  ملاحظة: تحتاج لتشغيل الخادم الخلفي في terminal منفصل
echo.
echo ⏳ جاري البدء...
npm run dev:client
pause
goto menu

:port_check
echo.
echo 🔍 فحص مفصل للمنافذ...
echo ====================
echo.
node scripts/simple-port-check.cjs
echo.
pause
goto menu

:cleanup
echo.
echo 🧹 تنظيف المنافذ...
echo ================
echo.
echo ⚠️  سيتم إيقاف العمليات التي تستخدم منافذ المشروع
echo.
set /p confirm="هل تريد المتابعة؟ (y/N): "
if /i "%confirm%"=="y" (
    echo.
    echo 🔍 البحث عن العمليات...
    
    REM قتل العمليات على المنفذ 5180
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5180 ^| findstr LISTENING') do (
        if not "%%a"=="0" (
            echo إيقاف العملية %%a على المنفذ 5180...
            taskkill /F /PID %%a >nul 2>&1
        )
    )
    
    REM قتل العمليات على المنفذ 3005
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005 ^| findstr LISTENING') do (
        if not "%%a"=="0" (
            echo إيقاف العملية %%a على المنفذ 3005...
            taskkill /F /PID %%a >nul 2>&1
        )
    )
    
    echo ✅ تم التنظيف
) else (
    echo ❌ تم إلغاء العملية
)
echo.
pause
goto menu

:info
echo.
echo 📚 معلومات المشروع
echo ================
echo.
echo 🎯 المشروع: منصة نماء للاستثمار
echo 📝 الوصف: منصة رقمية لإدارة الاستثمارات في الأسواق الأمريكية والسعودية
echo 🔧 التقنيات: React 19 + TypeScript + Vite + Supabase + Tailwind CSS
echo.
echo 🌐 الروابط المحلية:
echo    الواجهة: http://localhost:5180
echo    APIs: http://localhost:3005/api/health
echo.
echo 📋 الميزات:
echo    ✅ إدارة المحافظ الاستثمارية
echo    ✅ تتبع أسعار الأسهم (أمريكية + سعودية)
echo    ✅ تحليل الأداء ومقارنة مع المؤشرات
echo    ✅ إدارة المعاملات والتوزيعات
echo    ✅ نظام ذكي لتجنب تضارب المنافذ
echo.
echo 📖 الوثائق:
echo    README.md - دليل البدء السريع
echo    SOLUTION_SUMMARY.md - ملخص الحلول
echo    docs/SMART_PORT_MANAGEMENT.md - إدارة المنافذ
echo.
pause
goto menu

:invalid_choice
echo.
echo ❌ اختيار غير صحيح، يرجى اختيار رقم من 1 إلى 7
timeout /t 2 >nul
goto menu

:exit
echo.
echo 👋 شكراً لاستخدام منصة نماء للاستثمار
echo    نتمنى لك تجربة تطوير ممتعة!
echo.
timeout /t 2 >nul
exit /b 0
