import type { User, Genre, Movie, Screen, Showtime, SeatWithStatus, Reservation, Summary, RevenueByMovie, CapacityRow } from "./types";
export declare const AuthApi: {
    login: (email: string, password: string) => Promise<{
        user: User;
        token: string;
    }>;
    signup: (name: string, email: string, password: string) => Promise<{
        user: User;
        token: string;
    }>;
    me: () => Promise<{
        user: User;
    }>;
};
export declare const GenresApi: {
    list: () => Promise<{
        genres: Genre[];
    }>;
    create: (name: string) => Promise<{
        genre: Genre;
    }>;
};
export declare const MoviesApi: {
    list: (params?: {
        genre?: string;
        search?: string;
    }) => Promise<{
        movies: Movie[];
    }>;
    get: (id: number) => Promise<{
        movie: Movie;
    }>;
    create: (input: {
        title: string;
        description?: string;
        poster_url?: string;
        duration_minutes: number;
        genre_ids?: number[];
    }) => Promise<{
        movie: Movie;
    }>;
    update: (id: number, input: Partial<{
        title: string;
        description?: string;
        poster_url?: string;
        duration_minutes: number;
        genre_ids?: number[];
    }>) => Promise<{
        movie: Movie;
    }>;
    remove: (id: number) => Promise<void>;
};
export declare const ScreensApi: {
    list: () => Promise<{
        screens: Screen[];
    }>;
    get: (id: number) => Promise<{
        screen: Screen & {
            seats: SeatWithStatus[];
        };
    }>;
    create: (input: {
        name: string;
        rows: number;
        columns: number;
    }) => Promise<{
        screen: Screen;
    }>;
    remove: (id: number) => Promise<void>;
};
export declare const ShowtimesApi: {
    list: (params?: {
        date?: string;
        movie_id?: number;
    }) => Promise<{
        showtimes: Showtime[];
    }>;
    get: (id: number) => Promise<{
        showtime: Showtime;
    }>;
    seatMap: (id: number) => Promise<{
        showtime: Showtime;
        seats: SeatWithStatus[];
    }>;
    create: (input: {
        movie_id: number;
        screen_id: number;
        start_time: string;
        price: number;
    }) => Promise<{
        showtime: Showtime;
    }>;
    update: (id: number, input: Partial<{
        movie_id: number;
        screen_id: number;
        start_time: string;
        price: number;
    }>) => Promise<{
        showtime: Showtime;
    }>;
    remove: (id: number) => Promise<void>;
};
export declare const ReservationsApi: {
    create: (showtime_id: number, seat_ids: number[], payment_method: string) => Promise<{
        reservation: Reservation;
    }>;
    mine: () => Promise<{
        reservations: Reservation[];
    }>;
    cancel: (id: number) => Promise<{
        reservation: Reservation;
    }>;
    all: (params?: {
        showtime_id?: number;
        status?: string;
    }) => Promise<{
        reservations: Reservation[];
    }>;
};
export declare const UsersApi: {
    list: () => Promise<{
        users: User[];
    }>;
    promote: (id: number) => Promise<{
        user: User;
    }>;
};
export declare const ReportsApi: {
    summary: () => Promise<Summary>;
    revenueByMovie: (params?: {
        from?: string;
        to?: string;
    }) => Promise<{
        revenue_by_movie: RevenueByMovie[];
    }>;
    capacity: (showtime_id?: number) => Promise<{
        capacity: CapacityRow[];
    }>;
};
