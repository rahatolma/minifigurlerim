import re

def fix_ui(filepath, is_edit_page):
    with open(filepath, 'r') as f:
        content = f.read()

    # FIX BROKEN TOAST OVERLAP
    content = re.sub(
        r"if \(\!formData\.name \|\| \!formData\.series_id \|\| \!formData\.code .*?return;\n    }\n      toast\.error.*?return;\n    }",
        r"""if (!formData.name || !formData.series_id || !formData.code || (!formData.figure_number && formData.figure_number !== "0") || (!formData.piece_count && formData.piece_count !== "0")) {
      toast.error("Validasyon Hatası: 'Seri', 'Figür Adı', 'Figür Kodu', 'Figür Sıra No' ve 'Parça Sayısı' zorunludur.");
      return;
    }""",
        content,
        flags=re.DOTALL
    )

    # REMOVE SLUG AUTO-CALCULATION FOR EDIT PAGE (RULE 2)
    if is_edit_page:
        content = re.sub(r"const generatedSlug = slugify\(.*?\);", "const generatedSlug = formData.slug || formData.slug_tr;", content)

    # WIPE LEGACY FIELDS FROM FORM PAYLOAD (RULE 4)
    payload_wipe_pattern = r"const dbPayload = \{.*?series_id: formData\.series_id,"
    
    clean_payload = """const dbPayload = {
        series_id: formData.series_id,
        figure_name: formData.name,
        slug_tr: generatedSlug,
        figure_code: formData.code,"""
    
    content = re.sub(payload_wipe_pattern, clean_payload, content, flags=re.DOTALL)
    
    # Clean up redundant code and name inside payload
    content = re.sub(r"^\s*name: formData\.name,.*\n", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*slug: generatedSlug,.*\n", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*code: formData\.code,.*\n", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*figure_name: formData\.name,.*\n", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*figure_code: formData\.code,.*\n", "", content, flags=re.MULTILINE)
    content = re.sub(r"^\s*slug_tr: generatedSlug,.*\n", "", content, flags=re.MULTILINE)
    
    content = content.replace("const dbPayload = {", """const dbPayload = {
        series_id: formData.series_id,
        figure_name: formData.name,
        slug_tr: generatedSlug,
        figure_code: formData.code,""")
        
    content = re.sub(r"^\s*figure_no: formData\.figure_number,.*\n", "", content, flags=re.MULTILINE)
    
    with open(filepath, 'w') as f:
        f.write(content)
        
fix_ui('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/yeni/page.tsx', False)
fix_ui('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx', True)
print("Admin Payload and Rule implementations completed.")
