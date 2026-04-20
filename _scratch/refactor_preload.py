import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Fix name canonical preload
    target = r"name: fig\.name \|\| '',"
    rep = "name: fig.figure_name || fig.name || '',"
    content = re.sub(target, rep, content)

    # Fix code canonical preload
    target2 = r"code: fig\.code \|\| '',"
    rep2 = "code: fig.figure_code || fig.code || '',"
    content = re.sub(target2, rep2, content)

    # Fix figure_number canonical preload, ensuring string conversion properly
    target3 = r"figure_number: fig\.figure_number \|\| '',"
    rep3 = "figure_number: fig.figure_number?.toString() || fig.figure_no?.toString() || '',"
    content = re.sub(target3, rep3, content)
    
    # Fix slug_tr binding
    target_slug = r"slug_tr: fig\.slug_tr \|\| fig\.slug \|\| '',"
    rep_slug = "slug_tr: fig.slug_tr || fig.slug || '',"
    # Actually already correct, just making sure it's intact.

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
print("Preload Mappings Restored.")
