import urllib.request
import json

url = "https://hmzgccvwgrgrgkudvljb.supabase.co/rest/v1/minifigures?id=in.(9d537d49-030c-437a-8231-dc69a464e4b3,ff03a9ad-d003-42cb-8304-15e9e860127f,2d1da9df-f3ad-4d8d-b9fe-31af2ccacc07,3b0adf1a-5aca-4583-9187-4d5ef43750d0,a3e0887c-ea05-4b0d-8f8c-8f93ead3f55d,d9337c9d-930e-40cf-a9a0-4d521a0c997c)"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDU1NDc2NywiZXhwIjoyMDkwMTMwNzY3fQ.iCIZKpr17ieu7uJ3Kp8LVyPZhjkWXvqu4w_5p-a8f98",
    "Prefer": "return=representation"
}

req = urllib.request.Request(url, headers=headers, method='DELETE')
try:
    with urllib.request.urlopen(req) as response:
        print("DELETED", response.read().decode())
except Exception as e:
    print("Error:", e)
