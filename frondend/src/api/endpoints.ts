import { api } from "./client";
import type {
  User,
  Genre,
  Movie,
  Screen,
  Showtime,
  SeatWithStatus,
  Reservation,
  Summary,
  RevenueByMovie,
  CapacityRow,
} from "./types";

// ---- Auth ----
export const AuthApi = {
  login: (email: string, password: string) =>
    api.post<{ user: User; token: string }>("/auth/login", { email, password }),
  signup: (name: string, email: string, password: string) =>
    api.post<{ user: User; token: string }>("/auth/signup", {
      name,
      email,
      password,
    }),
  me: () => api.get<{ user: User }>("/auth/me"),
};

// ---- Genres ----
export const GenresApi = {
  list: () => api.get<{ genres: Genre[] }>("/genres"),
  create: (name: string) => api.post<{ genre: Genre }>("/genres", { name }),
};

// ---- Movies ----
export const MoviesApi = {
  list: (params: { genre?: string; search?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.genre) qs.set("genre", params.genre);
    if (params.search) qs.set("search", params.search);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<{ movies: Movie[] }>(`/movies${suffix}`);
  },
  get: (id: number) => api.get<{ movie: Movie }>(`/movies/${id}`),
  create: (input: {
    title: string;
    description?: string;
    poster_url?: string;
    duration_minutes: number;
    genre_ids?: number[];
  }) => api.post<{ movie: Movie }>("/movies", input),
  update: (
    id: number,
    input: Partial<{
      title: string;
      description?: string;
      poster_url?: string;
      duration_minutes: number;
      genre_ids?: number[];
    }>,
  ) => api.patch<{ movie: Movie }>(`/movies/${id}`, input),
  remove: (id: number) => api.del<void>(`/movies/${id}`),
};

// ---- Screens ----
export const ScreensApi = {
  list: () => api.get<{ screens: Screen[] }>("/screens"),
  get: (id: number) =>
    api.get<{ screen: Screen & { seats: SeatWithStatus[] } }>(`/screens/${id}`),
  create: (input: { name: string; rows: number; columns: number }) =>
    api.post<{ screen: Screen }>("/screens", input),
  remove: (id: number) => api.del<void>(`/screens/${id}`),
};

// ---- Showtimes ----
export const ShowtimesApi = {
  list: (params: { date?: string; movie_id?: number } = {}) => {
    const qs = new URLSearchParams();
    if (params.date) qs.set("date", params.date);
    if (params.movie_id) qs.set("movie_id", String(params.movie_id));
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<{ showtimes: Showtime[] }>(`/showtimes${suffix}`);
  },
  get: (id: number) => api.get<{ showtime: Showtime }>(`/showtimes/${id}`),
  seatMap: (id: number) =>
    api.get<{ showtime: Showtime; seats: SeatWithStatus[] }>(
      `/showtimes/${id}/seats`,
    ),
  create: (input: {
    movie_id: number;
    screen_id: number;
    start_time: string;
    price: number;
  }) => api.post<{ showtime: Showtime }>("/showtimes", input),
  update: (
    id: number,
    input: Partial<{
      movie_id: number;
      screen_id: number;
      start_time: string;
      price: number;
    }>,
  ) => api.patch<{ showtime: Showtime }>(`/showtimes/${id}`, input),
  remove: (id: number) => api.del<void>(`/showtimes/${id}`),
};

// ---- Reservations ----
export const ReservationsApi = {
  create: (showtime_id: number, seat_ids: number[], payment_method: string) =>
    api.post<{ reservation: Reservation }>("/reservations", {
      showtime_id,
      seat_ids,
      payment_method,
    }),
  mine: () => api.get<{ reservations: Reservation[] }>("/reservations/me"),
  cancel: (id: number) =>
    api.patch<{ reservation: Reservation }>(`/reservations/${id}/cancel`),
  all: (params: { showtime_id?: number; status?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.showtime_id) qs.set("showtime_id", String(params.showtime_id));
    if (params.status) qs.set("status", params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<{ reservations: Reservation[] }>(`/reservations${suffix}`);
  },
};

// ---- Users (admin) ----
export const UsersApi = {
  list: () => api.get<{ users: User[] }>("/users"),
  promote: (id: number) => api.patch<{ user: User }>(`/users/${id}/promote`),
};

// ---- Reports (admin) ----
export const ReportsApi = {
  summary: () => api.get<Summary>("/reports/summary"),
  revenueByMovie: (params: { from?: string; to?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.from) qs.set("from", params.from);
    if (params.to) qs.set("to", params.to);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<{ revenue_by_movie: RevenueByMovie[] }>(
      `/reports/revenue${suffix}`,
    );
  },
  capacity: (showtime_id?: number) => {
    const suffix = showtime_id ? `?showtime_id=${showtime_id}` : "";
    return api.get<{ capacity: CapacityRow[] }>(`/reports/capacity${suffix}`);
  },
};
