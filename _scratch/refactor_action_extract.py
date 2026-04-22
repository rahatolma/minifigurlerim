import re

def process_action(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add import
    import_stmt = "import { validateNamingConvention, normalizeSlug } from '@/utils/validations/naming-standards';"
    new_import = "import { validateNamingConvention, normalizeSlug } from '@/utils/validations/naming-standards';\nimport { validateInteger } from '@/utils/validations/numeric';"
    content = content.replace(import_stmt, new_import)

    # Remove inline validateInteger definition
    inline_func = """    const validateInteger = (val, fieldName) => {
        if (val === null || val === undefined || String(val).trim() === '') {
            throw new Error(`Doğrulama Hatası: '${fieldName}' boş bırakılamaz.`);
        }
        const parsed = Number(val);
        if (isNaN(parsed)) throw new Error(`Doğrulama Hatası: '${fieldName}' numerik bir değer olmalıdır.`);
        if (!Number.isInteger(parsed)) throw new Error(`Doğrulama Hatası: '${fieldName}' tam sayı (integer) olmalıdır.`);
        if (parsed < 0) throw new Error(`Doğrulama Hatası: '${fieldName}' negatif olamaz.`);
        return parsed;
    };
    """
    
    content = content.replace(inline_func, "")

    with open(filepath, 'w') as f:
        f.write(content)
        
process_action('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/actions/figure.ts')
print("Extracted validateInteger.")
