// supabaseClient.ts — único punto de conexión al backend compartido del equipo.
// La URL y la key públicas viven en .env.local (no se commitea; ver .env.example).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);
