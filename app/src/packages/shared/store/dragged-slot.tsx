import { createContext, useContext, ReactNode, useState } from 'react';
import { SharedValue, useDerivedValue, useSharedValue } from 'react-native-reanimated';

// Create context for dragged slot shared values
interface DraggedSlotContextType {
  draggedSlotX: SharedValue<number>;
  draggedSlotY: SharedValue<number>;
  draggedSlotOffsetX: SharedValue<number>;
  draggedSlotOffsetY: SharedValue<number>;
  draggedSlotHeight: SharedValue<number>;
  draggedSlotMiddleY: SharedValue<number>;
  draggedSlotZone: SharedValue<'top' | 'middle' | 'bottom'>;
  draggedSlotHorizontalZone: SharedValue<'left' | 'middle' | 'right'>;
  draggedSlotIndex: SharedValue<number | null>;
  dayPageScrollY: SharedValue<number>;
  currentDayIndex: SharedValue<number>;
  setFlatListScrollToIndex: (callback: (targetIndex: number) => void) => void;
  flatListScrollToIndex: (targetIndex: number) => void;
  draggedSlotIndexRN: number | null;
  setDraggedSlotIndexRN: (value: number | null) => void;
  portalEnabled: boolean;
  setPortalEnabled: (value: boolean) => void;
  verticalConstraintEnabled: SharedValue<boolean>;
  draggedSlotInitialOffsetY: SharedValue<number>;
  isSnapped: SharedValue<boolean>;
  isBreakingSnap: SharedValue<boolean>;
  dragDirection: SharedValue<'vertical' | 'horizontal' | null>;
  lockedOffsetY: SharedValue<number>;
}

const DraggedSlotContext = createContext<DraggedSlotContextType | null>(null);

export const useDraggedSlotContext = () => {
  const context = useContext(DraggedSlotContext);
  if (!context) {
    throw new Error('useDraggedSlotContext must be used within DraggedSlotProvider');
  }
  return context;
};

// Provider component
interface DraggedSlotProviderProps {
  children: ReactNode;
}

export const DraggedSlotProvider = ({ children }: DraggedSlotProviderProps) => {
  // Create shared values for dragged slot
  const draggedSlotX = useSharedValue(0);
  const draggedSlotY = useSharedValue(0);
  const draggedSlotOffsetX = useSharedValue(0);
  const draggedSlotOffsetY = useSharedValue(0);
  const draggedSlotHeight = useSharedValue(0);
  const draggedSlotIndex = useSharedValue<number | null>(null);
  const draggedSlotMiddleY = useDerivedValue(() => {
    return draggedSlotY.value + draggedSlotOffsetY.value + draggedSlotHeight.value / 2;
  });
  const draggedSlotZone = useSharedValue<'top' | 'middle' | 'bottom'>('middle');
  const draggedSlotHorizontalZone = useSharedValue<'left' | 'middle' | 'right'>('middle');
  const dayPageScrollY = useSharedValue(0);
  const currentDayIndex = useSharedValue(0);
  const [draggedSlotIndexRN, setDraggedSlotIndexRN] = useState<number | null>(null);
  const [flatListScrollToIndex, setFlatListScrollToIndex] = useState<(targetIndex: number) => void>(() => () => {});
  const [portalEnabled, setPortalEnabled] = useState(false);
  const verticalConstraintEnabled = useSharedValue(true);
  const draggedSlotInitialOffsetY = useSharedValue(0);
  
  // Snap system state
  const isSnapped = useSharedValue(true); // Whether slot is in snapped state
  const isBreakingSnap = useSharedValue(false); // Whether snap break animation is playing
  const dragDirection = useSharedValue<'vertical' | 'horizontal' | null>(null); // Locked drag direction
  const lockedOffsetY = useSharedValue(0); // Y position locked when dragging horizontally

  const contextValue = {
    draggedSlotX,
    draggedSlotY,
    draggedSlotOffsetX,
    draggedSlotOffsetY,
    draggedSlotHeight,
    draggedSlotMiddleY,
    draggedSlotZone,
    draggedSlotHorizontalZone,
    draggedSlotIndex,
    dayPageScrollY,
    currentDayIndex,
    flatListScrollToIndex,
    setFlatListScrollToIndex,
    draggedSlotIndexRN,
    setDraggedSlotIndexRN,
    portalEnabled,
    setPortalEnabled,
    verticalConstraintEnabled,
    draggedSlotInitialOffsetY,
    isSnapped,
    isBreakingSnap,
    dragDirection,
    lockedOffsetY,
  };

  return (
    <DraggedSlotContext.Provider value={contextValue}>
      {children}
    </DraggedSlotContext.Provider>
  );
};