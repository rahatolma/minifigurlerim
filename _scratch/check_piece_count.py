import urllib.request
import json
url = "https://hmzgccvwgrgrgkudvljb.supabase.co/rest/v1/minifigures?select=*&limit=1"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE"
}
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
        print(list(data[0].keys()))
except Exception as e:
    print("Error:", e)
