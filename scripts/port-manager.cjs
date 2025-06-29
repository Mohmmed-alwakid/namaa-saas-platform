// Comprehensive Port Management System
const net = require('net');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

/**
 * Check if a port is available
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // Port is available
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // Port is in use
    });
  });
}

/**
 * Find available port from a list of preferred ports
 */
async function findAvailablePort(preferredPort, alternativePorts = []) {
  // Check preferred port first
  if (await checkPort(preferredPort)) {
    return preferredPort;
  }
  
  // Check alternative ports
  for (const port of alternativePorts) {
    if (await checkPort(port)) {
      return port;
    }
  }
  
  // Generate random available port if none found
  return await findRandomAvailablePort(preferredPort + 100);
}

/**
 * Find a random available port
 */
async function findRandomAvailablePort(startFrom = 8000) {
  for (let port = startFrom; port < startFrom + 100; port++) {
    if (await checkPort(port)) {
      return port;
    }
  }
  throw new Error('Cannot find an available port');
}

/**
 * Get process information for a specific port
 */
async function getProcessOnPort(port) {
  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows 
      ? `netstat -ano | findstr :${port}`
      : `lsof -ti:${port}`;
    
    const { stdout } = await execAsync(command);
    
    if (!stdout.trim()) {
      return null;
    }
    
    if (isWindows) {
      // Extract PID from netstat output on Windows
      const lines = stdout.trim().split('\n');
      const pidMatch = lines[0]?.match(/\\s+(\\d+)$/);
      return pidMatch ? pidMatch[1] : null;
    } else {
      // On Linux/Mac, lsof returns PID directly
      return stdout.trim().split('\n')[0];
    }
  } catch (error) {
    return null;
  }
}

/**
 * Comprehensive port status check
 */
async function checkPortsStatus() {
  console.log('🔍 Checking port availability...');
  
  const PROJECT_PORTS = {
    frontend: { preferred: 5180, alternatives: [5181, 5182, 5183, 5184, 5185] },
    backend: { preferred: 3005, alternatives: [3006, 3007, 3008, 3009, 3010] }
  };
  
  const frontendPort = await findAvailablePort(
    PROJECT_PORTS.frontend.preferred, 
    PROJECT_PORTS.frontend.alternatives
  );
  
  const backendPort = await findAvailablePort(
    PROJECT_PORTS.backend.preferred, 
    PROJECT_PORTS.backend.alternatives
  );
  
  // Check processes on preferred ports
  const frontendProcess = await getProcessOnPort(PROJECT_PORTS.frontend.preferred);
  const backendProcess = await getProcessOnPort(PROJECT_PORTS.backend.preferred);
  
  const status = {
    frontend: {
      preferred: PROJECT_PORTS.frontend.preferred,
      available: frontendPort,
      isPreferredAvailable: frontendPort === PROJECT_PORTS.frontend.preferred,
      processId: frontendProcess
    },
    backend: {
      preferred: PROJECT_PORTS.backend.preferred,
      available: backendPort,
      isPreferredAvailable: backendPort === PROJECT_PORTS.backend.preferred,
      processId: backendProcess
    }
  };
  
  return status;
}

/**
 * Display comprehensive port report
 */
function displayPortsReport(status) {
  console.log('\\n📊 Port Status Report:');
  console.log('━'.repeat(50));
  
  // Frontend status
  console.log('🎨 Frontend:');
  if (status.frontend.isPreferredAvailable) {
    console.log(`  ✅ Port ${status.frontend.preferred} is available`);
  } else {
    console.log(`  ⚠️  Port ${status.frontend.preferred} is in use`);
    if (status.frontend.processId) {
      console.log(`     Process: PID ${status.frontend.processId}`);
    }
    console.log(`  🔄 Will use port ${status.frontend.available} instead`);
  }
  
  // Backend status
  console.log('\\n🔧 Backend:');
  if (status.backend.isPreferredAvailable) {
    console.log(`  ✅ Port ${status.backend.preferred} is available`);
  } else {
    console.log(`  ⚠️  Port ${status.backend.preferred} is in use`);
    if (status.backend.processId) {
      console.log(`     Process: PID ${status.backend.processId}`);
    }
    console.log(`  🔄 Will use port ${status.backend.available} instead`);
  }
  
  console.log('━'.repeat(50));
  console.log(`🌐 Frontend will be available at: http://localhost:${status.frontend.available}`);
  console.log(`🔗 Backend API will be available at: http://localhost:${status.backend.available}`);
  console.log('━'.repeat(50));
}

/**
 * Update environment file with available ports
 */
async function updateEnvFile(status) {
  const fs = require('fs').promises;
  
  try {
    let envContent = await fs.readFile('.env', 'utf8');
    
    // Update frontend port
    envContent = envContent.replace(
      /NEXT_PUBLIC_APP_URL=http:\/\/localhost:\d+/,
      `NEXT_PUBLIC_APP_URL=http://localhost:${status.frontend.available}`
    );
    
    // Update backend port
    envContent = envContent.replace(
      /API_BASE_URL=http:\/\/localhost:\d+/,
      `API_BASE_URL=http://localhost:${status.backend.available}`
    );
    
    await fs.writeFile('.env', envContent);
    console.log('✅ Environment file updated with available ports');
    
  } catch (error) {
    console.log('⚠️  Could not find or update .env file');
  }
}

/**
 * Kill processes on specific port
 */
async function killProcessesOnPort(port) {
  try {
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
      const lines = stdout.trim().split('\\n').filter(line => line.includes(':' + port));
      
      for (const line of lines) {
        const parts = line.trim().split(/\\s+/);
        const pid = parts[parts.length - 1];
        
        if (pid && pid !== '0') {
          try {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`✅ Killed process PID ${pid} on port ${port}`);
          } catch (e) {
            console.log(`⚠️  Could not kill process PID ${pid}`);
          }
        }
      }
    } else {
      const { stdout } = await execAsync(`lsof -ti:${port}`);
      const pids = stdout.trim().split('\\n').filter(pid => pid);
      
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`✅ Killed process PID ${pid} on port ${port}`);
        } catch (e) {
          console.log(`⚠️  Could not kill process PID ${pid}`);
        }
      }
    }
  } catch (error) {
    console.log(`ℹ️  No processes found on port ${port}`);
  }
}

module.exports = {
  checkPort,
  findAvailablePort,
  checkPortsStatus,
  displayPortsReport,
  updateEnvFile,
  killProcessesOnPort,
  getProcessOnPort
};

// If this file is run directly, execute port check
if (require.main === module) {
  async function main() {
    try {
      const status = await checkPortsStatus();
      displayPortsReport(status);
      
      console.log('\n💡 Available commands:');
      console.log('   npm run dev:smart     - Start smart development server');
      console.log('   npm run dev:toolkit   - Open development toolkit');
      console.log('   npm run cleanup-ports - Clean up used ports');
    } catch (error) {
      console.error('❌ Error checking ports:', error.message);
    }
  }
  
  main();
}
