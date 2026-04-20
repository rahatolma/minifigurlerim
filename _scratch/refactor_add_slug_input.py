import re

def add_slug_input(filepath, is_edit):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add slug_tr input below figure name
    figure_name_block = """                {/* FİGÜR ADI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Adı <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>"""

    if is_edit:
        slug_input_block = """                {/* FİGÜR ADI */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors"><label className="text-gray-900 block font-black">Figür Adı <span className="text-[#D22B2B]">*</span></label></div>
                    <div className="w-2/3 py-2"><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold" /></div>
                </div>

                {/* URL SLUG (TR) */}
                <div className="flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors group">
                    <div className="w-1/3 py-4 pr-4 pl-6 border-l-2 border-transparent group-hover:border-black transition-colors">
                        <label className="text-gray-900 block font-black">URL Uzantısı (Slug) <span className="text-[#D22B2B]">*</span></label>
                        <span className="block text-[10px] text-gray-500 font-medium">Manuel düzenlenebilir</span>
                    </div>
                    <div className="w-2/3 py-2">
                        <input name="slug_tr" type="text" value={formData.slug_tr} onChange={handleChange} required className="w-full bg-transparent px-3 py-2 focus:outline-none text-black font-semibold text-blue-600" />
                    </div>
                </div>"""
        content = content.replace(figure_name_block, slug_input_block)
    
    with open(filepath, 'w') as f:
        f.write(content)

add_slug_input('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx', True)
print("Slug input injected.")
