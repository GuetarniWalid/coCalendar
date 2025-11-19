import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SLOT_TITLE_MIN_DISTANCE_FROM_SAFE_AREA, SLOT_FORM_PADDING_TOP } from '../constants/layout';

export const useKeyboardLayoutValues = (
  navHeight: number,
  headerHeight: number,
  topRowHeight: number,
) => {
  const insets = useSafeAreaInsets();

  const totalBottomNavHeight = navHeight + insets.bottom;
  const maxTranslation = SLOT_FORM_PADDING_TOP + headerHeight + topRowHeight - SLOT_TITLE_MIN_DISTANCE_FROM_SAFE_AREA;

  return {
    totalBottomNavHeight,
    maxTranslation,
    insets,
  };
};
