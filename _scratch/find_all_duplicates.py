import urllib.request
import json
from collections import defaultdict

url = "https://hmzgccvwgrgrgkudvljb.supabase.co/rest/v1/minifigures?select=id,name,slug,slug_tr,slug_en&limit=10000"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        
        slugs = defaultdict(list)
        slug_trs = defaultdict(list)
        slug_ens = defaultdict(list)
        
        for item in data:
            if item.get('slug'): slugs[item['slug']].append(item['id'])
            if item.get('slug_tr'): slug_trs[item['slug_tr']].append(item['id'])
            if item.get('slug_en'): slug_ens[item['slug_en']].append(item['id'])
        
        dups_slug = {k: v for k, v in slugs.items() if len(v) > 1}
        dups_slug_tr = {k: v for k, v in slug_trs.items() if len(v) > 1}
        dups_slug_en = {k: v for k, v in slug_ens.items() if len(v) > 1}
        
        print("Duplicated Slugs:", len(dups_slug))
        if len(dups_slug) > 0: print(json.dumps(dups_slug, indent=2))
        
        print("Duplicated Slug TR:", len(dups_slug_tr))
        if len(dups_slug_tr) > 0: print(json.dumps(dups_slug_tr, indent=2))

        print("Duplicated Slug EN:", len(dups_slug_en))
        if len(dups_slug_en) > 0: print(json.dumps(dups_slug_en, indent=2))
        
except Exception as e:
    print("Error:", e)
