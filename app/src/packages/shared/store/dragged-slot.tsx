import { createContext, useContext, ReactNode, useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { SlotItem as SlotItemType } from '@project/shared';
import { SWIPE_BUTTON_WIDTH } from '../../day-view/ui/slot-item/SwipeActionButton/constants';

interface DraggedSlotContextType {
  draggedSlotOpacity: SharedValue<number>;
  draggedSlotX: SharedValue<number>;
  draggedSlotY: SharedValue<number>;
  firstOriginalSlotY: SharedValue<number>;
  lastOriginalSlotY: SharedValue<number>;
  draggedSlotOffsetX: SharedValue<number>;
  draggedSlotOffsetY: SharedValue<number>;
  draggedSlotHorizontalZone: SharedValue<'left' | 'middle' | 'right'>;
  draggedSlot: SlotItemType | null;
  setDraggedSlot: (slot: SlotItemType | null) => void;
  sourceDayDate: string | null;
  setSourceDayDate: (date: string | null) => void;
  newDraggedSlotScrollY: number;
  setNewDraggedSlotScrollY: (y: number) => void;
  initialScroll: SharedValue<number>;
  hasDayChangedDuringDrag: boolean;
  setHasDayChangedDuringDrag: (hasChanged: boolean) => void;
  isVerticalSnapActive: SharedValue<boolean>;
  verticalSnapThreshold: SharedValue<number>;
  snapTransitionProgress: SharedValue<number>;
  isHorizontalSnapActive: SharedValue<boolean>;
  horizontalSnapThreshold: SharedValue<number>;
  horizontalSnapBreakThreshold: SharedValue<number>;
  horizontalSnapProgress: SharedValue<number>;
  lastHorizontalOffset: SharedValue<number>;
  hasReturnedBelowThreshold: SharedValue<boolean>;
  snapStartPosition: SharedValue<number>;
  lastAbsOffset: SharedValue<number>;
  isDragging: SharedValue<boolean>;
  isSlotReady: SharedValue<boolean>;
  areSwipeButtonsDisabled: SharedValue<boolean>;
}

const DraggedSlotContext = createContext<DraggedSlotContextType | null>(null);

export const useDraggedSlotContext = () => {
  const context = useContext(DraggedSlotContext);
  if (!context) {
    throw new Error(
      'useDraggedSlotContext must be used within DraggedSlotProvider'
    );
  }
  return context;
};

interface DraggedSlotProviderProps {
  children: ReactNode;
}

export const DraggedSlotProvider = ({ children }: DraggedSlotProviderProps) => {
  const draggedSlotOpacity = useSharedValue(0);
  const draggedSlotX = useSharedValue(0);
  const draggedSlotY = useSharedValue(0);
  const firstOriginalSlotY = useSharedValue(0);
  const lastOriginalSlotY = useSharedValue(0);
  const draggedSlotOffsetX = useSharedValue(0);
  const draggedSlotOffsetY = useSharedValue(0);
  const draggedSlotHorizontalZone = useSharedValue<'left' | 'middle' | 'right'>(
    'middle'
  );
  const [draggedSlot, setDraggedSlotState] = useState<SlotItemType | null>(null);
  const [sourceDayDate, setSourceDayDate] = useState<string | null>(null);
  const [hasDayChangedDuringDrag, setHasDayChangedDuringDrag] = useState(false);
  const [newDraggedSlotScrollY, setNewDraggedSlotScrollY] = useState(0);
  const initialScroll = useSharedValue(0);
  const isVerticalSnapActive = useSharedValue(true);
  const verticalSnapThreshold = useSharedValue(50);
  const snapTransitionProgress = useSharedValue(0);
  const isHorizontalSnapActive = useSharedValue(false);
  const horizontalSnapThreshold = useSharedValue(SWIPE_BUTTON_WIDTH);
  const horizontalSnapBreakThreshold = useSharedValue(50);
  const horizontalSnapProgress = useSharedValue(0);
  const lastHorizontalOffset = useSharedValue(0);
  const hasReturnedBelowThreshold = useSharedValue(true);
  const snapStartPosition = useSharedValue(0);
  const lastAbsOffset = useSharedValue(0);
  const isDragging = useSharedValue(false);
  const isSlotReady = useSharedValue(false);
  const areSwipeButtonsDisabled = useSharedValue(false);

  const setDraggedSlot = (slot: SlotItemType | null) => {
    setDraggedSlotState(slot);
    isDragging.value = slot !== null;
    if (slot !== null) {
      isSlotReady.value = false;
      areSwipeButtonsDisabled.value = false;
    }
  };

  const contextValue = {
    draggedSlotOpacity,
    draggedSlotX,
    draggedSlotY,
    firstOriginalSlotY,
    lastOriginalSlotY,
    draggedSlotOffsetX,
    draggedSlotOffsetY,
    draggedSlotHorizontalZone,
    draggedSlot,
    setDraggedSlot,
    sourceDayDate,
    setSourceDayDate,
    hasDayChangedDuringDrag,
    setHasDayChangedDuringDrag,
    newDraggedSlotScrollY,
    setNewDraggedSlotScrollY,
    initialScroll,
    isVerticalSnapActive,
    verticalSnapThreshold,
    snapTransitionProgress,
    isHorizontalSnapActive,
    horizontalSnapThreshold,
    horizontalSnapBreakThreshold,
    horizontalSnapProgress,
    lastHorizontalOffset,
    hasReturnedBelowThreshold,
    snapStartPosition,
    lastAbsOffset,
    isDragging,
    isSlotReady,
    areSwipeButtonsDisabled,
  };

  return (
    <DraggedSlotContext.Provider value={contextValue}>
      {children}
    </DraggedSlotContext.Provider>
  );
};
