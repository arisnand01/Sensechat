import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jwvtzttaymsazzfuseqj.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3dnR6dHRheW1zYXp6ZnVzZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjkzMTYsImV4cCI6MjA4MDYwNTMxNn0.hPt5J0dxG5YKx2zDZy40hKp3EdW8eCPVuojK8w99L_0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the supabase client like this:
// For React:
// import { supabase } from "@/integrations/supabase/client";
// For React Native:
// import { supabase } from "@/src/integrations/supabase/client";
