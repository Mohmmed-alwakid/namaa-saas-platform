// Simple Backend-Only Development Server
const express = require('express');
const cors = require('cors');
const { checkPortsStatus, displayPortsReport } = require('./scripts/port-manager.cjs');

async function startBackendOnly() {
  try {
    console.log('🚀 Starting Namaa Investment Platform Backend API...');
    
    // Check available ports
    const portsStatus = await checkPortsStatus();
    const API_PORT = portsStatus.backend.available;
    
    console.log(`\\n🔧 Starting backend on port ${API_PORT}...`);
    
    // Create Express app
    const app = express();
    
    // Middleware
    app.use(cors({
      origin: '*',
      credentials: true
    }));
    app.use(express.json());
    
    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Namaa Investment Platform API is running!',
        timestamp: new Date().toISOString(),
        environment: 'development',
        version: '1.0.0',
        port: API_PORT
      });
    });
    
    // Portfolios API
    app.get('/api/portfolios', (req, res) => {
      const mockPortfolios = [
        {
          id: '1',
          name: 'Tech Growth Portfolio',
          description: 'Technology stocks with high growth potential',
          initial_investment: 50000,
          currency: 'USD',
          portfolio_type: 'REAL',
          benchmark_symbol: 'SPY',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          stats: {
            transactions_count: 12,
            stocks_count: 8,
            current_value: 67500,
            total_return: 17500,
            daily_change: 1.25
          }
        },
        {
          id: '2',
          name: 'Dividend Income Portfolio',
          description: 'Conservative dividend-paying stocks',
          initial_investment: 100000,
          currency: 'USD',
          portfolio_type: 'REAL',
          benchmark_symbol: 'VTI',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          stats: {
            transactions_count: 18,
            stocks_count: 15,
            current_value: 112000,
            total_return: 12000,
            daily_change: -0.45
          }
        }
      ];
      
      res.json({
        success: true,
        data: {
          portfolios: mockPortfolios
        },
        message: 'Mock portfolio data for development'
      });
    });
    
    // Stock price API
    app.get('/api/stocks/price/:symbol', (req, res) => {
      const { symbol } = req.params;
      const market = req.query.market || 'US';
      
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
        currency: market === 'SAU' ? 'SAR' : 'USD'
      };
      
      res.json({
        success: true,
        data: mockPrice,
        message: 'Mock stock price data for development'
      });
    });
    
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'API endpoint not found',
        availableEndpoints: [
          'GET /api/health',
          'GET /api/portfolios',
          'GET /api/stocks/price/:symbol'
        ]
      });
    });
    
    // Start server
    const server = app.listen(API_PORT, () => {
      console.log('\\n✅ Backend API is running successfully!');
      console.log('━'.repeat(50));
      console.log(`🔗 API Base URL: http://localhost:${API_PORT}`);
      console.log(`📊 Health Check: http://localhost:${API_PORT}/api/health`);
      console.log(`💼 Portfolios: http://localhost:${API_PORT}/api/portfolios`);
      console.log(`📈 Stock Price: http://localhost:${API_PORT}/api/stocks/price/AAPL`);
      console.log('━'.repeat(50));
      console.log('💡 Press Ctrl+C to stop the server');
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\\n🛑 Shutting down backend server...');
      server.close(() => {
        console.log('✅ Backend server stopped');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Error starting backend:', error.message);
    process.exit(1);
  }
}

startBackendOnly();
