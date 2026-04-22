import json

data = json.load(open("sample_data.json"))
for i, f in enumerate(data):
    name = f.get('figure_name') or f.get('name')
    print(f"\n--- FIGURE {i+1}: {name} ---")
    s = f.get('series') or {}
    cat = s.get('category_main') or s.get('category') or 'Unknown'
    print(f"Category: {cat}")
    print(">> DB RAW ROW:")
    print(f"figure_role: {f.get('figure_role')} | role: {f.get('role')}")
    print(f"figure_type: {f.get('figure_type')} | type: {f.get('type')}")
    print(f"release_month (local): {f.get('release_month')} | series.release_month: {s.get('release_month')}")
    print(f"release_year (local): {f.get('release_year')} | series.release_year: {s.get('release_year')}")
