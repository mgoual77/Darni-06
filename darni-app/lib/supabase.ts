import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://etcuelnixtwuazyfmnvm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0Y3VlbG5peHR3dWF6eWZtbnZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDc1MDgsImV4cCI6MjA5Mzg4MzUwOH0.TRT0s0y8RqgV0YggtvSjNsv07xbInLv1MmTRuQBJ7lY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);