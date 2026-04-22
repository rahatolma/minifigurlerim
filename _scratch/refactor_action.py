import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the injection point after Naming Convention Enforcement
    injection_point = "const adminClient = createAdminClient();"
    
    strict_validation = """
    // --- PHASE 2: ADMIN VALIDATION CONTRACT ---
    // 1. Strict Required Fields
    if (!formData.series_id) throw new Error("Doğrulama Hatası: 'series_id' (Seri) zorunludur.");
    if (!formData.figure_code || formData.figure_code.trim() === '') throw new Error("Doğrulama Hatası: 'figure_code' zorunludur.");
    if (!formData.figure_name || formData.figure_name.trim() === '') throw new Error("Doğrulama Hatası: 'figure_name' zorunludur.");
    if (!formData.slug_tr || formData.slug_tr.trim() === '') throw new Error("Doğrulama Hatası: 'slug_tr' zorunludur.");
    
    // 2. Numeric Validations
    if (!formData.figure_number || isNaN(Number(formData.figure_number))) throw new Error("Doğrulama Hatası: 'figure_number' geçerli bir sayı olmalıdır.");
    if (!formData.piece_count || isNaN(Number(formData.piece_count))) throw new Error("Doğrulama Hatası: 'piece_count' (Parça Sayısı) geçerli bir sayı olmalıdır.");
    
    // 3. Normalization
    formData.figure_code = formData.figure_code.trim();
    formData.slug_tr = normalizeSlug(formData.slug_tr.trim());
    if (formData.slug_en) formData.slug_en = normalizeSlug(formData.slug_en.trim());
    formData.figure_number = formData.figure_number.toString().trim();
    formData.piece_count = Number(formData.piece_count);

    // 4. Legacy Mirroring (Source of Truth -> Fallback)
    // Bu sayede Front-End formunda gereksiz alan yollanmasa bile arka kapıda hizalanır.
    formData.slug = formData.slug_tr;
    formData.name = formData.figure_name;
    formData.code = formData.figure_code;
    formData.figure_no = formData.figure_number;

    const adminClient = createAdminClient();

    // 5. Duplicate Guard: figure_code (GLOBAL)
    let codeQuery = adminClient.from('minifigures').select('id').eq('figure_code', formData.figure_code);
    if (isEdit && figureId) codeQuery = codeQuery.neq('id', figureId);
    const { data: existingCode } = await codeQuery;
    if (existingCode && existingCode.length > 0) {
        throw new Error(`CRITICAL: '${formData.figure_code}' kodlu figür zaten var! Duplicate figure_code oluşturulamaz.`);
    }

    // 6. Duplicate Guard: slug_tr (SERIES CONTEXT)
    let slugQuery = adminClient.from('minifigures').select('id')
        .eq('slug_tr', formData.slug_tr)
        .eq('series_id', formData.series_id);
    if (isEdit && figureId) slugQuery = slugQuery.neq('id', figureId);
    const { data: existingSlugInSeries } = await slugQuery;
    if (existingSlugInSeries && existingSlugInSeries.length > 0) {
        throw new Error(`CRITICAL: Bu seri içerisinde '${formData.slug_tr}' URL'si zaten kullanımda!`);
    }
"""

    # We must replace the old duplicate slug check block completely.
    # The old block:
    old_slug_check_regex = re.compile(r"// 4\. Duplicate Slug Check \(Guard\).*?}\s*}", re.DOTALL)
    content = old_slug_check_regex.sub("", content)

    # We also remove the old explicit legacy slug normalizations and add our own suite
    old_slug_norm_regex = re.compile(r"// Slug mekanik standartlaması.*?}", re.DOTALL)
    content = old_slug_norm_regex.sub("", content)

    content = content.replace("const adminClient = createAdminClient();", strict_validation)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/actions/figure.ts')
print("Action validasyonu uygulandı.")
