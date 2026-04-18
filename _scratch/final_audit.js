const fs = require('fs');

async function check() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  let url = '', key = '';
  envFile.split('\n').forEach(line => {
    if(line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
    if(line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = line.split('=')[1].trim();
  });

  if (!url || !key) {
    console.log("No url or key"); return;
  }

  const headers = { 'apikey': key, 'Authorization': `Bearer ${key}` };

  async function checkTable(table, fields) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*`, { headers });
    if (!res.ok) {
       console.log(`Table ${table} fetch failed.`);
       return 0;
    }
    const data = await res.json();
    let issues = 0;
    data.forEach(row => {
      let flag = false;
      fields.forEach(f => {
         if (row[f] && typeof row[f] === 'string' && row[f].includes('/uploads/')) flag = true;
         if (row[f] && typeof row[f] === 'object' && JSON.stringify(row[f]).includes('/uploads/')) flag = true;
      });
      if (flag) issues++;
    });
    console.log(`[DB] ${table} -> ${issues} records contain /uploads/`);
    return issues;
  }

  await checkTable('series', ['cover_image_url']);
  await checkTable('figures', ['main_image_url', 'images']);
  await checkTable('news', ['cover_image_url', 'cover_image_vertical_url', 'content']);
  await checkTable('about_settings', ['hero_image_url', 'boss_image_url', 'mid_image_url', 'small_image_url', 'join_image_url']);
  await checkTable('home_sliders', ['image_url']);
  // await checkTable('site_settings', ['value']); // Already confirmed not to exist
}

check().catch(console.error);
