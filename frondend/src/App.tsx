import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NavBar } from "./components/NavBar";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { MoviesPage } from "./pages/MoviesPage";
import { MovieDetailPage } from "./pages/MovieDetailPage";
import { SeatSelectionPage } from "./pages/SeatSelectionPage";
import { MyReservationsPage } from "./pages/MyReservationsPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { AdminPage } from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavBar />
        <Routes>
          <Route path="/" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/showtimes/:id/seats"
            element={
              <ProtectedRoute>
                <SeatSelectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reservations"
            element={
              <ProtectedRoute>
                <MyReservationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
