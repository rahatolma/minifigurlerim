import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Imports
    if "ArrowLeft" not in content:
        content = content.replace("import { ChevronRight, ImagePlus, Wand2, Loader2, Save } from 'lucide-react';", 
                                  "import { ChevronRight, ImagePlus, Wand2, Loader2, Save, ArrowLeft, ArrowRight } from 'lucide-react';")

    # 2. State definitions
    states = r"const \[isSubmitting, setIsSubmitting\] = useState\(false\);"
    new_states = """const [isSubmitting, setIsSubmitting] = useState(false);
  const [prevFigure, setPrevFigure] = useState<{id: string, name: string} | null>(null);
  const [nextFigure, setNextFigure] = useState<{id: string, name: string} | null>(null);"""
    
    if "const [prevFigure" not in content:
        content = content.replace(states, new_states)

    # 3. useEffect logic
    # Find setCustomAttributes(attrs);
    target_ue = r"setCustomAttributes\(attrs\);"
    new_ue = """setCustomAttributes(attrs);

        // Kardeş Figürleri (Sonraki/Önceki) Bulma Mantığı
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
        
    if "Kardeş Figürleri" not in content:
        content = content.replace(target_ue, new_ue)

    # 4. Header UI
    target_header = """          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/figurler" className="hover:text-black transition-colors">FİGÜRLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">FİGÜRÜ DÜZENLE</span>
          </div>
        </div>
      </div>"""
      
    new_header = """          <div className="flex items-center gap-3 text-[11px] font-black tracking-widest uppercase text-gray-500">
            <Link href="/admin/figurler" className="hover:text-black transition-colors">FİGÜRLER</Link>
            <ChevronRight size={14} />
            <span className="text-black">FİGÜRÜ DÜZENLE</span>
          </div>
          
          {/* İleri / Geri Navigasyon Butonları */}
          <div className="flex items-center gap-2">
            {prevFigure ? (
                <Link href={`/admin/figurler/${prevFigure.id}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm transition-colors text-[10px] font-black tracking-widest uppercase shadow-sm truncate max-w-[200px]" title={prevFigure.name}>
                    <ArrowLeft size={14} /> ÖNCEKİ
                </Link>
            ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-300 rounded-sm text-[10px] font-black tracking-widest uppercase cursor-not-allowed">
                    <ArrowLeft size={14} /> ÖNCEKİ
                </div>
            )}
            
            {nextFigure ? (
                <Link href={`/admin/figurler/${nextFigure.id}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm transition-colors text-[10px] font-black tracking-widest uppercase shadow-sm truncate max-w-[200px]" title={nextFigure.name}>
                    SONRAKİ <ArrowRight size={14} />
                </Link>
            ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-300 rounded-sm text-[10px] font-black tracking-widest uppercase cursor-not-allowed">
                    SONRAKİ <ArrowRight size={14} />
                </div>
            )}
          </div>
        </div>
      </div>"""
      
    if "İleri / Geri" not in content:
        content = content.replace(target_header, new_header)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
print("Navigation injected.")
