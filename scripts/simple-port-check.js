// Simple port check for testing
const net = require('net');

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

async function main() {
  console.log('🚀 فحص المنافذ لمشروع Namaa Investment Platform');
  console.log('━'.repeat(50));
  
  // Check frontend port
  const frontendAvailable = await checkPort(5180);
  console.log(`Frontend (5180): ${frontendAvailable ? '✅ متاح' : '❌ مستخدم'}`);
  
  // Check backend port
  const backendAvailable = await checkPort(3005);
  console.log(`Backend (3005): ${backendAvailable ? '✅ متاح' : '❌ مستخدم'}`);
  
  console.log('\n📊 النتيجة:');
  if (frontendAvailable && backendAvailable) {
    console.log('✅ جميع المنافذ المطلوبة متاحة - يمكن تشغيل المشروع');
  } else {
    console.log('⚠️  بعض المنافذ مستخدمة - سيتم اختيار منافذ بديلة');
  }
}

main().catch(console.error);
