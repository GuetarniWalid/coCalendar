/**
 * Draggable Slot Configuration Constants
 */

// === Gesture Settings ===
export const LONG_PRESS_DURATION = 500; // ms - duration to activate drag
export const TAP_MAX_DURATION = 200; // ms - max duration for tap detection

// === Vertical Constraint ===
export const VERTICAL_CONSTRAINT_DISTANCE = 73; // Pixels the slot can move up/down when constrained (increased to allow Z5:60m)

// === Screen Zones ===
// Auto-scrolling zone thresholds (percentage from top)
export const VERTICAL_SCROLL_ZONE_TOP_THRESHOLD = 0.15; // 15% from top
export const VERTICAL_SCROLL_ZONE_BOTTOM_THRESHOLD = 0.85; // 85% from top

// === Time Calculation ===
export const TIME_CALCULATION_INTERVAL = 500; // ms - time update interval when dragging

// Time adjustment zones (distance from origin in pixels)
// New steps: 1m, 5m, 10m, 30m, 60m
export const TIME_ZONE_1 = 24; // within 24px → 1 min per tick (wider to avoid snap overlap)
export const TIME_ZONE_5 = 40; // within 40px → 5 min per tick
export const TIME_ZONE_10 = 56; // within 56px → 10 min per tick
export const TIME_ZONE_30 = 72; // within 72px → 30 min per tick
// beyond → 60 min per tick

// Debugging UI toggles
export const DEBUG_TIME_ZONES = true; // set true to display visual zone overlay
