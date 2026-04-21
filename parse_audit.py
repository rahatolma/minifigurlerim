import json

try:
    with open('audit_dump.json') as f:
        data = json.load(f)
        
    total = len(data)
    stats = {
        'short_description_tr': 0, 'description': 0, 'figure_role': 0, 'figure_type': 0,
        'release_month': 0, 'release_year': 0, 'figure_number': 0, 'piece_count': 0
    }
    
    for f in data:
        if f.get('short_description_tr') and str(f['short_description_tr']).strip(): stats['short_description_tr'] += 1
        if f.get('description') and str(f['description']).strip(): stats['description'] += 1
        if f.get('figure_role') and str(f['figure_role']).strip(): stats['figure_role'] += 1
        if f.get('figure_type') and str(f['figure_type']).strip(): stats['figure_type'] += 1
        if f.get('release_month') and str(f['release_month']).strip(): stats['release_month'] += 1
        if f.get('release_year'): stats['release_year'] += 1
        if f.get('figure_number') is not None: stats['figure_number'] += 1
        if f.get('piece_count') is not None: stats['piece_count'] += 1

    print(f"\n--- {total} FIGURE BULK AUDIT ---")
    print(">> DB DOLULUK ORANLARI:")
    for k, v in stats.items():
        pct = (v / total * 100) if total > 0 else 0
        print(f"{k.ljust(22)} : {str(v).rjust(4)} dolu / {str(total-v).rjust(4)} boş  (%{pct:.1f})")
except Exception as e:
    print(e)
