import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Update strict required fields and numeric validations
    old_validation_block = """    // 1. Strict Required Fields
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
    formData.piece_count = Number(formData.piece_count);"""

    strict_numeric = """    // 1. Strict Required Fields
    if (!formData.series_id) throw new Error("Doğrulama Hatası: 'series_id' (Seri) zorunludur.");
    if (!formData.figure_code || String(formData.figure_code).trim() === '') throw new Error("Doğrulama Hatası: 'figure_code' zorunludur.");
    if (!formData.figure_name || String(formData.figure_name).trim() === '') throw new Error("Doğrulama Hatası: 'figure_name' zorunludur.");
    if (!formData.slug_tr || String(formData.slug_tr).trim() === '') throw new Error("Doğrulama Hatası: 'slug_tr' zorunludur.");
    
    // 2. Strict Numeric Enforcement (Rule 1)
    const validateInteger = (val, fieldName) => {
        if (val === null || val === undefined || String(val).trim() === '') {
            throw new Error(`Doğrulama Hatası: '${fieldName}' boş bırakılamaz.`);
        }
        const parsed = Number(val);
        if (isNaN(parsed)) throw new Error(`Doğrulama Hatası: '${fieldName}' numerik bir değer olmalıdır.`);
        if (!Number.isInteger(parsed)) throw new Error(`Doğrulama Hatası: '${fieldName}' tam sayı (integer) olmalıdır.`);
        if (parsed < 0) throw new Error(`Doğrulama Hatası: '${fieldName}' negatif olamaz.`);
        return parsed;
    };
    
    formData.piece_count = validateInteger(formData.piece_count, 'piece_count');
    // figure_number'ı Number'a parse ediyoruz ama string olarak db'deki yapıya uygun string-int atıyoruz
    formData.figure_number = String(validateInteger(formData.figure_number, 'figure_number'));
    
    // 3. Normalization
    formData.figure_code = String(formData.figure_code).trim();
    formData.slug_tr = normalizeSlug(String(formData.slug_tr).trim());
    if (formData.slug_en) formData.slug_en = normalizeSlug(String(formData.slug_en).trim());"""

    # Do proper strict checks
    content = content.replace(old_validation_block, strict_numeric)

    # Wrap DB writes in try-catch for catch rules
    db_write_block = """    // 5. Veritabanı Yazma İşlemi
    if (isEdit && figureId) {
      const { data, error } = await adminClient
        .from('minifigures')
        .update(formData)
        .eq('id', figureId)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Figür bulunamadı veya güncellenemedi.');
      }
      return { success: true, message: 'Figür başarıyla güncellendi! 🎉', data: data[0] };
    } else {
      const { data, error } = await adminClient
        .from('minifigures')
        .insert([formData])
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Yeni figür oluşturulamadı.');
      }
      return { success: true, message: 'Yeni figür başarıyla eklendi! 🎉', data: data[0] };
    }"""

    db_write_guarded = """    // 5. Veritabanı Yazma İşlemi (DB Constraint Fallback Guard)
    try {
      if (isEdit && figureId) {
        const { data, error } = await adminClient
          .from('minifigures')
          .update(formData)
          .eq('id', figureId)
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Figür bulunamadı veya güncellenemedi.');
        return { success: true, message: 'Figür başarıyla güncellendi! 🎉', data: data[0] };
      } else {
        const { data, error } = await adminClient
          .from('minifigures')
          .insert([formData])
          .select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error('Yeni figür oluşturulamadı.');
        return { success: true, message: 'Yeni figür başarıyla eklendi! 🎉', data: data[0] };
      }
    } catch (dbErr: any) {
       // Graceful DB constraint handling (Rule 3)
       if (dbErr.code === '23505') {
           if (dbErr.message?.includes('slug')) {
              throw new Error("Veritabanı Reddi: Bu Seri içerisinde bu Slug (URL) zaten mevcut.");
           } else if (dbErr.message?.includes('code')) {
              throw new Error("Veritabanı Reddi: Bu Figür Kodu (figure_code) sistemde zaten kullanımda.");
           }
       }
       throw dbErr;
    }"""

    content = content.replace(db_write_block, db_write_guarded)

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/actions/figure.ts')
print("Server Action tamir edildi.")
