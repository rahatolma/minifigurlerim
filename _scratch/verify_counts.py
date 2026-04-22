import urllib.request
import json
import collections

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

url = f"{SUPABASE_URL}/rest/v1/minifigures?select=series_name,figure_code&limit=2000"
headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        print(f"1. Toplam Kayıt Sayısı: {len(data)}")
        
        # In case the series_name on minifigures table is missing, we use code
        # Wait, the newly inserted 19 figures don't have series_name populated by the script!
        # Because my python payload only had mostly columns... Wait, let's just make an inner join fetch
except Exception as e:
    print(e)
