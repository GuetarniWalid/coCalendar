/**
 * Draggable Slot Configuration Constants
 */

// === Gesture Settings ===
export const LONG_PRESS_DURATION = 500; // ms - duration to activate drag
export const TAP_MAX_DURATION = 200; // ms - max duration for tap detection

// === Snap System ===
// Thresholds for snap behavior (in pixels)
export const VERTICAL_SNAP_THRESHOLD = 10; // Distance from origin to snap vertically
export const HORIZONTAL_SNAP_THRESHOLD = 10; // Distance from origin to snap horizontally
export const HORIZONTAL_BREAK_THRESHOLD = 30; // Horizontal distance required to break snap
export const DIRECTION_DETECTION_THRESHOLD = 15; // Minimum movement to detect direction intent

// === Animation Durations ===
export const SNAP_BREAK_ANIMATION_DURATION = 50; // ms - snap break transition
export const TIME_HANDLER_ANIMATION_DURATION = 200; // ms - time handler appearance/disappearance

// === Vertical Constraint ===
export const VERTICAL_CONSTRAINT_DISTANCE = 50; // Pixels the slot can move up/down when constrained

// === Screen Zones ===
// Auto-scrolling zone thresholds (percentage from top)
export const VERTICAL_SCROLL_ZONE_TOP_THRESHOLD = 0.15; // 15% from top
export const VERTICAL_SCROLL_ZONE_BOTTOM_THRESHOLD = 0.85; // 85% from top

// === Time Handler Dimensions ===
export const TIME_HANDLER_WIDTH = 80;
export const TIME_HANDLER_HEIGHT = 120;

