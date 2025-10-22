export type AvatarPersona =
  | 'adult-male'
  | 'adult-female'
  | 'child-male'
  | 'child-female'
  | (string & {});

export interface BuildAvatarPathOptions {
  version?: string; // optional, if omitted it's not included in the path
  series?: string; // optional, if omitted it's not included in the path
  persona: AvatarPersona;
  activity: string;
  subActivity?: string;
  // If provided, this is the file base name (e.g., 'awakening').
  // If omitted, falls back to subActivity or activity as the base.
  name?: string;
  variant?: string; // optional suffix after name (e.g., name-variant.webp)
  extension?: 'png' | 'webp' | 'jpg';
}

export const buildAvatarPath = (options: BuildAvatarPathOptions): string => {
  const {
    version,
    series,
    persona,
    activity,
    subActivity,
    name,
    variant,
    extension = 'webp',
  } = options;

  const safe = (value: string) => encodeURIComponent(value.toLowerCase());

  const parts: string[] = [];
  if (version) parts.push(version);
  if (series) parts.push(series);
  parts.push(safe(persona));
  parts.push(safe(activity));

  if (subActivity) {
    parts.push(safe(subActivity));
  }

  const base = name
    ? safe(name)
    : subActivity
      ? safe(subActivity)
      : safe(activity);
  const fileName = variant
    ? `${base}-${safe(variant)}.${extension}`
    : `${base}.${extension}`;

  return `${parts.join('/')}/${fileName}`;
};

export interface BuildAvatarUrlOptions extends BuildAvatarPathOptions {
  bucket?: string;
}

// Dev-only stable cache-buster to force a refresh without changing code in many places.
let DEV_IMAGE_CB: string | null = null;
if (__DEV__) {
  try {
    // Allow external override before module load (e.g., globalThis.__COCAL_DEV_IMG_CB__)
    const preset = (globalThis as any)?.__COCAL_DEV_IMG_CB__;
    DEV_IMAGE_CB =
      typeof preset === 'string' && preset.length > 0
        ? preset
        : String(Date.now());
  } catch {
    DEV_IMAGE_CB = String(Date.now());
  }
}

export const setDevImageCacheBuster = (token?: string) => {
  if (!__DEV__) return;
  DEV_IMAGE_CB = token && token.length > 0 ? token : String(Date.now());
};

export const getAvatarPublicUrl = (options: BuildAvatarUrlOptions): string => {
  const { bucket = 'avatars' } = options;
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return '';
  }
  const path = buildAvatarPath(options);
  const base = `${supabaseUrl}/storage/v1/object/public/${encodeURIComponent(bucket)}/${path}`;
  if (__DEV__ && DEV_IMAGE_CB) {
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}cb=${encodeURIComponent(DEV_IMAGE_CB)}`;
  }
  return base;
};

export interface AvatarDescriptor extends BuildAvatarUrlOptions {}

export const buildAvatarUrls = (avatars: AvatarDescriptor[]): string[] => {
  return avatars
    .map(a => getAvatarPublicUrl(a))
    .filter((u): u is string => Boolean(u));
};
