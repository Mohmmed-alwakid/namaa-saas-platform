# Full-Stack SaaS Template - Setup Guide

This guide will help you set up your new SaaS application using this template.

## 🚀 Quick Setup (5 minutes)

### 1. Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **Supabase account** - [Sign up free](https://supabase.com/)

### 2. Get the Template
```bash
# Clone this template
git clone <your-template-repo> my-new-app
cd my-new-app

# Install dependencies
npm install
```

### 3. Database Setup (Supabase)
1. **Create a new project** at [supabase.com](https://supabase.com)
2. **Get your credentials** from Project Settings > API
3. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```
4. **Fill in your Supabase details** in `.env`:
   ```bash
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

### 4. Create Database Tables
In your Supabase dashboard, go to **SQL Editor** and run:

```sql
-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Create your application tables here
-- Example:
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = user_id);
```

### 5. Start Development
```bash
# Start the full development environment
npm run dev:fullstack

# Your app will be available at:
# Frontend: http://localhost:5175
# Backend API: http://localhost:3003
```

### 6. Test Everything
1. **Visit** http://localhost:5175
2. **Check API health**: http://localhost:3003/api/health
3. **Check database**: http://localhost:3003/api/db-check
4. **Try registration**: Create a test account
5. **Try login**: Sign in with your test account

## 🛠️ Customization

### Update Branding
1. **App name**: Update `package.json`, `index.html`, and `README.md`
2. **Colors**: Modify `tailwind.config.js` color palette
3. **Logo**: Replace `public/logo.svg` with your logo
4. **Favicon**: Replace `public/favicon.ico`

### Add Features
1. **New pages**: Add to `src/client/pages/`
2. **New components**: Add to `src/client/components/`
3. **New API endpoints**: Add to `api/`
4. **Database tables**: Add to your Supabase project

### Environment Variables
Add any additional environment variables to `.env.example` and `.env`:

```bash
# Your custom variables
MY_API_KEY=your-api-key
THIRD_PARTY_SERVICE_URL=https://api.example.com
```

## 🚀 Deployment

### Deploy to Vercel (Recommended)
1. **Push to GitHub**: 
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables in Vercel dashboard
   - Deploy!

3. **Environment Variables in Vercel**:
   - Add all variables from your `.env` file
   - Use production Supabase credentials

### Other Platforms
This template works with:
- **Netlify**: Add build command `npm run build`
- **Railway**: Configure with `Dockerfile` if needed
- **DigitalOcean App Platform**: Set build/run commands
- **AWS Amplify**: Configure build settings

## 📚 Next Steps

### Essential Reading
- **API Documentation**: `/docs/api.md`
- **Component Library**: `/docs/components.md`
- **Database Schema**: `/docs/database.md`
- **Deployment Guide**: `/docs/deployment.md`

### Recommended Integrations
- **Stripe**: For payments
- **SendGrid/Resend**: For emails  
- **Cloudinary**: For file uploads
- **Sentry**: For error tracking
- **PostHog**: For analytics

### Development Tips
- Use `npm run dev:fullstack` for fastest development
- Check TypeScript errors with `npm run type-check`
- Test API endpoints in `local-fullstack-test.html`
- Keep database migrations in version control

## 🆘 Troubleshooting

### Common Issues

**Database connection fails**:
- Check Supabase credentials in `.env`
- Verify your Supabase project is active
- Run the database setup SQL

**Port already in use**:
- Kill processes on ports 3003 and 5175
- Or change ports in `local-full-dev.js` and `vite.config.ts`

**TypeScript errors**:
- Run `npm run type-check` to see all errors
- Update imports if you renamed files
- Check that all required props are passed

**Build fails**:
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check for TypeScript errors

### Getting Help
- Check existing documentation in `/docs/`
- Review console errors in browser dev tools
- Check Network tab for failed API calls
- Verify environment variables are set correctly

---

**🎉 You're all set! Start building your SaaS application!**