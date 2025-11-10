import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xyxhvvpyyfgwssimntxs.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5eGh2dnB5eWZnd3NzaW1udHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3MjM2NDEsImV4cCI6MjA3ODI5OTY0MX0.rNHUA2-c1O4EV4mt4l87Pmh9UZ9mWWB7Le0OxdiCwYE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

