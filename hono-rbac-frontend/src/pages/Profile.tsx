import { useAuthStore } from '../store/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  return (
    <div className="container mx-auto mt-10 p-4">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>
      <div className="bg-white p-6 rounded shadow max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2">ID</label>
            <p className="text-gray-800">{user?.id}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2">Name</label>
            <p className="text-gray-800">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2">Email</label>
            <p className="text-gray-800">{user?.email}</p>
          </div>
          <div>
            <label className="block text-gray-600 text-sm font-bold mb-2">Role</label>
            <p className="text-gray-800 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
