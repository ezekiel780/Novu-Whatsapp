export const successResponse = <T>(data: T, message = 'Success') => ({
  success: true,
  message,
  data,
  timestamp: new Date().toISOString(),
});

export const errorResponse = (message: string, code?: string) => ({
  success: false,
  message,
  code,
  timestamp: new Date().toISOString(),
});
