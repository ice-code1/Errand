import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = "https://beyxqjgavidtnyorzsht.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJleXhxamdhdmlkdG55b3J6c2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNTQ1NTYsImV4cCI6MjA2OTgzMDU1Nn0.5vnci6uf0_uTO7vS7VVQwrweSlKObGCfe8O17X2McV0";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);