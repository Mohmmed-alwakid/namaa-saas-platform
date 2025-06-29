// Simple port check for testing (CommonJS)
const net = require('net');
const { exec } = require('child_process');

async function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port in use
    });
  });
}

function getProcessOnPort(port) {
  return new Promise((resolve) => {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;
    
    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(null);
        return;
      }
      
      if (isWindows) {
        const lines = stdout.trim().split('\n');
        const pidMatch = lines[0]?.match(/\s+(\d+)$/);
        resolve(pidMatch ? pidMatch[1] : null);
      } else {
        resolve(stdout.trim().split('\n')[0]);
      }
    });
  });
}

async function main() {
  console.log('🚀 فحص المنافذ لمشروع Namaa Investment Platform');
  console.log('━'.repeat(50));
  
  // Check frontend port (5180)
  const frontendAvailable = await checkPort(5180);
  const frontendProcess = await getProcessOnPort(5180);
  
  console.log(`Frontend (5180): ${frontendAvailable ? '✅ متاح' : '❌ مستخدم'}`);
  if (!frontendAvailable && frontendProcess) {
    console.log(`   العملية: PID ${frontendProcess}`);
  }
  
  // Check backend port (3005)
  const backendAvailable = await checkPort(3005);
  const backendProcess = await getProcessOnPort(3005);
  
  console.log(`Backend (3005): ${backendAvailable ? '✅ متاح' : '❌ مستخدم'}`);
  if (!backendAvailable && backendProcess) {
    console.log(`   العملية: PID ${backendProcess}`);
  }
  
  // Check alternative ports
  console.log('\n🔍 فحص المنافذ البديلة:');
  
  const alternativeFrontend = [5181, 5182, 5183];
  for (const port of alternativeFrontend) {
    const available = await checkPort(port);
    if (available) {
      console.log(`✅ منفذ بديل متاح للواجهة: ${port}`);
      break;
    }
  }
  
  const alternativeBackend = [3006, 3007, 3008];
  for (const port of alternativeBackend) {
    const available = await checkPort(port);
    if (available) {
      console.log(`✅ منفذ بديل متاح للخادم: ${port}`);
      break;
    }
  }
  
  console.log('\n📊 التوصية:');
  if (frontendAvailable && backendAvailable) {
    console.log('✅ جميع المنافذ المطلوبة متاحة');
    console.log('   يمكنك تشغيل: npm run dev:fullstack');
  } else {
    console.log('⚠️  بعض المنافذ مستخدمة');
    console.log('   استخدم السيرفر الذكي: npm run dev:smart');
    console.log('   أو السكريبت التفاعلي: smart-start.bat');
  }
  
  console.log('\n🛠️  أوامر مفيدة:');
  console.log('   npm run dev:smart           # السيرفر الذكي');
  console.log('   npm run process-report      # تقرير العمليات');
  console.log('   npm run cleanup-ports       # تنظيف المنافذ');
  console.log('   smart-start.bat             # واجهة تفاعلية');
}

main().catch(console.error);
