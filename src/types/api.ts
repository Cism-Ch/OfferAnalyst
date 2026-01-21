export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
  meta?: { timestamp: number };
}
