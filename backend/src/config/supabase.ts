// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables early
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Create Supabase client (will fail gracefully if credentials missing)
// The error will be caught when methods are actually called
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// Export configuration
export const supabaseConfig = {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
    isConfigured: !!supabaseUrl && !!supabaseAnonKey,
};

export default supabase;
