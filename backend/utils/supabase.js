const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Make sure this is included at the top

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = supabase;
