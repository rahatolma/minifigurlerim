import json

with open('audit_dump.json') as f:
    data = json.load(f)

print("\n--- KISA AÇIKLAMASI BOŞ OLAN 20 FİGÜR ---")
for f in data:
    if not f.get('short_description_tr') or not str(f['short_description_tr']).strip():
        name = f.get('figure_name') or f.get('name') or f.get('id')
        print(f"[{f.get('figure_code', 'NOCODE')}] {name} (Role: {f.get('figure_role')})")
