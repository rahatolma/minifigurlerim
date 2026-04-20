import urllib.request
import json
import csv
import os

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

def get_db_codes():
    url = f"{SUPABASE_URL}/rest/v1/minifigures?select=figure_code,figure_name&limit=2000"
    headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}"}
    req = urllib.request.Request(url, headers=headers)
    db_data = []
    try:
        with urllib.request.urlopen(req) as response:
            db_data = json.loads(response.read().decode())
    except Exception as e:
        print("DB Error:", e)
    
    db_set = set()
    db_names = {}
    for row in db_data:
        f_code = row.get('figure_code', '').strip()
        if f_code:
            db_set.add(f_code)
            db_names[f_code] = row.get('figure_name', '')
    return db_set, db_names

def generate_report():
    db_codes, db_names = get_db_codes()
    
    csv_file_path = os.path.join(os.path.dirname(__file__), '../public/import/Minifigures.csv')
    
    series_groups = {} # series_name -> { csv_codes: [], missing_codes: [] }
    csv_total_codes = set()
    
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as file:
        reader = csv.DictReader(file)
        for row in reader:
            s_name = row.get('series_name') or 'Unknown'
            f_code = row.get('figure_code', '').strip()
            f_name = row.get('figure_name', '').strip()
            if not f_code: continue
            
            if s_name not in series_groups:
                series_groups[s_name] = {'rows': []}
                
            series_groups[s_name]['rows'].append({'code': f_code, 'name': f_name})
            csv_total_codes.add(f_code)
            
    report = "# Excel (CSV) ve Veritabanı (DB) Karşılaştırma Raporu\n\n"
    report += "Aşağıda her bir seri için güncel DB durumu ile ana Excel veri kaynağı arasındaki eksik figürler listelenmiştir.\n\n"
    
    total_missing = 0
    total_db = len(db_codes)
    total_csv = len(csv_total_codes)
    
    for series_name in sorted(series_groups.keys()):
        rows = series_groups[series_name]['rows']
        
        missing_in_db = [r for r in rows if r['code'] not in db_codes]
        
        db_count_for_series = len(rows) - len(missing_in_db)
        
        if len(missing_in_db) > 0 or db_count_for_series != len(rows):
            report += f"## {series_name}\n"
            report += f"- **Excel'deki Figür Sayısı:** {len(rows)}\n"
            report += f"- **DB'ye Aktarılan Figür Sayısı:** {db_count_for_series}\n"
            
            if len(missing_in_db) > 0:
                report += "- **DB'de Eksik Olanlar (İçeri Aktarılmayanlar):**\n"
                for m in sorted(missing_in_db, key=lambda x: x['code']):
                    code = m['code']
                    name = m['name']
                    report += f"  - `{code}` - {name}\n"
                total_missing += len(missing_in_db)
            report += "\n"
        else:
            report += f"## {series_name}\n"
            report += f"- **Excel'deki Figür Sayısı:** {len(rows)}\n"
            report += f"- **DB'ye Aktarılan Figür Sayısı:** {db_count_for_series}\n"
            report += "- ✅ Tüm figürler DB'de mevcut.\n\n"
            
    # Find records in DB not in CSV
    extras_in_db = db_codes - csv_total_codes
    if len(extras_in_db) > 0:
        report += f"## ⚠️ Excel'de Olmayıp DB'de Fazladan Bulunanlar ({len(extras_in_db)} adet)\n"
        for code in sorted(extras_in_db):
            name = db_names.get(code, "Bilinmiyor")
            report += f"- `{code}` - {name}\n"
        report += "\n"
    
    report += f"---\n\n"
    report += f"- **Veritabanındaki (DB) Toplam Benzersiz Figür Kodu Sayısı:** {total_db}\n"
    report += f"- **Excel'deki (CSV) Toplam Benzersiz Figür Kodu Sayısı:** {total_csv}\n"
    report += f"- **Orijinal Kaynakta Olup DB'ye Giremeyen Toplam Eksik Figür Sayısı:** {total_missing}\n"
    
    with open(os.path.join(os.path.dirname(__file__), 'diff_report.md'), 'w') as f:
        f.write(report)
    print("Report generated at _scratch/diff_report.md")

if __name__ == '__main__':
    generate_report()
