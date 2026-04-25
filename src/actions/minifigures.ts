'use server';

import { getMinifigureListItems } from '@/services/dal';
import { mapFigureForCard, RawListFigureDTO } from '@/utils/figureMapper';

export async function fetchMoreMinifigures(
  filters: { series?: string; role?: string; type?: string; rarity?: string },
  page: number,
  limit: number = 36,
  locale: string = 'tr'
) {
  const offset = (page - 1) * limit;
  const { data } = await getMinifigureListItems(filters, limit, offset);
  
  if (!data) return [];
  
  // We map directly on the server so the payload exactly matches FigureCardData, reducing bandwidth.
  return data
    .map((rawFig: any) => mapFigureForCard(rawFig, locale))
    .filter((fig: any): fig is NonNullable<typeof fig> => fig !== null);
}
