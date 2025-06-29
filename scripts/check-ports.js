// Port Checker - فحص المنافذ المتاحة قبل التشغيل
import net from 'net';
import { exec } from 'child_process';
// import chalk from 'chalk';  // مؤقتاً معطل

// دالة بديلة للألوان
const colors = {
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`
};

// المنافذ المطلوبة لهذا المشروع
const REQUIRED_PORTS = {
  frontend: 5180,
  backend: 3005,
  // منافذ بديلة في حالة التعارض
  alternativePorts: {
    frontend: [5181, 5182, 5183, 5184, 5185],
    backend: [3006, 3007, 3008, 3009, 3010]
  }
};

/**
 * فحص ما إذا كان المنفذ متاحاً
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // المنفذ متاح
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // المنفذ مستخدم
    });
  });
}

/**
 * العثور على منفذ متاح من قائمة المنافذ
 */
async function findAvailablePort(preferredPort, alternativePorts = []) {
  // فحص المنفذ المفضل أولاً
  if (await checkPort(preferredPort)) {
    return preferredPort;
  }
  
  // البحث في المنافذ البديلة
  for (const port of alternativePorts) {
    if (await checkPort(port)) {
      return port;
    }
  }
  
  // إنشاء منفذ عشوائي إذا لم تتوفر أي منافذ
  return await findRandomAvailablePort(preferredPort + 100);
}

/**
 * العثور على منفذ عشوائي متاح
 */
async function findRandomAvailablePort(startFrom = 8000) {
  for (let port = startFrom; port < startFrom + 100; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  throw new Error('لا يمكن العثور على منفذ متاح');
}

/**
 * فحص ما إذا كان هناك عملية تعمل على منفذ معين
 */
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
        // استخراج PID من نتيجة netstat في Windows
        const lines = stdout.trim().split('\n');
        const pidMatch = lines[0]?.match(/\s+(\d+)$/);
        resolve(pidMatch ? pidMatch[1] : null);
      } else {
        // في Linux/Mac، lsof يعيد PID مباشرة
        resolve(stdout.trim().split('\n')[0]);
      }
    });
  });
}

/**
 * فحص شامل لحالة المنافذ
 */
async function checkPortsStatus() {
  console.log(chalk.blue('🔍 فحص حالة المنافذ...'));
  
  const frontendPort = await findAvailablePort(
    REQUIRED_PORTS.frontend, 
    REQUIRED_PORTS.alternativePorts.frontend
  );
  
  const backendPort = await findAvailablePort(
    REQUIRED_PORTS.backend, 
    REQUIRED_PORTS.alternativePorts.backend
  );
  
  // فحص العمليات على المنافذ المطلوبة
  const frontendProcess = await getProcessOnPort(REQUIRED_PORTS.frontend);
  const backendProcess = await getProcessOnPort(REQUIRED_PORTS.backend);
  
  const status = {
    frontend: {
      preferred: REQUIRED_PORTS.frontend,
      available: frontendPort,
      isPreferredAvailable: frontendPort === REQUIRED_PORTS.frontend,
      processId: frontendProcess
    },
    backend: {
      preferred: REQUIRED_PORTS.backend,
      available: backendPort,
      isPreferredAvailable: backendPort === REQUIRED_PORTS.backend,
      processId: backendProcess
    }
  };
  
  return status;
}

/**
 * عرض تقرير حالة المنافذ
 */
function displayPortsReport(status) {
  console.log(colors.bold('\n📊 تقرير حالة المنافذ:'));
  console.log('━'.repeat(50));
  
  // حالة الواجهة الأمامية
  console.log(colors.bold('🎨 الواجهة الأمامية (Frontend):'));
  if (status.frontend.isPreferredAvailable) {
    console.log(colors.green(`  ✅ المنفذ ${status.frontend.preferred} متاح`));
  } else {
    console.log(colors.yellow(`  ⚠️  المنفذ ${status.frontend.preferred} مستخدم`));
    if (status.frontend.processId) {
      console.log(colors.gray(`     عملية: PID ${status.frontend.processId}`));
    }
    console.log(colors.blue(`  🔄 سيتم استخدام المنفذ ${status.frontend.available} بدلاً منه`));
  }
  
  // حالة الخادم الخلفي
  console.log(colors.bold('\n🔧 الخادم الخلفي (Backend):'));
  if (status.backend.isPreferredAvailable) {
    console.log(colors.green(`  ✅ المنفذ ${status.backend.preferred} متاح`));
  } else {
    console.log(colors.yellow(`  ⚠️  المنفذ ${status.backend.preferred} مستخدم`));
    if (status.backend.processId) {
      console.log(colors.gray(`     عملية: PID ${status.backend.processId}`));
    }
    console.log(colors.blue(`  🔄 سيتم استخدام المنفذ ${status.backend.available} بدلاً منه`));
  }
  
  console.log('━'.repeat(50));
}

/**
 * إنتاج ملف .env محدث بالمنافذ المتاحة
 */
async function updateEnvFile(status) {
  const fs = await import('fs').then(m => m.promises);
  
  try {
    let envContent = await fs.readFile('.env', 'utf8');
    
    // تحديث منفذ الواجهة
    envContent = envContent.replace(
      /NEXT_PUBLIC_APP_URL=http:\/\/localhost:\d+/,
      `NEXT_PUBLIC_APP_URL=http://localhost:${status.frontend.available}`
    );
    
    // تحديث منفذ الخادم
    envContent = envContent.replace(
      /API_BASE_URL=http:\/\/localhost:\d+/,
      `API_BASE_URL=http://localhost:${status.backend.available}`
    );
    
    await fs.writeFile('.env', envContent);
    console.log(colors.green('✅ تم تحديث ملف .env بالمنافذ المتاحة'));
    
  } catch (error) {
    console.log(colors.yellow('⚠️  لم يتم العثور على ملف .env أو حدث خطأ في التحديث'));
  }
}

/**
 * الدالة الرئيسية
 */
async function main() {
  try {
    console.log(colors.bold(colors.blue('🚀 فحص المنافذ لمشروع Namaa Investment Platform\n')));
    
    const status = await checkPortsStatus();
    displayPortsReport(status);
    
    // تحديث ملف .env إذا كانت هناك تغييرات
    if (!status.frontend.isPreferredAvailable || !status.backend.isPreferredAvailable) {
      console.log(colors.blue('\n🔄 تحديث إعدادات المشروع...'));
      await updateEnvFile(status);
    }
    
    // إرجاع النتائج للاستخدام في سكريبتات أخرى
    return status;
    
  } catch (error) {
    console.error(colors.red('❌ خطأ في فحص المنافذ:'), error.message);
    process.exit(1);
  }
}

// تشغيل الفحص إذا تم استدعاء الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { checkPortsStatus, findAvailablePort, main as checkPorts };
