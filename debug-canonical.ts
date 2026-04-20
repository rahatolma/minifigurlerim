import { getMinifigureFilterOptions } from './src/services/dal';
import { getCanonicalQueryString } from './src/utils/filterHelpers';

async function run() {
  const filterOptions = await getMinifigureFilterOptions();

  const roles = Array.from(new Set((filterOptions || []).map((f: any) => f.role).filter(Boolean)));
  const types = Array.from(new Set((filterOptions || []).map((f: any) => f.type).filter(Boolean)));
  const rarities = Array.from(new Set((filterOptions || []).map((f: any) => f.normalized_rarity).filter(Boolean)));

  const result = getCanonicalQueryString(
    { rarity: 'rare' },
    { roles, types, rarities }
  );

  console.log('rarities=', rarities);
  console.log('needsRedirect=', result.needsRedirect);
  console.log('canonicalQueryString=', result.canonicalQueryString);
}

run().catch(console.error);
