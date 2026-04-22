import csv
import json
import urllib.request
import os

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

def update_piece_count(figure_code, piece_count):
    url = f"{SUPABASE_URL}/rest/v1/minifigures?figure_code=eq.{figure_code}"
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    data = json.dumps({"piece_count": int(piece_count)}).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(req) as response:
            return response.status in [200, 204]
    except Exception as e:
        print(f"Error updating {figure_code}: {e}")
        return False

def main():
    csv_file_path = os.path.join(os.path.dirname(__file__), '../public/import/Minifigures.csv')
    success_count = 0
    skip_count = 0
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            code = row.get('figure_code')
            pieces = row.get('piece_count')
            if code and pieces and str(pieces).strip().isdigit():
                if update_piece_count(code.strip(), pieces.strip()):
                    success_count += 1
            else:
                skip_count += 1
                
    print(f"Finished backfill. Updated {success_count} figures. Skipped {skip_count} due to missing piece count or codes.")

if __name__ == '__main__':
    main()
