const env = import.meta.env as Record<string, string | undefined>;

const requiredEnv = (key: string): string => {
  const value = env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const restaurantId = requiredEnv("VITE_RESTAURANT_ID");

export const gaTrackingId = env.VITE_GA_TRACKING_ID?.trim() ?? "";
export const enableTracking =
  env.VITE_ENABLE_TRACKING !== undefined
    ? env.VITE_ENABLE_TRACKING !== "false"
    : Boolean(gaTrackingId);
export const useMockTracking = env.VITE_USE_MOCK_TRACKING === "true";

export const loggingEndpoint = env.VITE_LOGGING_ENDPOINT?.trim() ?? "";

export const adminEmails = (env.VITE_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export const getRequiredEnv = requiredEnv;
