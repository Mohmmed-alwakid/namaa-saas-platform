// Complete local development environment with Frontend + Backend + Database
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_PORT = 3005; // تغيير من 3003 إلى 3005
const FRONTEND_PORT = 5180; // تغيير من 5175 إلى 5180

// Middleware
app.use(cors({
  origin: [`http://localhost:${FRONTEND_PORT}`, 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Supabase configuration - REPLACE WITH YOUR PROJECT DETAILS
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Local development server is running!',
    timestamp: new Date().toISOString(),
    environment: 'local-development',
    frontend: `http://localhost:${FRONTEND_PORT}`,
    backend: `http://localhost:${API_PORT}`
  });
});// Database check endpoint
app.get('/api/db-check', async (req, res) => {
  try {
    // Test database connection
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
      connected: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Database connection error',
      details: error.message
    });
  }
});

// Authentication endpoints
app.post('/api/auth', async (req, res) => {
  const { action, email, password } = req.body;

  try {
    switch (action) {
      case 'login':
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (loginError) throw loginError;
        
        return res.json({
          success: true,
          user: loginData.user,
          session: loginData.session
        });

      case 'register':
        const { data: registerData, error: registerError } = await supabase.auth.signUp({
          email,
          password
        });
        
        if (registerError) throw registerError;
        
        return res.json({
          success: true,
          user: registerData.user,
          session: registerData.session,
          message: 'Registration successful'
        });

      case 'logout':
        const { error: logoutError } = await supabase.auth.signOut();
        if (logoutError) throw logoutError;
        
        return res.json({
          success: true,
          message: 'Logged out successfully'
        });

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});// Generic API endpoint for your application data
app.get('/api/data', async (req, res) => {
  try {
    // Example: Get data from your main table
    const { data, error } = await supabase
      .from('your_table_name') // REPLACE with your table name
      .select('*')
      .limit(10);
    
    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start the backend server
app.listen(API_PORT, () => {
  console.log(`🚀 Backend API server running on http://localhost:${API_PORT}`);
  console.log(`📊 Health check: http://localhost:${API_PORT}/api/health`);
  console.log(`🗄️ Database check: http://localhost:${API_PORT}/api/db-check`);
});

// Start the frontend development server
const startFrontend = () => {
  console.log(`🎨 Starting frontend development server...`);
  
  const frontend = spawn('npm', ['run', 'dev:client'], {
    stdio: 'inherit',
    shell: true,
    cwd: __dirname
  });

  frontend.on('close', (code) => {
    console.log(`Frontend server exited with code ${code}`);
  });

  frontend.on('error', (err) => {
    console.error('Failed to start frontend server:', err);
  });
};

// Start frontend after a short delay
setTimeout(startFrontend, 1000);

console.log(`
🎉 Full-Stack Development Environment Started!

📱 Frontend: http://localhost:${FRONTEND_PORT}
🔌 Backend:  http://localhost:${API_PORT}
🗄️ Database: Connected to Supabase

🔧 To customize:
1. Update Supabase credentials in .env file
2. Replace 'your_table_name' with your actual table names
3. Add your own API endpoints below the existing ones
4. Customize the frontend in src/client/

Happy coding! 🚀
`);