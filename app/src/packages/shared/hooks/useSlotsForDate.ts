import { useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import {
  useSlotsCache,
  ensureSlotsLoaded,
  prefetchSlidingWindow,
} from '../store/slots-store';

export const useSlotsForDate = (date: string) => {
  const [{ supabase, user }] = useAuthStore();
  const [cache] = useSlotsCache.cache();
  const [loading] = useSlotsCache.loading();

  const slots = cache[date] || [];

  useEffect(() => {
    if (user) {
      ensureSlotsLoaded(date, supabase, user.id);
      prefetchSlidingWindow(date, supabase, user.id);
    }
  }, [date, user]); 

  return {
    slots,
    loading,
  };
};
