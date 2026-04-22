import urllib.request
import json

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

url = f"{SUPABASE_URL}/rest/v1/minifigures?select=series_id,slug_tr,slug_en&limit=2000"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        seen_tr = set()
        conflicts_tr = []
        for row in data:
            if row.get('slug_tr') and row.get('series_id'):
                key = f"{row['series_id']}_{row['slug_tr'].strip().lower()}"
                if key in seen_tr: conflicts_tr.append(key)
                seen_tr.add(key)
                
        print(f"Conflicts for new UNIQUE(series_id, slug_tr) constraint: {len(conflicts_tr)}")
except Exception as e:
    print("Error:", e)
