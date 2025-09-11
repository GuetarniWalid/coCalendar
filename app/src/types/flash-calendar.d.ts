declare module '@marceloterreiro/flash-calendar' {
  // Minimal, permissive types to unblock development
  export const Calendar: any;
  export namespace Calendar {
    const List: any;
  }
  export function toDateId(d: Date): string;
}

declare module '@shopify/flash-list' {
  export const FlashList: any;
}
