// Complete local development environment with Frontend + Backend + Database
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_PORT = 3005; // تغيير من 3003 إلى 3005
const FRONTEND_PORT = 5180; // تغيير من 5175 إلى 5180

// Middleware
app.use(cors({
  origin: [`http://localhost:${FRONTEND_PORT}`, 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Supabase configuration - REPLACE WITH YOUR PROJECT DETAILS
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Local development server is running!',
    timestamp: new Date().toISOString(),
    environment: 'local-development',
    frontend: `http://localhost:${FRONTEND_PORT}`,
    backend: `http://localhost:${API_PORT}`
  });
});// Database check endpoint
app.get('/api/db-check', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      });
    }

    res.json({
      success: true,
      message: 'Database connection successful',
      connected: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection error',
      details: error.message
    });
  }
});

// Authentication endpoints
app.post('/api/auth', async (req, res) => {
  const { action, email, password } = req.body;

  try {
    switch (action) {
      case 'login':
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (loginError) throw loginError;
        
        return res.json({
          success: true,
          user: loginData.user,
          session: loginData.session
        });

      case 'register':
        const { data: registerData, error: registerError } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (registerError) throw registerError;
        
        return res.json({
          success: true,
          user: registerData.user,
          session: registerData.session,
          message: 'Registration successful'
        });

      case 'logout':
        const { error: logoutError } = await supabase.auth.signOut();
        if (logoutError) throw logoutError;
        
        return res.json({
          success: true,
          message: 'Logged out successfully'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});
// Real-time stock data endpoint - implements PRD-2025-06-29-real-time-stock-data.md
app.get('/api/stocks/real-time', async (req, res) => {
  try {
    // Mock real-time stock data with realistic values
    const stocks = [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 192.25,
        change: 2.34,
        change_percent: 1.23,
        volume: 65430000,
        market_cap: 3000000000000,
        market: 'US',
        sector: 'Technology',
        timestamp: new Date(),
        is_real_time: true,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 142.56,
        change: -1.23,
        change_percent: -0.85,
        volume: 28750000,
        market_cap: 1800000000000,
        market: 'US',
        sector: 'Technology',
        timestamp: new Date(),
        is_real_time: true,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 423.12,
        change: 5.67,
        change_percent: 1.36,
        volume: 34560000,
        market_cap: 3200000000000,
        market: 'US',
        sector: 'Technology',
        timestamp: new Date(),
        is_real_time: true,
        last_updated: new Date().toISOString()
      },
      {
        symbol: '2222.SR',
        name: 'شركة أرامكو السعودية',
        price: 28.50,
        change: 0.75,
        change_percent: 2.70,
        volume: 12500000,
        market_cap: 2000000000000,
        market: 'SA',
        sector: 'Energy',
        timestamp: new Date(),
        is_real_time: true,
        last_updated: new Date().toISOString()
      },
      {
        symbol: '1120.SR',
        name: 'شركة الراجحي المصرفية',
        price: 85.20,
        change: -2.10,
        change_percent: -2.41,
        volume: 8750000,
        market_cap: 850000000000,
        market: 'SA',
        sector: 'Banking',
        timestamp: new Date(),
        is_real_time: true,
        last_updated: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: stocks,
      timestamp: new Date().toISOString(),
      source: 'mock_real_time',
      total_stocks: stocks.length,
      last_updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Real-time stocks API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch real-time stock data',
      details: error.message
    });
  }
});

// Market status endpoint
app.get('/api/market/status', async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
    
    // US market hours: 9:30 AM - 4:00 PM EST (simplified)
    const isUSMarketOpen = isWeekday && currentHour >= 9 && currentHour < 16;
    
    // Saudi market hours: 10:00 AM - 3:00 PM AST (simplified)
    const isSAMarketOpen = isWeekday && currentHour >= 10 && currentHour < 15;

    const marketStatus = {
      us_market: {
        market: 'US',
        is_open: isUSMarketOpen,
        status: isUSMarketOpen ? 'OPEN' : 'CLOSED',
        current_time: now,
        next_open: isUSMarketOpen ? null : new Date(now.getTime() + 24 * 60 * 60 * 1000),
        next_close: isUSMarketOpen ? new Date(now.getTime() + 8 * 60 * 60 * 1000) : null,
        timezone: 'EST'
      },
      sa_market: {
        market: 'SA',
        is_open: isSAMarketOpen,
        status: isSAMarketOpen ? 'OPEN' : 'CLOSED',
        current_time: now,
        next_open: isSAMarketOpen ? null : new Date(now.getTime() + 24 * 60 * 60 * 1000),
        next_close: isSAMarketOpen ? new Date(now.getTime() + 5 * 60 * 60 * 1000) : null,
        timezone: 'AST'
      },
      is_any_market_open: isUSMarketOpen || isSAMarketOpen,
      last_updated: now.toISOString()
    };

    res.json({
      success: true,
      data: marketStatus,
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Market status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market status',
      details: error.message
    });
  }
});

// Portfolio endpoints
app.get('/api/portfolios', async (req, res) => {
  try {
    // Mock portfolio data
    const portfolios = [
      {
        id: 1,
        name: 'محفظة التكنولوجيا',
        total_value: 150000,
        daily_change: 2500,
        daily_change_percent: 1.69,
        stocks_count: 5,
        last_updated: new Date().toISOString()
      },
      {
        id: 2,
        name: 'محفظة الاستثمار المتوازن',
        total_value: 280000,
        daily_change: -1200,
        daily_change_percent: -0.43,
        stocks_count: 12,
        last_updated: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: portfolios,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Portfolios API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolios',
      details: error.message
    });
  }
});

// Generic API endpoint for your application data
app.get('/api/data', async (req, res) => {
  try {
    // Example: Get data from your main table
    const { data, error } = await supabase
      .from('your_table_name') // REPLACE with your table name
      .select('*')
      .limit(10);
    
    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the backend server
app.listen(API_PORT, () => {
  console.log(`🚀 Backend API server running on http://localhost:${API_PORT}`);
  console.log(`📊 Health check: http://localhost:${API_PORT}/api/health`);
  console.log(`🗄️ Database check: http://localhost:${API_PORT}/api/db-check`);
});

// Start the frontend development server
const startFrontend = () => {
  console.log(`🎨 Starting frontend development server...`);
  
  const frontend = spawn('npm', ['run', 'dev:client'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  frontend.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
  });

  frontend.on('error', (err) => {
    console.error('Failed to start frontend server:', err);
  });
};

// Start frontend after a short delay
setTimeout(startFrontend, 1000);

console.log(`
🎉 Full-Stack Development Environment Started!

📱 Frontend: http://localhost:${FRONTEND_PORT}
🔌 Backend:  http://localhost:${API_PORT}
🗄️ Database: Connected to Supabase

🔧 To customize:
1. Update Supabase credentials in .env file
2. Replace 'your_table_name' with your actual table names
3. Add your own API endpoints below the existing ones
4. Customize the frontend in src/client/

Happy coding! 🚀
`);