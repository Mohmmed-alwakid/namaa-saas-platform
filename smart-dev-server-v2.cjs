// Enhanced Smart Development Server for Namaa Investment Platform
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');
const { checkPortsStatus, displayPortsReport, updateEnvFile } = require('./scripts/port-manager.cjs');

// Load environment variables
dotenv.config();

let app;
let frontendProcess;
let backendServer;

/**
 * Start the smart development server
 */
async function startSmartServer() {
  try {
    console.log('🚀 Starting Namaa Investment Platform Smart Development Server...');
    console.log('━'.repeat(60));
    
    // Check available ports
    const portsStatus = await checkPortsStatus();
    displayPortsReport(portsStatus);
    
    const FRONTEND_PORT = portsStatus.frontend.available;
    const API_PORT = portsStatus.backend.available;
    
    // Update environment file if ports changed
    if (!portsStatus.frontend.isPreferredAvailable || !portsStatus.backend.isPreferredAvailable) {
      console.log('\\n🔄 Updating configuration with available ports...');
      await updateEnvFile(portsStatus);
    }
    
    console.log('\\n🔧 Setting up backend server...');
    
    // Create Express app
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
    
    // ===== API ROUTES =====
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Namaa Investment Platform API is running!',
        timestamp: new Date().toISOString(),
        environment: 'smart-development',
        version: '1.0.0',
        services: {
          frontend: `http://localhost:${FRONTEND_PORT}`,
          backend: `http://localhost:${API_PORT}`
        },
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
        // For now, return mock success since we're using demo Supabase
        res.json({
          success: true,
          message: 'Database connection simulation successful',
          environment: 'smart-development',
          note: 'Using demo Supabase configuration'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Database connection simulation failed',
          details: error.message
        });
      }
    });
    
    // ===== PORTFOLIOS API =====
    
    // Get all portfolios
    app.get('/api/portfolios', async (req, res) => {
      try {
        // Mock portfolio data for development
        const mockPortfolios = [
          {
            id: 1,
            name: 'Tech Growth Portfolio',
            description: 'Focused on technology stocks with high growth potential',
            initial_balance: 50000,
            current_balance: 67500,
            total_return: 17500,
            return_percentage: 35.0,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 2,
            name: 'Dividend Income Portfolio',
            description: 'Conservative portfolio focused on dividend-paying stocks',
            initial_balance: 100000,
            current_balance: 112000,
            total_return: 12000,
            return_percentage: 12.0,
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        
        res.json({
          success: true,
          data: mockPortfolios,
          message: 'Mock portfolio data for development'
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
        
        // Validate input
        if (!name || !initial_balance) {
          return res.status(400).json({
            success: false,
            error: 'Name and initial balance are required'
          });
        }
        
        // Mock creation response
        const newPortfolio = {
          id: Date.now(), // Mock ID
          name,
          description: description || '',
          initial_balance: parseFloat(initial_balance),
          current_balance: parseFloat(initial_balance),
          total_return: 0,
          return_percentage: 0,
          created_at: new Date().toISOString()
        };
        
        res.status(201).json({
          success: true,
          data: newPortfolio,
          message: 'Portfolio created successfully (mock data)'
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
        
        // Mock stock price data
        const basePrice = symbol === 'AAPL' ? 180 : 
                         symbol === 'GOOGL' ? 140 : 
                         symbol === 'MSFT' ? 320 : 
                         Math.random() * 200 + 50;
        
        const change = (Math.random() * 10 - 5);
        const price = (basePrice + change).toFixed(2);
        const changePercent = ((change / basePrice) * 100).toFixed(2);
        
        const mockPrice = {
          symbol: symbol.toUpperCase(),
          price: parseFloat(price),
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent),
          market,
          timestamp: new Date().toISOString(),
          currency: market === 'SAU' ? 'SAR' : 'USD',
          volume: Math.floor(Math.random() * 1000000) + 100000,
          dayHigh: (parseFloat(price) + Math.random() * 5).toFixed(2),
          dayLow: (parseFloat(price) - Math.random() * 5).toFixed(2)
        };
        
        res.json({
          success: true,
          data: mockPrice,
          message: 'Mock stock price data for development'
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
        
        // Mock multiple stock prices
        const mockPrices = symbols.map(symbol => {
          const basePrice = Math.random() * 200 + 50;
          const change = (Math.random() * 10 - 5);
          const price = (basePrice + change).toFixed(2);
          const changePercent = ((change / basePrice) * 100).toFixed(2);
          
          return {
            symbol: symbol.toUpperCase(),
            price: parseFloat(price),
            change: parseFloat(change.toFixed(2)),
            changePercent: parseFloat(changePercent),
            market,
            timestamp: new Date().toISOString(),
            currency: market === 'SAU' ? 'SAR' : 'USD'
          };
        });
        
        res.json({
          success: true,
          data: mockPrices,
          message: 'Mock stock prices data for development'
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
        error: 'API endpoint not found',
        availableEndpoints: [
          'GET /api/health - Server health check',
          'GET /api/db-check - Database connection check',
          'GET /api/portfolios - Get all portfolios',
          'POST /api/portfolios - Create new portfolio',
          'GET /api/stocks/price/:symbol - Get stock price',
          'POST /api/stocks/prices - Get multiple stock prices'
        ],
        documentation: 'See README.md for complete API documentation'
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
    
    // Start backend server
    backendServer = app.listen(API_PORT, () => {
      console.log('\\n✅ Backend API server is running');
      console.log(`   🔗 Health check: http://localhost:${API_PORT}/api/health`);
      console.log(`   📊 Portfolios API: http://localhost:${API_PORT}/api/portfolios`);
      console.log(`   📈 Stocks API: http://localhost:${API_PORT}/api/stocks/price/AAPL`);
    });
    
    // Start frontend server
    console.log('\\n🎨 Starting frontend development server...');
    
    const isWindows = process.platform === 'win32';
    
    // Use cmd.exe on Windows to handle npm properly
    if (isWindows) {
      frontendProcess = spawn('cmd.exe', ['/c', 'npm', 'run', 'dev:client'], {
        stdio: 'pipe',
        env: {
          ...process.env,
          PORT: FRONTEND_PORT,
          VITE_PORT: FRONTEND_PORT
        }
      });
    } else {
      frontendProcess = spawn('npm', ['run', 'dev:client'], {
        stdio: 'pipe',
        env: {
          ...process.env,
          PORT: FRONTEND_PORT,
          VITE_PORT: FRONTEND_PORT
        }
      });
    }
    
    frontendProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Local:') || output.includes('ready')) {
        console.log('\\n✅ Frontend development server is running');
        console.log(`   🔗 Application: http://localhost:${FRONTEND_PORT}`);
        console.log('\\n━'.repeat(60));
        console.log('🎉 Namaa Investment Platform is ready for development!');
        console.log('━'.repeat(60));
        console.log('📚 Available endpoints:');
        console.log(`   Frontend: http://localhost:${FRONTEND_PORT}`);
        console.log(`   API Health: http://localhost:${API_PORT}/api/health`);
        console.log(`   Portfolios: http://localhost:${API_PORT}/api/portfolios`);
        console.log(`   Stock Price: http://localhost:${API_PORT}/api/stocks/price/AAPL`);
        console.log('\\n💡 Press Ctrl+C to stop all services');
        console.log('━'.repeat(60));
      }
    });
    
    frontendProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('EADDRINUSE') && !error.includes('warning')) {
        console.error('Frontend error:', error);
      }
    });
    
    frontendProcess.on('error', (error) => {
      console.error('❌ Failed to start frontend server:', error.message);
    });
    
  } catch (error) {
    console.error('❌ Error starting smart server:', error.message);
    process.exit(1);
  }
}

/**
 * Gracefully stop the server
 */
function stopServer() {
  console.log('\\n🛑 Shutting down Namaa Investment Platform...');
  
  if (frontendProcess) {
    frontendProcess.kill();
    console.log('   ✅ Frontend server stopped');
  }
  
  if (backendServer) {
    backendServer.close(() => {
      console.log('   ✅ Backend server stopped');
      console.log('\\n👋 Goodbye! Thanks for using Namaa Investment Platform');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// Handle shutdown signals
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  stopServer();
});

// Start the server
startSmartServer();
