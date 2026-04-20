import urllib.request
import json
import collections

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

url = f"{SUPABASE_URL}/rest/v1/minifigures?select=figure_code,series!inner(title)&limit=2000"
headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        print(f"2. Toplam Minifigure Sayısı: {len(data)}")
        
        series_counts = collections.Counter()
        for row in data:
            s_title = row.get('series', {}).get('title', 'Bilinmeyen Seri')
            series_counts[s_title] += 1
            
        print("\n3. Seri Bazlı Sayım:")
        for k, v in sorted(series_counts.items()):
            print(f" - {k}: {v} figür")
            
        print("\n4. 16 Olması Gereken Ana Seriler Doğrulaması:")
        for i in range(1, 20):
            k = f"LEGO® Minifigürler Serisi {i}" if i > 1 else "LEGO® Minifigürler Serisi 1"
            if k in series_counts:
                print(f"{k} => {series_counts[k]}/16")
                
except Exception as e:
    print(e)
