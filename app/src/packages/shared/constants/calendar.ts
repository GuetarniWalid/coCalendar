// Calendar configuration constants

export const CALENDAR_CONSTANTS = {
  // Total number of days available in the calendar (20 years: 2020-2040)
  TOTAL_DAYS: 7305,
  
  // Origin date for calendar calculations
  ORIGIN_DATE: '2020-01-01',
  
  // Horizontal edge threshold for triggering day scroll (in pixels)
  HORIZONTAL_SCROLL_ZONE_WIDTH: 80,
} as const;

