@echo off
echo 🚀 تحقق من حالة المنافذ والعمليات لمشروع Namaa Investment Platform
echo.

REM فحص Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js غير مثبت أو غير موجود في PATH
    pause
    exit /b 1
)

REM فحص npm
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm غير مثبت أو غير موجود في PATH
    pause
    exit /b 1
)

echo ✅ Node.js و npm متوفران

REM التأكد من وجود node_modules
if not exist "node_modules" (
    echo 📦 تثبيت المكتبات المطلوبة...
    npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ فشل في تثبيت المكتبات
        pause
        exit /b 1
    )
)

echo.
echo 🔍 فحص المنافذ والعمليات...
echo.

REM فحص المنفذ 5180 (الواجهة الأمامية)
netstat -ano | findstr :5180 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  المنفذ 5180 مستخدم حالياً
    echo المنفذ 5180 - العمليات:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5180') do (
        if not "%%a"=="0" (
            for /f "tokens=1" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH 2^>nul') do (
                echo    - %%b ^(PID: %%a^)
            )
        )
    )
) else (
    echo ✅ المنفذ 5180 متاح
)

REM فحص المنفذ 3005 (الخادم الخلفي)
netstat -ano | findstr :3005 >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ⚠️  المنفذ 3005 مستخدم حالياً
    echo المنفذ 3005 - العمليات:
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3005') do (
        if not "%%a"=="0" (
            for /f "tokens=1" %%b in ('tasklist /FI "PID eq %%a" /FO CSV /NH 2^>nul') do (
                echo    - %%b ^(PID: %%a^)
            )
        )
    )
) else (
    echo ✅ المنفذ 3005 متاح
)

echo.
echo 🟢 عمليات Node.js النشطة:
tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH 2>nul | findstr /V "INFO:" | (
    set /a count=0
    for /f "tokens=1,2" %%a in ('more') do (
        if not "%%a"=="" (
            set /a count+=1
            echo    - %%a ^(PID: %%b^)
        )
    )
    if !count! EQU 0 echo    لا توجد عمليات Node.js تعمل حالياً
)

echo.
echo 📊 خيارات التشغيل:
echo.
echo [1] تشغيل السيرفر الذكي (يتجنب تضارب المنافذ تلقائياً)
echo [2] تشغيل السيرفر العادي (المنافذ الافتراضية)
echo [3] تنظيف المنافذ المستخدمة
echo [4] فحص مفصل للمنافذ
echo [5] الخروج
echo.

set /p choice="اختر رقماً (1-5): "

if "%choice%"=="1" (
    echo.
    echo 🚀 بدء السيرفر الذكي...
    node smart-dev-server.js
) else if "%choice%"=="2" (
    echo.
    echo 🚀 بدء السيرفر العادي...
    npm run dev:fullstack
) else if "%choice%"=="3" (
    echo.
    echo 🧹 تنظيف المنافذ...
    node -e "import('./scripts/process-manager.js').then(m => m.cleanupProjectPorts())"
    pause
) else if "%choice%"=="4" (
    echo.
    echo 🔍 فحص مفصل...
    node scripts/check-ports.js
    pause
) else if "%choice%"=="5" (
    echo وداعاً! 👋
    exit /b 0
) else (
    echo ❌ اختيار غير صحيح
    pause
    goto :eof
)

pause
