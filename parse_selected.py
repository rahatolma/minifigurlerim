import json

with open("selected.json") as f:
    data = json.load(f)

for f in data:
    txt = f.get('short_description_tr') or ""
    print(f"{f.get('figure_name')} ({f.get('figure_code')}): {txt[:30]}...")

