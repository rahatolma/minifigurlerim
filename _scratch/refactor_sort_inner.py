import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Sort inner
    target = r"\{groupFigs\.map\(\(f: any\) => \{"
    rep = """{groupFigs
                            .sort((a: any, b: any) => {
                                // İçerideki figürleri öncelikle release_year + release_month'a göre, sonra figure_number'a göre sırala
                                const yearDiff = (b.release_year || 0) - (a.release_year || 0);
                                if (yearDiff !== 0) return yearDiff;
                                
                                const numA = parseInt(a.figure_number) || (a.name || "").localeCompare(b.name || "");
                                const numB = parseInt(b.figure_number) || 0;
                                
                                if (typeof numA === 'number' && typeof numB === 'number' && numA !== numB) {
                                   return numA - numB;
                                }
                                return (a.name || "").localeCompare(b.name || "");
                            })
                            .map((f: any) => {"""
                            
    content = content.replace(target, rep)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/page.tsx')
print("Inner Sorting Applied.")
