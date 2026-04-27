export type AdminActionResponse<T = any> = 
  | { success: true; message: string; data?: T; normalizationWarnings?: string[] }
  | { success: false; error: string };
