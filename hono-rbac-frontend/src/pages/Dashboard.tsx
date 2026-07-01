import { useAuthStore } from '../store/authStore';

export default function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded shadow">
        <p className="text-lg">Welcome back, {user?.name || user?.email}!</p>
        <p className="mt-2 text-gray-600">Your role: <span className="font-semibold">{user?.role}</span></p>
      </div>
    </div>
  );
}
