import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. State definitions
    states = r"const \[isSubmitting, setIsSubmitting\] = useState\(false\);"
    new_states = """const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevFigure, setPrevFigure] = useState<{id: string, name: string} | null>(null);
  const [nextFigure, setNextFigure] = useState<{id: string, name: string} | null>(null);"""
    
    if "const [prevFigure" not in content:
        content = content.replace(states, new_states)

    # 2. useEffect logic
    # Find setCustomAttributes(attrs);
    target_ue = r"setCustomAttributes\(attrs\);"
    new_ue = """setCustomAttributes(attrs);

        // Kardeş Figürleri (Sonraki/Önceki) Bulma Mantığı
        if (fig.series_id) {
            const { data: siblings } = await supabase.from('minifigures').select('id, figure_name, name, figure_number, figure_code').eq('series_id', fig.series_id);
            if (siblings && siblings.length > 0) {
                siblings.sort((a, b) => {
                    const numA = parseInt(String(a.figure_number || ''));
                    const numB = parseInt(String(b.figure_number || ''));
                    const isNumA = !isNaN(numA);
                    const isNumB = !isNaN(numB);
                    if (isNumA && isNumB) return numA - numB;
                    if (isNumA) return -1;
                    if (isNumB) return 1;
                    // Enforce string context for localeCompare in case legacy data has INTs in name column
                    const nameA = typeof a.figure_name === 'string' ? a.figure_name : typeof a.name === 'string' ? a.name : String(a.figure_name || a.name || "");
                    const nameB = typeof b.figure_name === 'string' ? b.figure_name : typeof b.name === 'string' ? b.name : String(b.figure_name || b.name || "");
                    return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
                });
                
                const currentIndex = siblings.findIndex(s => s.id === figureId);
                if (currentIndex > 0) {
                    setPrevFigure({ id: siblings[currentIndex - 1].id, name: String(siblings[currentIndex - 1].figure_name || siblings[currentIndex - 1].name || siblings[currentIndex - 1].figure_code || 'Önceki') });
                }
                if (currentIndex !== -1 && currentIndex < siblings.length - 1) {
                    setNextFigure({ id: siblings[currentIndex + 1].id, name: String(siblings[currentIndex + 1].figure_name || siblings[currentIndex + 1].name || siblings[currentIndex + 1].figure_code || 'Sonraki') });
                }
            }
        }"""
        
    if "Kardeş Figürleri" not in content:
        content = content.replace(target_ue, new_ue)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
print("Navigation Logic Recovered.")
