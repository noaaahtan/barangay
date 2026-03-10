import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';import { AdminRoute } from '@/components/AdminRoute';import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { EquipmentReservationsPage } from '@/pages/EquipmentReservationsPage';
import { MyReservationsPage } from '@/pages/MyReservationsPage';
import { ESumbongPage } from '@/pages/ESumbongPage';
import { MyReportsPage } from '@/pages/MyReportsPage';
import { ReportsManagementPage } from '@/pages/ReportsManagementPage';
import { ReportDetailsPage } from '@/pages/ReportDetailsPage';
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
            <Route path="/equipment-reservations" element={<EquipmentReservationsPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/e-sumbong/submit" element={<ESumbongPage />} />
            <Route path="/e-sumbong/my-reports" element={<MyReportsPage />} />
            <Route path="/e-sumbong/reports/:id" element={<ReportDetailsPage />} />
            <Route 
              path="/e-sumbong/manage" 
              element={
                <AdminRoute>
                  <ReportsManagementPage />
                </AdminRoute>
              } 
            />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
