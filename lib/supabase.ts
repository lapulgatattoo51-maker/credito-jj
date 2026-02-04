
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtkfxfyixxgsaccrjlhd.supabase.co';
const supabaseAnonKey = 'sb_publishable_6fuvnX28qZK-3OXwJJ9-2Q_i2AoTlfW';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
