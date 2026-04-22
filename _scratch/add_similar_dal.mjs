import fs from 'fs';
const dalPath = 'src/services/action_dal.ts';
let dalContent = fs.readFileSync(dalPath, 'utf8');
if (!dalContent.includes('getSimilarFiguresDal')) {
dalContent += `\nexport const getSimilarFiguresDal = async (seriesId: string, currentFigureId: string, limit: number = 4) => {
  const supabaseAdmin = getAdminClient();
  const { data, error } = await supabaseAdmin
    .from('minifigures')
    .select('id, name, slug_tr, slug_en, series_name, rarity_level, thumbnail_url, images, series(slug_tr, slug_en)')
    .eq('series_id', seriesId)
    .not('id', 'eq', currentFigureId)
    .limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
};\n`;
fs.writeFileSync(dalPath, dalContent);
}
