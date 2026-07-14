export type Role = "admin" | "user";
export interface User {
    id: number;
    name: string;
    email: string;
    role: Role;
    created_at: string;
}
export interface Genre {
    id: number;
    name: string;
}
export interface Movie {
    id: number;
    title: string;
    description: string | null;
    poster_url: string | null;
    duration_minutes: number;
    genres: Genre[];
}
export interface Screen {
    id: number;
    name: string;
    rows: number;
    columns: number;
}
export interface Seat {
    id: number;
    row_label: string;
    seat_number: number;
    seat_type: "standard" | "vip";
}
export interface SeatWithStatus extends Seat {
    is_booked: 0 | 1;
}
export interface Showtime {
    id: number;
    movie_id: number;
    screen_id: number;
    start_time: string;
    end_time: string;
    price: number;
    movie_title: string;
    poster_url: string | null;
    duration_minutes: number;
    screen_name: string;
}
export interface ReservationSeat {
    id?: number;
    row_label: string;
    seat_number: number;
    seat_type?: "standard" | "vip";
}
export interface Reservation {
    id: number;
    user_id: number;
    showtime_id: number;
    status: "confirmed" | "cancelled";
    total_amount: number;
    payment_method: "card" | "cash" | "paypal";
    created_at: string;
    cancelled_at: string | null;
    start_time: string;
    end_time?: string;
    movie_title: string;
    screen_name: string;
    seats: ReservationSeat[];
    user_name?: string;
    user_email?: string;
}
export interface Summary {
    total_revenue: number;
    confirmed_reservations: number;
    tickets_sold: number;
    upcoming_showtimes: number;
}
export interface RevenueByMovie {
    movie_id: number;
    title: string;
    revenue: number;
    reservation_count: number;
}
export interface CapacityRow {
    showtime_id: number;
    movie_title: string;
    screen_name: string;
    start_time: string;
    total_seats: number;
    booked_seats: number;
    utilization_percent: number;
}
