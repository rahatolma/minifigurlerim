import urllib.request
import json
import csv
import os

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_missing_figure_numbers():
    csv_file_path = os.path.join(os.path.dirname(__file__), '../public/import/Minifigures.csv')
    mapping = {}
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            code = row.get('figure_code', '').strip()
            num = row.get('figure_number', '').strip()
            if code and num:
                mapping[code] = num
    return mapping

def patch_db():
    url = f"{SUPABASE_URL}/rest/v1/minifigures?select=id,figure_code,figure_number&limit=2000"
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as response:
        db_figs = json.loads(response.read().decode())
    
    mapping = get_missing_figure_numbers()
    updated = 0
    
    for fig in db_figs:
        if not fig.get('figure_number'):
            code = fig.get('figure_code', '').strip()
            if code in mapping:
                correct_num = mapping[code]
                
                # Fetch to update
                patch_url = f"{SUPABASE_URL}/rest/v1/minifigures?id=eq.{fig['id']}"
                payload = json.dumps({"figure_number": correct_num}).encode('utf-8')
                
                patch_req = urllib.request.Request(patch_url, data=payload, headers=HEADERS, method='PATCH')
                try:
                    with urllib.request.urlopen(patch_req) as res:
                        print(f"Patched {code} with figure_number {correct_num}")
                        updated += 1
                except Exception as e:
                    print(f"Failed to patch {code}: {e}")

    print(f"Finished patching {updated} figures.")

if __name__ == '__main__':
    patch_db()
