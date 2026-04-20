import re

def fix_id_page(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # 1. Add slug_tr to formData state
    content = re.sub(
        r"name: '',",
        "name: '',\n    slug_tr: '',",
        content
    )

    # 2. Add slug_tr mapping in loadData
    content = re.sub(
        r"name: fig\.name \|\| '',",
        "name: fig.name || '',\n            slug_tr: fig.slug_tr || fig.slug || '',",
        content
    )

    # 3. Fix generatedSlug to use formData.slug_tr
    content = re.sub(
        r"const generatedSlug = formData\.slug \|\| formData\.slug_tr;",
        "const generatedSlug = formData.slug_tr;",
        content
    )

    # 4. Clean up dbPayload properly
    payload_wipe_pattern = r"const dbPayload = \{.*?custom_attributes: finalCustomAttr\n\s*\};"
    clean_payload = """const dbPayload = {
        series_id: formData.series_id,
        figure_name: formData.name,
        slug_tr: generatedSlug,
        figure_code: formData.code,
        description: formData.description,
        brand: formData.brand,
        category: selectedSeries?.category || '',
        series_name: selectedSeries?.title || '',
        series_no: selectedSeries?.series_no || '',
        figure_number: formData.figure_number,
        role: role,
        type: type,
        piece_count: pieceCount,
        body_material: formData.body_material,
        rarity: rarity,
        value_usd: valueUsd,
        min_price: formData.min_price ? parseFloat(formData.min_price.toString().replace(',', '.')) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price.toString().replace(',', '.')) : null,
        avg_price: formData.avg_price ? parseFloat(formData.avg_price.toString().replace(',', '.')) : null,
        rarity_score: parseInt(formData.rarity_score) || 1,
        series_score: parseInt(formData.series_score) || 1,
        view_count_30d: parseInt(formData.view_count_30d.toString()) || 0,
        collection_count_30d: parseInt(formData.collection_count_30d.toString()) || 0,
        favorite_count_30d: parseInt(formData.favorite_count_30d.toString()) || 0,
        rating_count: parseInt(formData.rating_count.toString()) || 0,
        release_month: formData.release_month,
        release_year: formData.release_year,
        images: uploadedImages.filter(Boolean),
        custom_attributes: finalCustomAttr
      };"""
    content = re.sub(payload_wipe_pattern, clean_payload, content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

def fix_yeni_page(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Clean up dbPayload properly
    payload_wipe_pattern = r"const dbPayload = \{.*?custom_attributes: finalCustomAttr\n\s*\};"
    clean_payload = """const dbPayload = {
        series_id: formData.series_id,
        figure_name: formData.name,
        slug_tr: generatedSlug,
        figure_code: formData.code,
        description: formData.description,
        brand: formData.brand,
        category: selectedSeries?.category || '',
        series_name: selectedSeries?.title || '',
        series_no: selectedSeries?.series_no || '',
        figure_number: formData.figure_number,
        role: role,
        type: type,
        piece_count: pieceCount,
        body_material: formData.body_material,
        rarity: rarity,
        value_usd: valueUsd,
        min_price: formData.min_price ? parseFloat(formData.min_price.toString().replace(',', '.')) : null,
        max_price: formData.max_price ? parseFloat(formData.max_price.toString().replace(',', '.')) : null,
        avg_price: formData.avg_price ? parseFloat(formData.avg_price.toString().replace(',', '.')) : null,
        rarity_score: parseInt(formData.rarity_score) || 1,
        series_score: parseInt(formData.series_score) || 1,
        view_count_30d: parseInt(formData.view_count_30d.toString()) || 0,
        collection_count_30d: parseInt(formData.collection_count_30d.toString()) || 0,
        favorite_count_30d: parseInt(formData.favorite_count_30d.toString()) || 0,
        rating_count: parseInt(formData.rating_count.toString()) || 0,
        release_month: formData.release_month,
        release_year: formData.release_year,
        images: uploadedImages.filter(Boolean),
        custom_attributes: finalCustomAttr
      };"""
    content = re.sub(payload_wipe_pattern, clean_payload, content, flags=re.DOTALL)

    with open(filepath, 'w') as f:
        f.write(content)

fix_id_page('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/[id]/page.tsx')
fix_yeni_page('/Users/Gungor/Documents/GitHub/minifigurlerim/src/app/admin/(protected)/figurler/yeni/page.tsx')
print("Pages Fixed.")
