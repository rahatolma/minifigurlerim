import urllib.request
import json
import os

url = "https://hmzgccvwgrgrgkudvljb.supabase.co/rest/v1/minifigures?select=id,name,slug,slug_tr,slug_en,is_published,created_at&limit=10000"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        # Group by slug_tr
        from collections import defaultdict
        groups = defaultdict(list)
        for item in data:
            s_tr = item.get('slug_tr')
            s = item.get('slug')
            # The query logic checks slug_tr, slug, slug_en. Let's group by whatever the getMinifigureBySlug checks.
            # Usually slug_tr is the canonical identifier for TR. Let's just group by slug_tr for now (ignoring nulls)
            if s_tr:
                groups[s_tr].append(item)
        
        duplicates = {k: v for k, v in groups.items() if len(v) > 1}
        print(json.dumps(duplicates, indent=2))
except Exception as e:
    print("Error:", e)
