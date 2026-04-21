import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Change /auth/callback to /api/auth/callback
    content = content.replace("redirectTo: `${window.location.origin}/auth/callback`", "redirectTo: `${window.location.origin}/api/auth/callback`")

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/login/page.tsx')
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/[locale]/(auth)/login/actions.ts') # If it exists there too
print("Auth redirect changed to /api/auth/callback")
