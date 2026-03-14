import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://rkjmyjjosfqfbafdnkbo.supabase.co'
const supabaseKey = 'sb_publishable_LjdzIufnsJzTvmlqbwA_eQ_Lo0f9v9f'
export const supabase = createClient(supabaseUrl, supabaseKey)