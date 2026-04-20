import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the save action and log it
    target = r"const result = await saveFigureData\(dbPayload, true, figureId\);"
    rep = "console.log('--- DB PAYLOAD ---', dbPayload);\n      const result = await saveFigureData(dbPayload, true, figureId);"
    content = re.sub(target, rep, content)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/yeni/page.tsx')
print("Console Logs Injected.")
