const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const check = async () => {
  const params = new URLSearchParams({
    'limit': '1',
    'select': 'id, release_year, release_month, series(title, release_year, release_month)'
  });
  
  const res = await fetch(`${url}/rest/v1/minifigures?${params.toString()}`, {
    headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
