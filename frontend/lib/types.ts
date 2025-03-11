export type ApiResponseType<T = null> {
  success: boolean;
  message: string;
  data?: T;
  errors?: { field?: string; message: string }[];
}
