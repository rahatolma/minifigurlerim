const fs = require('fs');

let code = fs.readFileSync('src/services/dal.ts', 'utf8');

const dtos = `
import { RawListFigureDTO } from '@/utils/figureMapper';

export interface SeriesDTO {
  id: string;
  name: string;
  title: string | null;
  title_en: string | null;
  slug_tr: string | null;
  slug: string | null;
  slug_en: string | null;
  series_no: string | null;
  category_main: string | null;
  category: string | null;
  manual_rarity: string | null;
  rarity: string | null;
  base_url: string | null;
  cover_image_url: string | null;
  figure_count: number | null;
  total_views: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface PostDTO {
  id: string;
  title: string;
  title_en: string | null;
  slug: string;
  cover_image_url: string | null;
  category: string | null;
  total_views: number | null;
  daily_views: number | null;
  min_read: number | null;
  created_at: string;
}

export interface FaqDTO {
  id: string;
  question: string;
  answer: string;
  question_en: string | null;
  answer_en: string | null;
  created_at: string;
}

export interface UserCollectionDTO {
  id: string;
  minifigures?: Partial<RawListFigureDTO> | null;
  user_id: string;
  created_at: string;
  condition: string | null;
  box_status: string | null;
  purchase_price: number | null;
  purchase_currency: string | null;
}
`;

if (!code.includes('export interface SeriesDTO')) {
  code = code.replace(/import { createClient } from '@\/utils\/supabase\/server';/, "import { createClient } from '@/utils/supabase/server';\n" + dtos);
}

// 1. Minifigures
code = code.replace(/export const getLatestFigures = cache[\s\S]*?return sortedData\.slice\(0, 12\);\s*\n\}\);/, (match) => {
    let m = match.replace(/return data as any;/g, '');
    m = m.replace(/const sortedData = \[\.\.\.data\]/, 'const sortedData = [...(data as unknown as RawListFigureDTO[])]');
    return m;
});
code = code.replace(/export const getAllMinifigures = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as RawListFigureDTO[];\n});');
});
code = code.replace(/export const getExploreFigures = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as RawListFigureDTO[];\n});');
});
code = code.replace(/export const getMinifigureListItems = cache[\s\S]*?return \{ data\: data(.*)?, count \};\s*\n\}\);/, (match) => {
    return match.replace(/return \{ data: data(.*)?, count \};\n\}\);/, 'return { data: data as unknown as RawListFigureDTO[], count };\n});');
});

// 2. Series
code = code.replace(/export const getLatestSeries = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as SeriesDTO[];\n});');
});
code = code.replace(/export const getAllSeries = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as SeriesDTO[];\n});');
});
code = code.replace(/export const getSeriesListItems = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as SeriesDTO[];\n});');
});
// Let's modify filter parameters of getSeriesListItems correctly
code = code.replace(/filters: \{ targetAudience\?: string; completionStatus\?: string \} = \{\},/, 'filters: { category?: string; series?: string } = {},');
code = code.replace(/\/\/ Base filters\s*query = query\.eq\('is_published', true\);/, "query = query.eq('is_published', true);\n    if (filters.category) query = query.eq('category', filters.category);\n    if (filters.series) query = query.eq('name', filters.series);");


// 3. Posts
code = code.replace(/export const getLatestPosts = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as PostDTO[];\n});');
});

// 4. FAQ
code = code.replace(/export const getFAQs = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as FaqDTO[];\n});');
});

// 5. UserCollection
code = code.replace(/export const getUserCollection = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    return match.replace(/return data(.*)?;\n\}\);/, 'return data as unknown as UserCollectionDTO[];\n});');
});

// 6. Filter Options
code = code.replace(/export const getMinifigureFilterOptions = cache[\s\S]*?return data(.*)?;\s*\n\}\);/, (match) => {
    let newFn = `export const getMinifigureFilterOptions = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('minifigures')
    .select('role, type, rarity')
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  const roles = Array.from(new Set(data.map((item: any) => item.role).filter(Boolean)));
  const types = Array.from(new Set(data.map((item: any) => item.type).filter(Boolean)));
  const rarities = Array.from(new Set(data.map((item: any) => item.rarity).filter(Boolean)));

  return { roles, types, rarities } as Record<string, string[]>;
});`;
    return newFn;
});


fs.writeFileSync('src/services/dal.ts', code);
