import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { useAuth } from '@/context/AuthContext';

// Wrapper component to route based on user role
function ApplicationsRoute() {
  const { user } = useAuth();
  return user?.role === 'admin' ? <ApplicationsPage /> : <MyApplicationsPage />;
}

function NewApplicationRedirect() {
  return <Navigate to="/applications" replace state={{ openNewApplication: true }} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/applications" element={<ApplicationsRoute />} />
            <Route path="/applications/new" element={<NewApplicationRedirect />} />
            <Route path="/equipment" element={<div className="space-y-6"><h1 className="text-2xl font-bold">Equipment</h1><p className="text-slate-600">Coming soon...</p></div>} />
            <Route path="/esumbong" element={<div className="space-y-6"><h1 className="text-2xl font-bold">E-Sumbong</h1><p className="text-slate-600">Coming soon...</p></div>} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
