// supabase-client.ts — mismo proyecto Supabase que los módulos Vue y la
// contenedora. La key es pública (protegida por RLS, no un secreto); en un
// proyecto no-educativo esto viviría en los environment files de Angular.
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lxkjrdxlegciuvenkmni.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nGb2eFGg9U8xsHIFBAw4uQ_zzJWXFda';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
