export const CUSTOM_EXPIRY_VALUE = -1;

export const EXPIRY_OPTIONS = [
  { label: "30 minutes", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "4 hours", value: 4 * 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
  { label: "7 days", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "Custom", value: CUSTOM_EXPIRY_VALUE },
] as const;

export const CUSTOM_EXPIRY_LIMITS = {
  minMs: 5 * 60 * 1000,
  maxMs: 30 * 24 * 60 * 60 * 1000,
} as const;

export const EXPIRY_UNITS = [
  { label: "Minutes", multiplier: 60 * 1000 },
  { label: "Hours", multiplier: 60 * 60 * 1000 },
  { label: "Days", multiplier: 24 * 60 * 60 * 1000 },
] as const;

export const MAX_SECRET_LENGTH = 50_000;

export const VIEW_OPTIONS = [
  { label: "1 view (burn after reading)", value: 1 },
  { label: "3 views", value: 3 },
  { label: "5 views", value: 5 },
  { label: "10 views", value: 10 },
] as const;
