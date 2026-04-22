import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Wrap siblings logic in try/catch safely
    target_ue = """        // Kardeş Figürleri (Sonraki/Önceki) Bulma Mantığı
        if (fig.series_id) {
            const { data: siblings } = await supabase.from('minifigures').select('id, figure_name, name, figure_number, figure_code').eq('series_id', fig.series_id);
            if (siblings && siblings.length > 0) {
                siblings.sort((a, b) => {
                    const numA = parseInt(a.figure_number || '');
                    const numB = parseInt(b.figure_number || '');
                    const isNumA = !isNaN(numA);
                    const isNumB = !isNaN(numB);
                    if (isNumA && isNumB) return numA - numB;
                    if (isNumA) return -1;
                    if (isNumB) return 1;
                    return (a.figure_name || a.name || "").localeCompare(b.figure_name || b.name || "", undefined, { numeric: true, sensitivity: 'base' });
                });
                const currentIndex = siblings.findIndex(s => s.id === figureId);
                if (currentIndex > 0) {
                    setPrevFigure({ id: siblings[currentIndex - 1].id, name: siblings[currentIndex - 1].figure_name || siblings[currentIndex - 1].name || siblings[currentIndex - 1].figure_code });
                }
                if (currentIndex !== -1 && currentIndex < siblings.length - 1) {
                    setNextFigure({ id: siblings[currentIndex + 1].id, name: siblings[currentIndex + 1].figure_name || siblings[currentIndex + 1].name || siblings[currentIndex + 1].figure_code });
                }
            }
        }"""
        
    safe_ue = """        // Kardeş Figürleri (Sonraki/Önceki) Bulma Mantığı
        try {
            if (fig.series_id) {
                const { data: siblings, error: sibError } = await supabase.from('minifigures').select('id, figure_name, name, figure_number, figure_code').eq('series_id', fig.series_id);
                if (!sibError && siblings && siblings.length > 0) {
                    siblings.sort((a, b) => {
                        const numA = parseInt(String(a.figure_number || ''));
                        const numB = parseInt(String(b.figure_number || ''));
                        const isNumA = !isNaN(numA);
                        const isNumB = !isNaN(numB);
                        if (isNumA && isNumB) return numA - numB;
                        if (isNumA) return -1;
                        if (isNumB) return 1;
                        return String(a.figure_name || a.name || "").localeCompare(String(b.figure_name || b.name || ""), undefined, { numeric: true, sensitivity: 'base' });
                    });
                    const currentIndex = siblings.findIndex(s => s.id === figureId);
                    if (currentIndex > 0) {
                        setPrevFigure({ id: siblings[currentIndex - 1].id, name: String(siblings[currentIndex - 1].figure_name || siblings[currentIndex - 1].name || siblings[currentIndex - 1].figure_code || 'Önceki Figür') });
                    }
                    if (currentIndex !== -1 && currentIndex < siblings.length - 1) {
                        setNextFigure({ id: siblings[currentIndex + 1].id, name: String(siblings[currentIndex + 1].figure_name || siblings[currentIndex + 1].name || siblings[currentIndex + 1].figure_code || 'Sonraki Figür') });
                    }
                }
            }
        } catch (siblingErr) {
            console.error('Sibling fetch error:', siblingErr);
        }"""
        
    content = content.replace(target_ue, safe_ue)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
print("Navigation Try/Catch Added.")
