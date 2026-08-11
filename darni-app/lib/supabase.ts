import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lposqetpyseafowyxfpr.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwb3NxZXRweXNlYWZvd3l4ZnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0MzE0MDUsImV4cCI6MjEwMjAwNzQwNX0.4I5r2ygMEpzEbRETwgd6jZqIi8-zSuF3mRxPKp2WuKY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);