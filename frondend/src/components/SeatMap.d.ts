import type { SeatWithStatus } from "../api/types";
interface SeatMapProps {
    seats: SeatWithStatus[];
    selectedIds: number[];
    onToggle: (seat: SeatWithStatus) => void;
}
export declare function SeatMap({ seats, selectedIds, onToggle }: SeatMapProps): import("react").JSX.Element;
export {};
