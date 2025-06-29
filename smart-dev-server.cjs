// Smart Development Server - مبسط للاختبار
const express = require('express');
const cors = require('cors');
const net = require('net');
const { spawn } = require('child_process');

let app;
let frontendProcess;
let backendServer;

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
  
  // إذا لم نجد منفذ متاح، نبحث عشوائياً
  for (let port = preferredPort + 10; port < preferredPort + 50; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  
  throw new Error('لا يمكن العثور على منفذ متاح');
}

async function startSmartServer() {
  try {
    console.log('🚀 بدء السيرفر الذكي لمنصة الاستثمار...');
    
    // العثور على منافذ متاحة
    const FRONTEND_PORT = await findAvailablePort(5180, [5181, 5182, 5183, 5184]);
    const API_PORT = await findAvailablePort(3005, [3006, 3007, 3008, 3009]);
    
    console.log(`📊 المنافذ المختارة:`);
    console.log(`   الواجهة الأمامية: ${FRONTEND_PORT}`);
    console.log(`   الخادم الخلفي: ${API_PORT}`);
    
    // إنشاء تطبيق Express
    app = express();
    
    // Middleware
    app.use(cors({
      origin: [
        `http://localhost:${FRONTEND_PORT}`,
        'http://localhost:3000'
      ],
      credentials: true
    }));
    app.use(express.json());
    
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
    
    // ===== START BACKEND =====
    backendServer = app.listen(API_PORT, () => {
      console.log(`✅ الخادم الخلفي يعمل على المنفذ ${API_PORT}`);
      console.log(`   🔗 http://localhost:${API_PORT}/api/health`);
    });
    
    // ===== START FRONTEND =====
    console.log('🎨 بدء الواجهة الأمامية...');
    
    const isWindows = process.platform === 'win32';
    
    // تحديد المسار الصحيح لـ npm في Windows
    let npmCommand;
    if (isWindows) {
      // في Windows، نحتاج للمسار الكامل أو استخدام shell
      npmCommand = 'npm';
    } else {
      npmCommand = 'npm';
    }
    
    const spawnOptions = {
      stdio: 'pipe',
      shell: isWindows, // استخدام shell في Windows
      env: {
        ...process.env,
        PORT: FRONTEND_PORT,
        VITE_PORT: FRONTEND_PORT
      }
    };
    
    try {
      frontendProcess = spawn(npmCommand, ['run', 'dev:client'], spawnOptions);
      
      frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log('Frontend output:', output);
        if (output.includes('Local:') || output.includes('localhost')) {
          console.log(`✅ الواجهة الأمامية تعمل على المنفذ ${FRONTEND_PORT}`);
          console.log(`   🔗 http://localhost:${FRONTEND_PORT}`);
          console.log('\n🎉 جميع الخدمات تعمل بنجاح!');
          console.log('   استخدم Ctrl+C للإيقاف\n');
        }
      });
      
      frontendProcess.stderr.on('data', (data) => {
        const error = data.toString();
        console.log('Frontend stderr:', error);
      });
      
      frontendProcess.on('error', (error) => {
        console.error('Frontend process error:', error);
        console.log('⚠️  سيتم تشغيل الخادم الخلفي فقط');
      });
      
    } catch (error) {
      console.error('خطأ في إنشاء عملية الواجهة الأمامية:', error);
      console.log('⚠️  سيتم تشغيل الخادم الخلفي فقط');
    }
    
  } catch (error) {
    console.error('❌ خطأ في بدء السيرفر:', error.message);
    process.exit(1);
  }
}

function stopServer() {
  console.log('\n🛑 إيقاف السيرفر...');
  
  if (frontendProcess) {
    frontendProcess.kill();
    console.log('   ✅ تم إيقاف الواجهة الأمامية');
  }
  
  if (backendServer) {
    backendServer.close(() => {
      console.log('   ✅ تم إيقاف الخادم الخلفي');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
}

// معالجة إشارات الإيقاف
process.on('SIGINT', stopServer);
process.on('SIGTERM', stopServer);

// بدء السيرفر
startSmartServer();
