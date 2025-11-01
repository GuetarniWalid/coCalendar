export type SwipeActionSide = 'left' | 'right';
export type SwipeActionVariant = 'delete' | 'success';

export interface SwipeActionButtonProps {
  side: SwipeActionSide;
  variant: SwipeActionVariant;
  slotDate: string;
  onAction?: () => void;
}
