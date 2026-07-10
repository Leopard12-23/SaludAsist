// supabaseClient.ts — mismo proyecto Supabase que usan los módulos Vue y
// Angular. La contenedora hace el login real; los módulos, al vivir bajo
// el mismo origen, heredan la sesión que supabase-js persiste en
// localStorage (misma clave sb-<project-ref>-auth-token para los tres).
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(url, anonKey);
