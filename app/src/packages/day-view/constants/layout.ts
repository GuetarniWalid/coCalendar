import { fontSize } from '@project/shared/theme/typography';

// Constants from components
export const DAY_TASKS_PROGRESS_SIZE = 65;

// SharedHeader component dimensions
export const HEADER_ROW_PADDING_BOTTOM = 8;

// DateSelector component dimensions
export const DATE_SELECTOR_NAME_FONT_SIZE = 12;
export const DATE_SELECTOR_NAME_MARGIN_BOTTOM = 2;
export const DATE_SELECTOR_PADDING_TOP = 20;
export const DATE_SELECTOR_PADDING_BOTTOM = 22;

// Calculated DateSelector cell height
const DATE_SELECTOR_CELL_HEIGHT =
  DATE_SELECTOR_PADDING_TOP +
  DATE_SELECTOR_NAME_FONT_SIZE +
  DATE_SELECTOR_NAME_MARGIN_BOTTOM +
  fontSize.xl + // dateNumber font size (20)
  DATE_SELECTOR_PADDING_BOTTOM;

// Calculated total header height
export const HEADER_HEIGHT =
  DAY_TASKS_PROGRESS_SIZE +
  HEADER_ROW_PADDING_BOTTOM +
  DATE_SELECTOR_CELL_HEIGHT;
