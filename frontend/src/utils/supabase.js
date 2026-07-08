// F:\portfolio-webapp\frontend\src\utils\supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bfeaqiuurcazijniettw.supabase.co';
const supabaseAnonKey = 'sb_publishable_9vYJQWjLU1iKKuEkiCrFEQ_Rm6kTLvM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
