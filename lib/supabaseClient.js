// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Obtenemos las variables de entorno que configuraste en .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Creamos y exportamos una única instancia del cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);