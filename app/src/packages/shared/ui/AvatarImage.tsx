import { memo } from 'react';
import { Image } from 'expo-image';
import type { BuildAvatarUrlOptions } from '../utils/avatars';
import { getAvatarPublicUrl } from '../utils/avatars';

export interface AvatarImageProps extends BuildAvatarUrlOptions {
  size?: number;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  borderRadius?: number;
  testID?: string;
}

const DEFAULT_SIZE = 48;

function AvatarImageBase(props: AvatarImageProps) {
  const {
    size = DEFAULT_SIZE,
    contentFit = 'cover',
    borderRadius = size / 2,
    testID,
  } = props;
  const uri = getAvatarPublicUrl(props);
  const effectiveSource = uri;
  const effectiveCachePolicy = 'memory-disk';

  return (
    <Image
      testID={testID}
      source={effectiveSource}
      style={{ width: size, height: size, borderRadius }}
      contentFit={contentFit}
      cachePolicy={effectiveCachePolicy as any}
      transition={100}
    />
  );
}

export const AvatarImage = memo(AvatarImageBase);

export async function prefetchAvatars(urls: string[]): Promise<void> {
  if (!urls || urls.length === 0) return;
  await Promise.all(urls.map(u => Image.prefetch(u)));
}

// Common prefetch set for current storage structure
export const COMMON_FEMALE_HOME_DAILY_LIFE: BuildAvatarUrlOptions[] = [
  {
    persona: 'adult-female',
    activity: 'home_daily_life',
    name: 'awakening',
    extension: 'webp',
  },
  {
    persona: 'adult-female',
    activity: 'home_daily_life',
    name: 'coffee_break',
    extension: 'webp',
  },
  {
    persona: 'adult-female',
    activity: 'health_wellbeing',
    name: 'sleep',
    extension: 'webp',
  },
  {
    persona: 'adult-female',
    activity: 'health_wellbeing',
    name: 'rest',
    extension: 'webp',
  },
  {
    persona: 'adult-female',
    activity: 'leisure_creativity',
    name: 'reflection',
    extension: 'webp',
  },
];
