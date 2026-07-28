require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const { data, error } = await supabase.from('orders').select('id').limit(1);
  if (error) {
    console.error("Supabase Error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Success! Data:", data);
  }
}
test();
