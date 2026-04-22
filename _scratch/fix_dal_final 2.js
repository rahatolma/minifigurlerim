const fs = require('fs');
require('child_process').execSync('git restore src/services/dal.ts src/app/\\[locale\\]/\\(public\\)/figurler/page.tsx src/app/\\[locale\\]/\\(public\\)/seriler/page.tsx');

let dtos = `
import { RawListFigureDTO } from '@/utils/figureMapper';

export interface SeriesDTO {
  id: string;
  name?: string;
  title?: string;
  title_en?: string;
  slug_tr?: string;
  slug?: string;
  slug_en?: string;
  series_no?: string;
  category_main?: string;
  category?: string;
  manual_rarity?: string;
  rarity?: string;
  base_url?: string;
  cover_image_url?: string;
  figure_count?: number;
  total_views?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
  description_en?: string;
  is_active?: boolean;
  is_published?: boolean;
  release_year?: string | number;
  blocks?: any;
  [key: string]: any;
}

export type PostDTO = Record<string, any>;
export type FaqDTO = Record<string, any>;
export type UserCollectionDTO = Record<string, any>;
`;

let d = fs.readFileSync('src/services/dal.ts', 'utf8');
d = d.replace("import { createClient } from '@/utils/supabase/server';", "import { createClient } from '@/utils/supabase/server';\n" + dtos);

d = d.replace(/export const getLatestFigures = cache\(async \(\) => \{/g, 'export const getLatestFigures = cache(async (): Promise<RawListFigureDTO[]> => {');
d = d.replace(/export const getLatestSeries = cache\(async \(\) => \{/g, 'export const getLatestSeries = cache(async (): Promise<SeriesDTO[]> => {');
d = d.replace(/export const getAllSeries = cache\(async \(\) => \{/g, 'export const getAllSeries = cache(async (): Promise<SeriesDTO[]> => {');
d = d.replace(/export const getLatestPosts = cache\(async \(\) => \{/g, 'export const getLatestPosts = cache(async (): Promise<PostDTO[]> => {');
d = d.replace(/export const getFAQs = cache\(async \(\) => \{/g, 'export const getFAQs = cache(async (): Promise<FaqDTO[]> => {');
d = d.replace(/export const getAllMinifigures = cache\(async \(\) => \{/g, 'export const getAllMinifigures = cache(async (): Promise<RawListFigureDTO[]> => {');

// Fix parameterized methods
d = d.replace(/export const getMinifigureListItems = cache\(async \([\s\S]*?\) => \{/, (match) => match.replace(') => {', '): Promise<{ data: RawListFigureDTO[], count: number | null }> => {'));
d = d.replace(/export const getSeriesListItems = cache\(async \([\s\S]*?\) => \{/, (match) => {
    let m = match.replace(/targetAudience/g, 'category').replace(/completionStatus/g, 'series');
    return m.replace(') => {', '): Promise<SeriesDTO[]> => {');
});
d = d.replace(/export const getUserCollection = cache\(async \([\s\S]*?\) => \{/, (match) => match.replace(') => {', '): Promise<UserCollectionDTO[]> => {'));
d = d.replace(/export const getExploreFigures = cache\(async \([\s\S]*?\) => \{/, (match) => match.replace(') => {', '): Promise<RawListFigureDTO[]> => {'));

// Fix return casting to be generic enough not to throw internal type errors
d = d.split(/String\('/g).join('\'');
d = d.split(/\'\)\)/g).join('\')');
d = d.replace(/, \{ count: 'exact' \}\);/g, ', { count: "exact" });');
d = d.replace(/\), \{ count: "exact" \}\);/g, ', { count: "exact" });');

// Ensure sorted data is correctly mapped as `data as any` since `data` was any natively internally
d = d.replace(/const sortedData = \[\.\.\.data\]/g, 'const sortedData = [...(data as any[])]');

// Fix filter condition property
d = d.replace(/\/\/ Base filters\s*query = query\.eq\('is_published', true\);/, "query = query.eq('is_published', true);\n    if (filters.category) query = query.eq('category', filters.category);\n    if (filters.series) query = query.eq('name', filters.series);");

fs.writeFileSync('src/services/dal.ts', d);

// Fix getExploreFigures argument inside exploreAggregation.ts
let exp = fs.readFileSync('src/services/exploreAggregation.ts', 'utf8');
if(exp.includes('getExploreFigures(24)')) {
   exp = exp.replace(/rawData = await getExploreFigures\(24\)/, 'rawData = await getExploreFigures()');
   fs.writeFileSync('src/services/exploreAggregation.ts', exp);
}

