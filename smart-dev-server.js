// Smart Development Server - سيرفر ذكي يتجنب تضارب المنافذ
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { checkPortsStatus } from './scripts/check-ports.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let app;
let frontendProcess;
let backendServer;

/**
 * بدء السيرفر الذكي مع فحص المنافذ
 */
async function startSmartServer() {
  try {
    console.log(chalk.bold.blue('🚀 بدء السيرفر الذكي لمنصة الاستثمار...'));
    
    // فحص المنافذ المتاحة
    const portsStatus = await checkPortsStatus();
    
    const FRONTEND_PORT = portsStatus.frontend.available;
    const API_PORT = portsStatus.backend.available;
    
    // إنشاء تطبيق Express
    app = express();
    
    // Middleware
    app.use(cors({
      origin: [
        `http://localhost:${FRONTEND_PORT}`,
        'http://localhost:3000',
        'http://127.0.0.1:5173'
      ],
      credentials: true
    }));
    app.use(express.json());
    
    // Supabase configuration
    const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // ===== API ROUTES =====
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Smart development server is running!',
        timestamp: new Date().toISOString(),
        environment: 'smart-development',
        frontend: `http://localhost:${FRONTEND_PORT}`,
        backend: `http://localhost:${API_PORT}`,
        ports: {
          frontend: FRONTEND_PORT,
          backend: API_PORT,
          preferredFrontend: 5180,
          preferredBackend: 3005
        }
      });
    });
    
    // Database check endpoint
    app.get('/api/db-check', async (req, res) => {
      try {
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
          environment: 'smart-development'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Database connection error',
          details: error.message
        });
      }
    });
    
    // ===== PORTFOLIOS API =====
    
    // Get all portfolios
    app.get('/api/portfolios', async (req, res) => {
      try {
        const { data, error } = await supabase
          .from('portfolios')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json({
          success: true,
          data: data || []
        });
      } catch (error) {
        console.error('Error fetching portfolios:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch portfolios',
          details: error.message
        });
      }
    });
    
    // Create new portfolio
    app.post('/api/portfolios', async (req, res) => {
      try {
        const { name, description, initial_balance } = req.body;
        
        const { data, error } = await supabase
          .from('portfolios')
          .insert([{
            name,
            description,
            initial_balance: parseFloat(initial_balance) || 0,
            current_balance: parseFloat(initial_balance) || 0,
            user_id: 'temp-user-id' // سيتم تحديثه عند تطبيق المصادقة
          }])
          .select()
          .single();
        
        if (error) throw error;
        
        res.status(201).json({
          success: true,
          data,
          message: 'Portfolio created successfully'
        });
      } catch (error) {
        console.error('Error creating portfolio:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to create portfolio',
          details: error.message
        });
      }
    });
    
    // ===== STOCKS API =====
    
    // Get stock price
    app.get('/api/stocks/price/:symbol', async (req, res) => {
      try {
        const { symbol } = req.params;
        const market = req.query.market || 'US'; // US or SAU
        
        // محاكاة بيانات الأسعار للتطوير
        const mockPrice = {
          symbol: symbol.toUpperCase(),
          price: (Math.random() * 200 + 50).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          changePercent: (Math.random() * 5 - 2.5).toFixed(2),
          market,
          timestamp: new Date().toISOString(),
          currency: market === 'SAU' ? 'SAR' : 'USD'
        };
        
        res.json({
          success: true,
          data: mockPrice
        });
      } catch (error) {
        console.error('Error fetching stock price:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch stock price',
          details: error.message
        });
      }
    });
    
    // Get multiple stock prices
    app.post('/api/stocks/prices', async (req, res) => {
      try {
        const { symbols, market = 'US' } = req.body;
        
        if (!symbols || !Array.isArray(symbols)) {
          return res.status(400).json({
            success: false,
            error: 'Symbols array is required'
          });
        }
        
        // محاكاة بيانات متعددة
        const mockPrices = symbols.map(symbol => ({
          symbol: symbol.toUpperCase(),
          price: (Math.random() * 200 + 50).toFixed(2),
          change: (Math.random() * 10 - 5).toFixed(2),
          changePercent: (Math.random() * 5 - 2.5).toFixed(2),
          market,
          timestamp: new Date().toISOString(),
          currency: market === 'SAU' ? 'SAR' : 'USD'
        }));
        
        res.json({
          success: true,
          data: mockPrices
        });
      } catch (error) {
        console.error('Error fetching stock prices:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to fetch stock prices',
          details: error.message
        });
      }
    });
    
    // ===== ERROR HANDLING =====
    
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
          'GET /api/health',
          'GET /api/db-check',
          'GET /api/portfolios',
          'POST /api/portfolios',
          'GET /api/stocks/price/:symbol',
          'POST /api/stocks/prices'
        ]
      });
    });
    
    // Global error handler
    app.use((error, req, res, next) => {
      console.error('Server error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
    
    // ===== START SERVERS =====
    
    // بدء الخادم الخلفي
    backendServer = app.listen(API_PORT, () => {
      console.log(chalk.green(`✅ الخادم الخلفي يعمل على المنفذ ${API_PORT}`));
      console.log(chalk.blue(`   🔗 http://localhost:${API_PORT}/api/health`));
    });
    
    // بدء الواجهة الأمامية
    console.log(chalk.blue('🎨 بدء الواجهة الأمامية...'));
    
    const isWindows = process.platform === 'win32';
    const viteCommand = isWindows ? 'npm.cmd' : 'npm';
    
    frontendProcess = spawn(viteCommand, ['run', 'dev:client'], {
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: FRONTEND_PORT,
        VITE_PORT: FRONTEND_PORT
      }
    });
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:')) {
        console.log(chalk.green('✅ الواجهة الأمامية تعمل بنجاح'));
        console.log(chalk.blue(`   🔗 http://localhost:${FRONTEND_PORT}`));
        console.log(chalk.bold.green('\n🎉 جميع الخدمات تعمل بنجاح!'));
        console.log(chalk.gray('   استخدم Ctrl+C للإيقاف\n'));
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('EADDRINUSE') && !error.includes('warning')) {
        console.error(chalk.red('خطأ في الواجهة الأمامية:'), error);
      }
    });
    
    frontendProcess.on('error', (error) => {
      console.error(chalk.red('فشل في بدء الواجهة الأمامية:'), error.message);
    });
    
  } catch (error) {
    console.error(chalk.red('❌ خطأ في بدء السيرفر:'), error.message);
    process.exit(1);
  }
}

/**
 * إيقاف السيرفر بشكل آمن
 */
function stopServer() {
  console.log(chalk.yellow('\n🛑 إيقاف السيرفر...'));
  
  if (frontendProcess) {
    frontendProcess.kill();
    console.log(chalk.gray('   ✅ تم إيقاف الواجهة الأمامية'));
  }
  
  if (backendServer) {
    backendServer.close(() => {
      console.log(chalk.gray('   ✅ تم إيقاف الخادم الخلفي'));
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// معالجة إشارات الإيقاف
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);
process.on('uncaughtException', (error) => {
  console.error(chalk.red('خطأ غير معالج:'), error);
  stopServer();
});

// بدء السيرفر
startSmartServer();
