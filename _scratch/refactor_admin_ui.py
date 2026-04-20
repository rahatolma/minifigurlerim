import re

def fix_ui(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Client-side form validation injection
    old_validation = 'if (!formData.name || !formData.series_id) {'
    new_validation = '''if (!formData.name || !formData.series_id || !formData.code || (!formData.figure_number && formData.figure_number !== "0") || (!formData.piece_count && formData.piece_count !== "0")) {
      toast.error("Validasyon Hatası: 'Seri', 'Figür Adı', 'Figür Kodu', 'Figür Sıra No' ve 'Parça Sayısı' zorunludur.");
      return;
    }'''
    content = content.replace(old_validation, new_validation)

    # Server Payload Binding injection
    old_payload = 'slug: generatedSlug,'
    new_payload = 'slug: generatedSlug,\n        slug_tr: generatedSlug,'
    content = content.replace(old_payload, new_payload)

    old_payload = 'name: formData.name,'
    new_payload = 'name: formData.name,\n        figure_name: formData.name,'
    content = content.replace(old_payload, new_payload)

    old_payload = 'code: formData.code,'
    new_payload = 'code: formData.code,\n        figure_code: formData.code,'
    content = content.replace(old_payload, new_payload)

    # Make inputs required with red star
    # Code input
    content = content.replace('<label className="text-gray-900 block font-black">Figür Kodu</label>', '<label className="text-gray-900 block font-black">Figür Kodu <span className="text-[#D22B2B]">*</span></label>')
    # Figure Number input
    content = content.replace('<label className="text-gray-900 block font-black">Figür Sıra No</label>', '<label className="text-gray-900 block font-black">Figür Sıra No <span className="text-[#D22B2B]">*</span></label>')
    # Piece Count input
    content = content.replace('<label className="text-gray-900 block font-black">Parça Sayısı</label>', '<label className="text-gray-900 block font-black">Parça Sayısı <span className="text-[#D22B2B]">*</span></label>')

    with open(filepath, 'w') as f:
        f.write(content)
        
fix_ui('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/yeni/page.tsx')
fix_ui('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
print("Admin UI validated.")
