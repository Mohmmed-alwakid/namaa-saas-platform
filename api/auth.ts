// Authentication API endpoint
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    const { action, email, password, name } = req.body;

    switch (action) {
      case 'login': {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (loginError) {
          return res.status(400).json({
            success: false,
            error: loginError.message
          });
        }
        
        return res.status(200).json({
          success: true,
          user: loginData.user,
          session: loginData.session
        });
      }

      case 'register': {
        const { data: registerData, error: registerError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || ''
            }
          }
        });
        
        if (registerError) {
          return res.status(400).json({
            success: false,
            error: registerError.message
          });
        }
        
        return res.status(200).json({
          success: true,
          user: registerData.user,
          session: registerData.session,
          message: 'Registration successful'
        });
      }

      case 'logout': {
        const { error: logoutError } = await supabase.auth.signOut();
        
        if (logoutError) {
          return res.status(400).json({
            success: false,
            error: logoutError.message
          });
        }
        
        return res.status(200).json({
          success: true,
          message: 'Logged out successfully'
        });
      }

      default: {
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}