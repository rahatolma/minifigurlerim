import urllib.request
import json

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

url = f"{SUPABASE_URL}/rest/v1/minifigures?select=id,slug,figure_code,piece_count"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        total = len(data)
        not_null_count = sum(1 for row in data if row.get('piece_count') is not None)
        null_count = sum(1 for row in data if row.get('piece_count') is None)
        
        figure_codes = {}
        for row in data:
            code = row.get('figure_code')
            if code:
                figure_codes[code] = figure_codes.get(code, 0) + 1
                
        duplicates = {k: v for k, v in figure_codes.items() if v > 1}
        
        print(f"Total Records: {total}")
        print(f"Not Null Piece Count: {not_null_count}")
        print(f"Null Piece Count: {null_count}")
        print(f"Duplicate Figure Codes: {json.dumps(duplicates, indent=2)}")
except Exception as e:
    print("Error:", e)
