'use server';

import 'server-only';
import { persistNormalizationLogs } from '@/services/dataGovernanceLogger';
import { NormalizationLog } from '@/services/inputNormalizers';
import { getAuthUserProfile } from '@/services/action_dal';

export async function logNormalizationEventsAction(logs: NormalizationLog[], entityType: string, source: string, entityId?: string | null) {
  let userId = null;
  try {
    const { user } = await getAuthUserProfile();
    if (user) userId = user.id;
  } catch (err) {
    console.error('[DataGovernance] Failed to fetch user profile for logger:', err);
  }

  // Execute the persistence logic on the server to keep service role keys secure
  return persistNormalizationLogs(logs, entityType, source, entityId, userId);
}
