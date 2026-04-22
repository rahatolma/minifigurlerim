import json

with open("schema_check.json") as f:
    data = json.load(f)
    if data and len(data) > 0:
        keys = list(data[0].keys())
        matches = [k for k in keys if 'nadir' in k.lower() or 'rarity' in k.lower()]
        print("MATCHING DB COLUMNS:")
        for m in matches: print("- " + m)
    else:
        print("NO DATA")
