const { Client } = require('pg');

const regions = [
  'eu-central-1', 'eu-west-1', 'eu-west-2', 'eu-west-3',
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
  'ap-northeast-1', 'ap-south-1', 'ap-southeast-1', 'ap-southeast-2',
  'ca-central-1', 'sa-east-1'
];

async function tryConnect() {
  console.log("Starting connections...");
  const promises = regions.map(async (region) => {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.hmzgccvwgrgrgkudvljb:9nhEJdbNbfwxuUUG@${host}:6543/postgres`;
    
    const client = new Client({ connectionString, connectionTimeoutMillis: 15000, ssl: { rejectUnauthorized: false } });
    try {
      await client.connect();
      console.log(`[SUCCESS] Connected via ${region}!`);
      
      await client.query(`ALTER TABLE public.series ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]'::jsonb;`);
      console.log('ALTER TABLE executed.');
      
      await client.query(`COMMENT ON COLUMN public.series.content_blocks IS 'Array of dynamic content blocks for detailed layout (e.g., hero, text+img, cta).';`);
      
      await client.query(`NOTIFY pgrst, 'reload schema';`);
      console.log('Cache reloaded.');
      process.exit(0);
    } catch (err) {
      console.log(host, err.message); if (err.message.includes('password authentication failed') || err.message.includes('database "postgres" does not exist')) {
          console.log(`Found region but failed auth: ${err.message}`);
          process.exit(1);
      }
    }
  });

  await Promise.all(promises);
  console.log("All finished or failed.");
}

tryConnect();
