# 📊 منصة نماء للاستثمار

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **� منصة رقمية متطورة لإدارة الاستثمارات**: إدارة وتتبع الاستثمارات في الأسواق الأمريكية والسعودية  
> **آخر تحديث**: June 29, 2025  
> **الحالة**: ✅ جاهز للاستخدام - واجهة مستخدم متكاملة وAPIs أساسية  
> **Architecture**: Modern, scalable, and enterprise-grade

## 🎯 What You Get

This template provides a complete, production-ready foundation for building modern SaaS applications. It includes everything you need to start building your next web application immediately.

### ✅ Included Features (Ready to Use)

- **🔐 Authentication System**: Complete JWT-based auth with role management
- **🗄️ Database Integration**: Supabase with RLS security properly configured
- **⚡ Local Development**: Optimized full-stack development environment
- **🎨 Modern UI Components**: Custom component library with accessibility
- **📱 Responsive Design**: Mobile-first approach with Tailwind CSS
- **🛡️ Type Safety**: Full TypeScript implementation
- **🔄 State Management**: Zustand + React Query for optimal UX
- **📊 Form Handling**: React Hook Form with Zod validation
- **🚀 Deployment Ready**: Vercel configuration included
- **🧪 Testing Setup**: Local testing environment and tools
- **📚 Comprehensive Documentation**: Detailed setup and usage guides

### 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Express.js style)
- **Database**: Supabase (PostgreSQL + Real-time capabilities)
- **Authentication**: Supabase Auth (JWT + refresh tokens)
- **UI Components**: Custom component library with accessibility
- **State Management**: Zustand + React Query
- **Form Handling**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS + Custom design system
- **Deployment**: Vercel with GitHub auto-deploy
- **Local Development**: Express.js local server with real database connection

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### ⚡ Fastest Way to Start (الطريقة الأسرع)

#### Windows:
```cmd
# Clone and run instantly
git clone [your-repo-url] my-app
cd my-app
npm install
smart-start.bat
```

#### Linux/Mac:
```bash
# Clone and run instantly
git clone [your-repo-url] my-app
cd my-app
npm install
chmod +x smart-start.sh
./smart-start.sh
```

### 🧠 Smart Development (التطوير الذكي)

هذا المشروع يدعم **النظام الذكي لإدارة المنافذ** الذي يتجنب تضارب المنافذ تلقائياً:

```bash
# السيرفر الذكي (يختار منافذ متاحة تلقائياً)
npm run dev:smart

# أو استخدم السكريبت التفاعلي
smart-start.bat        # Windows
./smart-start.sh       # Linux/Mac
```

### 🔧 Manual Setup (الإعداد اليدوي)
- Supabase account (free tier available)

### Installation

```bash
# Clone this template
git clone <your-template-repo> my-new-app
cd my-new-app

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your Supabase credentials in .env
# SUPABASE_URL=your-project-url
# SUPABASE_ANON_KEY=your-anon-key

# Start local development environment (RECOMMENDED)
npm run dev:fullstack
```

### Development URLs

- **Frontend**: http://localhost:5180
- **Backend API**: http://localhost:3005
- **Database**: Connected to your Supabase instance

## 🏗️ Architecture Overview

### Project Structure
```
├── src/
│   ├── client/          # React frontend components
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── stores/      # Zustand stores
│   │   └── utils/       # Frontend utilities
│   ├── shared/          # Shared types and utilities
│   │   ├── types/       # TypeScript interfaces
│   │   └── utils/       # Shared utility functions
│   └── server/          # Server-side code (optional)
├── api/                 # Vercel serverless functions
├── docs/                # Documentation
├── public/              # Static assets
└── local-*             # Local development servers
```

### Development Environment

#### 🚀 Local Development (RECOMMENDED)
**Full-stack local environment with real database connection:**

```bash
# Start complete local development environment
npm run dev:fullstack
# This starts:
# - Frontend (React/Vite): http://localhost:5175
# - Backend (Express API): http://localhost:3003  
# - Connected to: Your Supabase database
# - Hot reload: Enabled for both frontend and backend
```

#### Other Development Commands
```bash
# Individual components
npm run dev:client     # Frontend only
npm run dev:local      # Backend API only
npm run dev            # Vercel dev (slower)

# Production build
npm run build         # Build for production
npm run preview       # Preview production build

# TypeScript validation
npm run type-check    # Should return 0 errors
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file with these required variables:

```bash
# Supabase Configuration (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional Integrations
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
```

## 🧠 Smart Port Management (إدارة المنافذ الذكية)

هذا المشروع يتضمن نظام ذكي لتجنب تضارب المنافذ عند تشغيل أكثر من مشروع Node.js:

### المشكلة المحلولة:
- ✅ **تضارب المنافذ**: لا مزيد من رسائل "Port already in use"
- ✅ **تداخل المشاريع**: شغل أكثر من مشروع Node.js في نفس الوقت
- ✅ **إدارة العمليات**: تتبع وإدارة السيرفرات بكل سهولة

### الميزات الذكية:

#### 🔍 فحص المنافذ التلقائي:
```bash
# فحص المنافذ المتاحة
npm run check-ports

# عرض تقرير العمليات النشطة
npm run process-report
```

#### 🧹 تنظيف المنافذ:
```bash
# تنظيف المنافذ المستخدمة بواسطة المشروع
npm run cleanup-ports
```

#### 🚀 التشغيل الذكي:
```bash
# السيرفر الذكي (يختار منافذ متاحة تلقائياً)
npm run dev:smart

# أو استخدم السكريبت التفاعلي
smart-start.bat        # Windows
./smart-start.sh       # Linux/Mac
```

### كيف يعمل:
1. **فحص المنافذ**: يفحص المنافذ المطلوبة (5180, 3005)
2. **اختيار البدائل**: إذا كانت مستخدمة، يختار منافذ بديلة تلقائياً
3. **تحديث التكوين**: يحديث ملفات البيئة بالمنافذ الجديدة
4. **تشغيل السيرفرات**: يبدأ الواجهة والخادم على منافذ آمنة

📖 **للمزيد من التفاصيل**: راجع [دليل إدارة المنافذ الذكية](docs/SMART_PORT_MANAGEMENT.md)

### Database Setup
1. Create a new Supabase project
2. Run the included migration scripts
3. Configure Row Level Security (RLS) policies
4. Set up authentication providers

## 🎨 Customization

### Branding
1. Update colors in `tailwind.config.js`
2. Replace logo files in `public/`
3. Modify app metadata in `index.html`
4. Update application name in `package.json`

### Features
The template is designed to be easily customizable:
- Add new pages in `src/client/pages/`
- Create reusable components in `src/client/components/`
- Add API endpoints in `api/`
- Extend the database schema as needed

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy with automatic builds on push

### Other Platforms
The template works with any platform that supports:
- Node.js applications
- Static site hosting
- Serverless functions

## 📚 Documentation

- **Setup Guide**: Complete installation and configuration
- **Development Guide**: Local development best practices
- **API Documentation**: Backend API endpoints and usage
- **Component Library**: UI components and their props
- **Database Schema**: Database structure and relationships
- **Deployment Guide**: Production deployment instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `docs/` folder
- **Issues**: Create an issue on GitHub
- **Community**: Join our discussions

## 🙏 Acknowledgments

This template is based on modern web development best practices and includes:
- Battle-tested architecture patterns
- Production-ready configurations
- Comprehensive development environment
- Enterprise-grade security features

---

**Start building your next SaaS application today! 🚀**