// Backend Only Smart Server - للاختبار
const express = require('express');
const cors = require('cors');
const net = require('net');

async function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

async function findAvailablePort(preferredPort, alternatives = []) {
  if (await checkPort(preferredPort)) {
    return preferredPort;
  }
  
  for (const port of alternatives) {
    if (await checkPort(port)) {
      return port;
    }
  }
  
  for (let port = preferredPort + 10; port < preferredPort + 50; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  
  throw new Error('لا يمكن العثور على منفذ متاح');
}

async function startBackendOnly() {
  try {
    console.log('🚀 بدء الخادم الخلفي الذكي...');
    
    const API_PORT = await findAvailablePort(3005, [3006, 3007, 3008, 3009]);
    console.log(`📊 المنفذ المختار للخادم: ${API_PORT}`);
    
    const app = express();
    
    // Middleware
    app.use(cors({
      origin: '*',
      credentials: true
    }));
    app.use(express.json());
    
    // Health check
    app.get('/api/health', (req, res) => {
      res.json({
        success: true,
        message: 'Smart backend server is running!',
        timestamp: new Date().toISOString(),
        environment: 'smart-development-backend-only',
        backend: `http://localhost:${API_PORT}`,
        port: API_PORT
      });
    });
    
    // Mock portfolios API
    app.get('/api/portfolios', (req, res) => {
      const mockPortfolios = [
        {
          id: 1,
          name: 'محفظة الأسهم الأمريكية',
          description: 'محفظة متنوعة من الأسهم الأمريكية',
          initial_balance: 10000,
          current_balance: 12500,
          performance: 25.0
        },
        {
          id: 2,
          name: 'محفظة الأسهم السعودية',
          description: 'محفظة من الأسهم السعودية المختارة',
          initial_balance: 50000,
          current_balance: 47500,
          performance: -5.0
        }
      ];
      
      res.json({
        success: true,
        data: mockPortfolios
      });
    });
    
    // Mock stock price API
    app.get('/api/stocks/price/:symbol', (req, res) => {
      const { symbol } = req.params;
      const market = req.query.market || 'US';
      
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
    });
    
    // 404 handler
    app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: [
          'GET /api/health',
          'GET /api/portfolios',
          'GET /api/stocks/price/:symbol'
        ]
      });
    });
    
    const server = app.listen(API_PORT, () => {
      console.log(`✅ الخادم الخلفي يعمل بنجاح!`);
      console.log(`   🔗 http://localhost:${API_PORT}/api/health`);
      console.log(`   🔗 http://localhost:${API_PORT}/api/portfolios`);
      console.log(`   🔗 http://localhost:${API_PORT}/api/stocks/price/AAPL`);
      console.log('\n📋 اختبار APIs:');
      console.log(`   curl http://localhost:${API_PORT}/api/health`);
      console.log(`   curl http://localhost:${API_PORT}/api/portfolios`);
      console.log('\n   استخدم Ctrl+C للإيقاف');
    });
    
    process.on('SIGINT', () => {
      console.log('\n🛑 إيقاف الخادم...');
      server.close(() => {
        console.log('✅ تم إيقاف الخادم الخلفي');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ خطأ في بدء الخادم:', error.message);
    process.exit(1);
  }
}

startBackendOnly();
