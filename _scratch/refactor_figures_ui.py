import re

def fix_figures_ui(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Expand groups effect
    expand_effect = """  // Arama metni değiştiğinde veya figürler yüklendiğinde tüm grupları açık hale getir
  useEffect(() => {
    setExpandedGroups(Object.keys(groupedFigures));
  }, [figures, searchQuery]);"""
  
    content = content.replace("  const toggleGroup = (groupName: string) => {", expand_effect + "\n\n  const toggleGroup = (groupName: string) => {")

    # Accordion UI Header
    old_header = """                <div 
                  className="bg-[#fcfcfc] px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleGroup(groupName)}
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown size={20} className="text-gray-400" /> : <ChevronRight size={20} className="text-gray-400" />}
                    <h3 className="font-black text-gray-800 text-[13px] uppercase tracking-wider">{groupName} ({groupFigs.length})</h3>
                  </div>
                </div>"""
                
    new_header = """                <div 
                  onClick={() => toggleGroup(groupName)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                       <ChevronRight size={20} strokeWidth={2.5} />
                    </div>
                    <h2 className="font-black text-gray-900 tracking-tight text-[15px] uppercase">{groupName}</h2>
                    <span className="bg-gray-100 text-gray-600 font-bold px-2.5 py-0.5 rounded text-[10px] ml-2 tracking-widest">{groupFigs.length} Seri İçi Figür</span>
                  </div>
                </div>"""

    content = content.replace(old_header, new_header)

    # Table Header Styling matching Seriler
    old_thead = """                        <thead className="bg-white border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">"""
    new_thead = """                        <thead className="bg-[#fcfcfc] border-b border-gray-100 text-gray-500 font-black uppercase tracking-wider text-[10px]">"""
    content = content.replace(old_thead, new_thead)
    
    # Remove ChevronDown import if it's there
    content = content.replace("import { ChevronDown, ChevronRight", "import { ChevronRight")
    
    # Ensure transition-all duration-300 on the accordion parent
    old_parent = """              <div key={groupName} className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden">"""
    new_parent = """              <div key={groupName} className="bg-white border text-left border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-300">"""
    content = content.replace(old_parent, new_parent)

    with open(filepath, 'w') as f:
        f.write(content)

fix_figures_ui('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/page.tsx')
print("Figures UI updated.")
