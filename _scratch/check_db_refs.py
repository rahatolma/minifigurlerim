import urllib.request
import json
import ssl

SUPABASE_URL = "https://hmzgccvwgrgrgkudvljb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98"
HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def query_sql(sql_query):
    url = f"{SUPABASE_URL}/rest/v1/rpc/run_sql"
    req = urllib.request.Request(url, data=json.dumps({"sql_query": sql_query}).encode('utf-8'), headers={"Content-Type": "application/json", **HEADERS}, method='POST')
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.read().decode()
    except Exception as e:
        return str(e)

print(query_sql("SELECT proname, prosrc FROM pg_proc WHERE prosrc ILIKE '%figure_no%';"))
