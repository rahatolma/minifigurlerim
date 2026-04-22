import urllib.request
import json

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

sql = """
DROP INDEX IF EXISTS unique_slug_tr_published;
DROP INDEX IF EXISTS unique_slug_en_published;
ALTER TABLE minifigures DROP CONSTRAINT IF EXISTS minifigures_slug_key;

CREATE UNIQUE INDEX IF NOT EXISTS unique_slug_tr_per_series 
ON minifigures(series_id, LOWER(TRIM(slug_tr))) 
WHERE is_published = true AND slug_tr IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS unique_slug_en_per_series 
ON minifigures(series_id, LOWER(TRIM(slug_en))) 
WHERE is_published = true AND slug_en IS NOT NULL;
"""

url = f"{SUPABASE_URL}/rest/v1/rpc/run_sql"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, data=json.dumps({"sql_query": sql}).encode('utf-8'), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
except Exception as e:
    print(e)
