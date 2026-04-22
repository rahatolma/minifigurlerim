const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const check = async () => {
  const params = new URLSearchParams({
    'name': 'in.(Swoop,Orc Rogue,Baby Penguin,Fencer)',
    'select': 'name, figure_role_id, role, figure_type_id, type, rarity_id, rarity_score, rarity_level'
  });
  
  const res = await fetch(`${url}/rest/v1/minifigures?${params.toString()}`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
