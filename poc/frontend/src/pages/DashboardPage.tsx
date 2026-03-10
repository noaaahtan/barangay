import { useAuth } from '@/context/AuthContext';
import { AdminDashboard } from '@/features/dashboard/AdminDashboard';
import { CitizenDashboard } from '@/features/dashboard/CitizenDashboard';

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <CitizenDashboard />;
}
