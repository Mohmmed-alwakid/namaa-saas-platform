// Database connection check endpoint
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Simple query to test database connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      // If users table doesn't exist, that's expected for a new project
      if (error.message.includes('relation "users" does not exist')) {
        return res.status(200).json({
          success: true,
          message: 'Database connected - Users table needs to be created',
          connected: true,
          note: 'Run your database migrations to create tables'
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Database connection failed',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      connected: true,
      recordCount: data?.length || 0
    });
  } catch (error) {
    console.error('Database check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Database connection error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}