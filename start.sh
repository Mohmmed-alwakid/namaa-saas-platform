#!/bin/bash

# منصة نماء للاستثمار - سكريبت التشغيل السريع

echo "🚀 بدء تشغيل منصة نماء للاستثمار..."

# التحقق من Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت. يرجى تثبيت Node.js 18 أو أحدث"
    exit 1
fi

# التحقق من إصدار Node
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "⚠️  إصدار Node.js قديم. يتطلب الإصدار 18 أو أحدث"
    exit 1
fi

echo "✅ Node.js $(node -v) متاح"

# التحقق من ملف البيئة
if [ ! -f ".env" ]; then
    echo "📋 إنشاء ملف .env من .env.example..."
    cp .env.example .env
    echo "⚠️  يرجى تحديث ملف .env بالمفاتيح الصحيحة"
fi

# تثبيت المكتبات
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المكتبات..."
    npm install
fi

echo "🔧 بدء الخوادم..."

# تشغيل التطوير الكامل
npm run dev:fullstack
