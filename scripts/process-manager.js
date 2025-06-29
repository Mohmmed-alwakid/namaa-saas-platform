// Process Manager - إدارة العمليات وتجنب التعارض
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import chalk from 'chalk';

const execAsync = promisify(exec);

/**
 * فحص العمليات التي تعمل على منفذ معين
 */
async function getProcessesOnPort(port) {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      // Windows: استخدام netstat
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\n').filter(line => line.includes(':' + port));
      
      const processes = [];
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && pid !== '0') {
          try {
            const { stdout: processInfo } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV`);
            const lines = processInfo.split('\n');
            if (lines.length > 1) {
              const processData = lines[1].split(',');
              processes.push({
                pid: parseInt(pid),
                name: processData[0]?.replace(/"/g, '') || 'Unknown',
                port: port
              });
            }
          } catch (e) {
            // تجاهل أخطاء العملية المحددة
          }
        }
      }
      
      return processes;
    } else {
      // Linux/Mac: استخدام lsof
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split('\n').filter(pid => pid);
      
      const processes = [];
      for (const pid of pids) {
        try {
          const { stdout: processInfo } = await execAsync(`ps -p ${pid} -o comm=`);
          processes.push({
            pid: parseInt(pid),
            name: processInfo.trim(),
            port: port
          });
        } catch (e) {
          // تجاهل أخطاء العملية المحددة
        }
      }
      
      return processes;
    }
  } catch (error) {
    return []; // لا توجد عمليات على هذا المنفذ
  }
}

/**
 * قتل عملية بناءً على PID
 */
async function killProcess(pid, force = false) {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `taskkill ${force ? '/F' : ''} /PID ${pid}`
      : `kill ${force ? '-9' : ''} ${pid}`;
    
    await execAsync(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * قتل جميع العمليات على منفذ معين
 */
async function killProcessesOnPort(port, options = {}) {
  const { force = false, exclude = [], interactive = false } = options;
  
  const processes = await getProcessesOnPort(port);
  
  if (processes.length === 0) {
    console.log(chalk.green(`✅ لا توجد عمليات تعمل على المنفذ ${port}`));
    return { killed: 0, failed: 0 };
  }
  
  console.log(chalk.yellow(`⚠️  العمليات التالية تعمل على المنفذ ${port}:`));
  processes.forEach(process => {
    console.log(`   - ${process.name} (PID: ${process.pid})`);
  });
  
  if (interactive) {
    // في الوضع التفاعلي، اطلب تأكيداً من المستخدم
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
      rl.question('هل تريد قتل هذه العمليات؟ (y/N): ', resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      console.log(chalk.gray('تم إلغاء العملية'));
      return { killed: 0, failed: 0 };
    }
  }
  
  let killed = 0;
  let failed = 0;
  
  for (const process of processes) {
    if (exclude.includes(process.pid)) {
      console.log(chalk.gray(`⏭️  تجاهل العملية ${process.name} (PID: ${process.pid})`));
      continue;
    }
    
    const success = await killProcess(process.pid, force);
    if (success) {
      console.log(chalk.green(`✅ تم قتل العملية ${process.name} (PID: ${process.pid})`));
      killed++;
    } else {
      console.log(chalk.red(`❌ فشل في قتل العملية ${process.name} (PID: ${process.pid})`));
      failed++;
    }
  }
  
  return { killed, failed };
}

/**
 * تنظيف المنافذ المحجوزة لهذا المشروع
 */
async function cleanupProjectPorts() {
  const PROJECT_PORTS = [5180, 5181, 5182, 3005, 3006, 3007];
  
  console.log(chalk.blue('🧹 تنظيف منافذ المشروع...'));
  
  let totalKilled = 0;
  let totalFailed = 0;
  
  for (const port of PROJECT_PORTS) {
    const result = await killProcessesOnPort(port, { force: false });
    totalKilled += result.killed;
    totalFailed += result.failed;
  }
  
  console.log(chalk.bold(`\n📊 نتائج التنظيف:`));
  console.log(chalk.green(`   ✅ تم إيقاف ${totalKilled} عملية`));
  if (totalFailed > 0) {
    console.log(chalk.red(`   ❌ فشل في إيقاف ${totalFailed} عملية`));
  }
  
  return { totalKilled, totalFailed };
}

/**
 * العثور على عمليات Node.js التي تعمل
 */
async function findNodeProcesses() {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV');
      const lines = stdout.split('\n').slice(1); // تجاهل العنوان
      
      const processes = [];
      for (const line of lines) {
        if (line.trim()) {
          const data = line.split(',');
          const pid = parseInt(data[1]?.replace(/"/g, ''));
          if (!isNaN(pid)) {
            processes.push({
              pid,
              name: 'node.exe',
              memory: data[4]?.replace(/"/g, '') || 'Unknown'
            });
          }
        }
      }
      
      return processes;
    } else {
      const { stdout } = await execAsync('ps aux | grep node');
      const lines = stdout.split('\n').filter(line => 
        line.includes('node') && !line.includes('grep')
      );
      
      return lines.map(line => {
        const parts = line.trim().split(/\s+/);
        return {
          pid: parseInt(parts[1]),
          name: 'node',
          memory: parts[5] || 'Unknown'
        };
      }).filter(p => !isNaN(p.pid));
    }
  } catch (error) {
    return [];
  }
}

/**
 * عرض تقرير العمليات الجارية
 */
async function showProcessReport() {
  console.log(chalk.bold.blue('📋 تقرير العمليات الجارية:\n'));
  
  const nodeProcesses = await findNodeProcesses();
  
  if (nodeProcesses.length === 0) {
    console.log(chalk.green('✅ لا توجد عمليات Node.js تعمل حالياً'));
    return;
  }
  
  console.log(chalk.bold('🟢 عمليات Node.js النشطة:'));
  nodeProcesses.forEach(process => {
    console.log(chalk.gray(`   PID: ${process.pid} | الذاكرة: ${process.memory}`));
  });
  
  // فحص منافذ المشروع
  const PROJECT_PORTS = [5180, 3005];
  console.log(chalk.bold('\n🔍 فحص منافذ المشروع:'));
  
  for (const port of PROJECT_PORTS) {
    const processes = await getProcessesOnPort(port);
    if (processes.length > 0) {
      console.log(chalk.yellow(`   المنفذ ${port}: مستخدم`));
      processes.forEach(p => {
        console.log(chalk.gray(`     - ${p.name} (PID: ${p.pid})`));
      });
    } else {
      console.log(chalk.green(`   المنفذ ${port}: متاح`));
    }
  }
}

export {
  getProcessesOnPort,
  killProcess,
  killProcessesOnPort,
  cleanupProjectPorts,
  findNodeProcesses,
  showProcessReport
};
