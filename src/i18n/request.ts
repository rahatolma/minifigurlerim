import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { getTaxonomyMessages } from '../services/taxonomy';

export default getRequestConfig(async ({ requestLocale }) => {
  // This typically corresponds to the `[locale]` segment
  let locale = await requestLocale;

  // Ensure that a valid locale is used
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  // Load static messages from JSON
  const messages = (await import(`../../messages/${locale}.json`)).default;
  
  // Load dynamic taxonomy messages from Database
  const dbTaxonomy = await getTaxonomyMessages(locale);
  
  // Merge dynamic DB translations into the static Taxonomy namespace
  messages.Taxonomy = {
    ...messages.Taxonomy, // Preserve any static taxonomy values (if any)
    Role: { ...(messages.Taxonomy?.Role || {}), ...dbTaxonomy.Role },
    Category: { ...(messages.Taxonomy?.Category || {}), ...dbTaxonomy.Category },
    Rarity: { ...(messages.Taxonomy?.Rarity || {}), ...dbTaxonomy.Rarity },
    ValueSignal: { ...(messages.Taxonomy?.ValueSignal || {}), ...dbTaxonomy.ValueSignal },
    DemandSignal: { ...(messages.Taxonomy?.DemandSignal || {}), ...dbTaxonomy.DemandSignal }
  };

  return {
    locale,
    messages
  };
});
