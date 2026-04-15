import { createClient } from '@supabase/supabase-js';
const supabase = createClient('http://test.com', 'test');
async function run() {
  const { data } = await supabase.from('series').select('id, name').returns<any[]>();
  console.log(data[0].does_not_exist);
}
