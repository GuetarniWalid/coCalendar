export type SwipeActionSide = 'left' | 'right';
export type SwipeActionVariant = 'delete' | 'complete' | 'incomplete';

export interface SwipeActionButtonProps {
  side: SwipeActionSide;
  variant: SwipeActionVariant;
  slotDate: string;
  onAction?: () => void;
}
