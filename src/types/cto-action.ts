export type AdminActionResponse<T = any> = 
  | { success: true; message: string; data?: T }
  | { success: false; error: string };
