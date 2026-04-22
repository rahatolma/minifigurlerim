import urllib.request
import json
import urllib.parse

def test_slug(slug, locale):
    # Simulating what getMinifigureBySlug does
    base_url = "https://hmzgccvwgrgrgkudvljb.supabase.co/rest/v1/minifigures?select=id,name,slug,slug_tr,slug_en"
    
    if locale == 'en':
        or_cond = f"slug_en.eq.{slug},slug.eq.{slug}"
    elif locale == 'tr':
        or_cond = f"slug_tr.eq.{slug},slug.eq.{slug}"
    else:
        or_cond = f"slug.eq.{slug},slug_tr.eq.{slug},slug_en.eq.{slug}"
        
    url = f"{base_url}&or=({or_cond})&order=is_published.desc,created_at.desc&limit=1"
    
    headers = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtemdjY3Z3Z3JncmdrdWR2bGpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQ3NjcsImV4cCI6MjA5MDEzMDc2N30.YLX-zCu3g2ZixLWbdArnOKGxjlTbJRDQTi46zCiPJtE"
    }

    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            found = data[0]['name'] if len(data) > 0 else "NOT_FOUND [404]"
            print(f"[{locale.upper()}] slug: {slug} --> {found}")
    except Exception as e:
        print(f"Error for {slug}:", e)

test_slug('fencer', 'tr')
test_slug('fencer', 'en')
test_slug('baby-penguin', 'tr')
test_slug('baby-penguin', 'en')
test_slug('fencer-zombie', 'tr')
test_slug('baby-penguin-zom2', 'en')

