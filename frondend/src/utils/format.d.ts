export declare function formatDateTime(iso: string): string;
export declare function formatTime(iso: string): string;
export declare function formatMoney(amount: number): string;
export declare function todayISODate(): string;
/** Returns the next N dates (including today) as { iso, label } for a date-picker strip. */
export declare function nextDates(n: number): {
    iso: string;
    label: string;
}[];
