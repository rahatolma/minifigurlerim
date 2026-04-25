import { createClient } from '@supabase/supabase-js';
import { cache } from 'react';

// Create a Supabase client with the anon key for public data.
// Since taxonomy_terms public select is enabled for is_active=true, we don't need service role.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cache the database call for the lifetime of the request (and next.js fetch caching applies)
export const fetchTaxonomyTerms = cache(async () => {
  const { data, error } = await supabase
    .from('taxonomy_terms')
    .select('type, key, label_tr, label_en')
    .eq('is_active', true);

  if (error || !data) {
    console.error('Failed to fetch taxonomy terms:', error);
    return [];
  }

  return data;
});

export async function getTaxonomyMessages(locale: string) {
  const terms = await fetchTaxonomyTerms();
  
  const taxonomyMessages: any = {
    Role: {},
    Category: {},
    Rarity: {},
    ValueSignal: {},
    DemandSignal: {}
  };

  terms.forEach(term => {
    // Map the database 'type' to the dictionary namespace
    let namespace = '';
    if (term.type === 'figure_role') namespace = 'Role';
    else if (term.type === 'series_category') namespace = 'Category';
    else if (term.type === 'rarity') namespace = 'Rarity';
    else if (term.type === 'value_signal') namespace = 'ValueSignal';
    else if (term.type === 'demand_signal') namespace = 'DemandSignal';

    if (namespace) {
      // If locale is EN and label_en exists, use it. Otherwise fallback to label_tr.
      const label = (locale === 'en' && term.label_en) ? term.label_en : term.label_tr;
      taxonomyMessages[namespace][term.key] = label;
    }
  });

  return taxonomyMessages;
}
