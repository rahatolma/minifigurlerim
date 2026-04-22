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

  // Common headers
  const headers = { 'apikey': key, 'Authorization': `Bearer ${key}` };

  // Site Settings
  const res1 = await fetch(`${url}/rest/v1/site_settings?select=*`, { headers });
  const settings = await res1.json();
  const settingsIssues = settings.filter(s => JSON.stringify(s.value).includes('/uploads/'));

  // Home Sliders
  const res2 = await fetch(`${url}/rest/v1/home_sliders?select=*`, { headers });
  const sliders = await res2.json();
  const slidersIssues = sliders.filter(s => s.image_url && s.image_url.includes('/uploads/'));

  // Content Blocks
  const res3 = await fetch(`${url}/rest/v1/content_blocks?select=*`, { headers });
  const blocks = await res3.json();
  const blocksIssues = blocks.filter(s => JSON.stringify(s.content_json).includes('/uploads/'));

  console.log("=== DB /uploads/ AUDIT ===");
  console.log("Site Settings Issues:", settingsIssues.map(s => s.key));
  console.log("Home Sliders Issues ID:", slidersIssues.map(s => s.id));
  console.log("Content Blocks Issues ID:", blocksIssues.map(s => s.id));
}

check().catch(console.error);
