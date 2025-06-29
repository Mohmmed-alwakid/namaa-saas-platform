@echo off
chcp 65001 >nul

echo 🚀 بدء تشغيل منصة نماء للاستثمار...

REM التحقق من Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت. يرجى تثبيت Node.js 18 أو أحدث
    pause
    exit /b 1
)

echo ✅ Node.js متاح

REM التحقق من ملف البيئة
if not exist ".env" (
    echo 📋 إنشاء ملف .env من .env.example...
    copy .env.example .env >nul
    echo ⚠️  يرجى تحديث ملف .env بالمفاتيح الصحيحة
)

REM تثبيت المكتبات
if not exist "node_modules" (
    echo 📦 تثبيت المكتبات...
    npm install
)

echo 🔧 بدء الخوادم...

REM تشغيل التطوير الكامل
npm run dev:fullstack

pause
