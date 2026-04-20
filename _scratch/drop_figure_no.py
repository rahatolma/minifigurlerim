import urllib.request
import json

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"

sql = """
ALTER TABLE minifigures DROP COLUMN IF EXISTS figure_no;
"""

url = f"{SUPABASE_URL}/rest/v1/rpc/run_sql"
headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

req = urllib.request.Request(url, data=json.dumps({"sql_query": sql}).encode('utf-8'), headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode())
        print("SQL Dropped Successfully.")
except urllib.error.HTTPError as e:
    err_body = e.read().decode()
    print("HTTPError:", e.code, e.reason)
    print("Response body:", err_body)
except Exception as e:
    print(e)
