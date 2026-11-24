import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

const options: any = {
  auth: {
    persistSession: typeof window !== 'undefined',
  },
};

if (typeof window === 'undefined') {
  try {
    // Provide Node.js WebSocket transport for test runner and server environments
    const ws = require('ws');
    options.realtime = { transport: ws };
  } catch {
    // Fallback if ws is unavailable
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, options);
