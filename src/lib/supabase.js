import { createClient } from '@supabase/supabase-js'

const rawUrl =
  import.meta.env?.NEXT_PUBLIC_SUPABASE_URL ||
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://wyaptachfpjdhpludqxm.supabase.co'

// Ensure URL does not end with /rest/v1 (which causes PGRST125 path duplication)
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '')

const supabaseAnonKey =
  import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_5i02JZQWOpsx4WamCIYzHw_-e4Ej6pp'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

