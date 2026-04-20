import urllib.request
import json
import csv
import os
import re

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def get_series_map():
    url = f"{SUPABASE_URL}/rest/v1/series?select=id,title,slug_tr&limit=100"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return {row.get('title'): row.get('id') for row in data}
    except Exception as e:
        print("Error fetching series:", e)
        return {}

def get_db_codes():
    url = f"{SUPABASE_URL}/rest/v1/minifigures?select=figure_code&limit=2000"
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            return {row.get('figure_code').strip() for row in data if row.get('figure_code')}
    except Exception as e:
        print("Error fetching db codes:", e)
        return set()
        
def parse_int(val):
    try:
        return int(str(val).strip())
    except:
        return None

def rescue_figures():
    series_map = get_series_map()
    db_codes = get_db_codes()
    
    csv_file_path = os.path.join(os.path.dirname(__file__), '../public/import/Minifigures.csv')
    missing_figures = []
    
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            code = row.get('figure_code', '').strip()
            if not code or code in db_codes:
                continue
                
            s_name = row.get('series_name')
            series_id = series_map.get(s_name)
            if not series_id:
                print(f"Skipping {code}: undefined series_id for '{s_name}'")
                continue
                
            payload = {
                "series_id": series_id,
                "figure_code": code,
                "name": row.get('figure_name', ''), # Fixed missing 'name' constraint
                "figure_name": row.get('figure_name', ''),
                "slug": row.get('figure_slug_tr', ''), # Fill fallback slug
                "slug_tr": row.get('figure_slug_tr', ''),
                "slug_en": row.get('figure_slug_en') or None,
                "character_name": row.get('character_name') or None,
                "figure_role": row.get('figure_role') or None,
                "figure_type": row.get('figure_type') or None,
                "piece_count": parse_int(row.get('piece_count')),
                "accessory_count": parse_int(row.get('accessory_count')),
                "rarity_level": row.get('rarity_level') or 'Yaygın',
                "is_published": str(row.get('is_published')).lower() == 'true',
                "is_active": str(row.get('is_active')).lower() == 'true',
            }
            missing_figures.append(payload)

    print(f"Found {len(missing_figures)} missing figures to rescue.")
    
    success_count = 0
    url = f"{SUPABASE_URL}/rest/v1/minifigures"
    
    for fig in missing_figures:
        data = json.dumps(fig).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers=HEADERS, method='POST')
        try:
            with urllib.request.urlopen(req) as response:
                result = json.loads(response.read().decode())
                print(f"Rescued: {fig['figure_code']} ({fig['figure_name']})")
                success_count += 1
        except Exception as e:
            if hasattr(e, 'read'):
                err_body = e.read().decode()
                print(f"Failed to rescue {fig['figure_code']}: {e} - {err_body}")
            else:
                print(f"Failed to rescue {fig['figure_code']}: {e}")
                
    print(f"Rescue complete. Successfully inserted {success_count} figures.")

if __name__ == '__main__':
    rescue_figures()
