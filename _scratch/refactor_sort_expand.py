import re

def fix_figures_ui(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Expand/Collapse logic
    expand_effect = """  // Arama metni değiştiğinde veya figürler yüklendiğinde tüm grupları açık hale getir
  useEffect(() => {
    setExpandedGroups(Object.keys(groupedFigures));
  }, [figures, searchQuery]);"""
    
    # We will remove the auto-expand on [figures] maybe? Actually user wants manual buttons.
    # Let's keep auto-expand ONLY on search query, not on initial load if they want manual buttons?
    # No, keeping it on load is fine, they just want buttons to quickly override.
    
    # Add buttons to UI
    search_bar_block = """        <div className="flex items-center gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Koleksiyonda Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-4 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <Link href="/admin/figurler/yeni" className="bg-black text-white px-8 py-4 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Figür Ekle
          </Link>
        </div>"""
        
    new_search_bar_block = """        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full md:w-auto bg-gray-100 p-1 rounded-sm border border-gray-200">
            <button onClick={() => setExpandedGroups(Object.keys(groupedFigures))} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all">Tümünü Aç</button>
            <button onClick={() => setExpandedGroups([])} className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:shadow-sm rounded transition-all">Tümünü Kapat</button>
          </div>
          <input 
            type="text" 
            placeholder="Koleksiyonda Ara..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-sm px-4 py-3.5 text-[13px] font-bold focus:outline-none focus:ring-1 focus:ring-black w-full md:w-64"
          />
          <Link href="/admin/figurler/yeni" className="bg-black text-white px-8 py-3.5 rounded-sm shadow-md text-xs font-black tracking-widest flex items-center gap-2 hover:bg-gray-800 transition-all uppercase whitespace-nowrap">
            <Plus size={16} /> Yeni Figür
          </Link>
        </div>"""
    
    content = content.replace(search_bar_block, new_search_bar_block)

    # Sorting
    # Instead of Object.entries(groupedFigures).map directly, we sort the keys and groups.
    sort_block = """          {Object.entries(groupedFigures).map(([groupName, groupFigs]: [string, any]) => {"""
    
    new_sort_block = """          {Object.entries(groupedFigures)
            .sort((a, b) => {
               // 1. Seriye göre sıralama mantığı
               // Hem grubu hem de içindeki figürleri çıkış tarihine (release_year) göre süz
               const getYear = (figs: any[]) => {
                  const hasYear = figs.find(f => f.release_year);
                  return hasYear ? Number(hasYear.release_year) : 0;
               };
               
               const yearA = getYear(a[1]);
               const yearB = getYear(b[1]);
               
               // Eğer farklı yıllarsa yıllara göre azalan (yeniden eskiye) sırala
               if (yearA !== yearB) return yearB - yearA;
               
               // Aynı yıl veya yıl yoksa alfabetik seri ismi sıralaması
               return a[0].localeCompare(b[0]);
            })
            .map(([groupName, groupFigs]: [string, any]) => {"""
            
    content = content.replace(sort_block, new_sort_block)

    with open(filepath, 'w') as f:
        f.write(content)

fix_figures_ui('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/page.tsx')
print("Expand Buttons & Sort Injected.")
