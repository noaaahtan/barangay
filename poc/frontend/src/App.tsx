import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';

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
            <Route path="/applications" element={<div className="space-y-6"><h1 className="text-2xl font-bold">Applications</h1><p className="text-slate-600">Coming soon...</p></div>} />
            <Route path="/equipment" element={<div className="space-y-6"><h1 className="text-2xl font-bold">Equipment</h1><p className="text-slate-600">Coming soon...</p></div>} />
            <Route path="/esumbong" element={<div className="space-y-6"><h1 className="text-2xl font-bold">E-Sumbong</h1><p className="text-slate-600">Coming soon...</p></div>} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
