// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import NotificationDisplay from './components/NotificationDisplay';
import Login from './pages/Login';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import ProtectedRoute from './components/ProtectedRoute';
import RoleLayout from './components/RoleLayout';
import RoleBasedDashboardRedirect from './components/RoleBasedDashboardRedirect';

// Patient Portal
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientHistory from './pages/patient/PatientHistory';
import PatientProfile from './pages/patient/PatientProfile';

// Doctor Portal
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAvailability from './pages/doctor/DoctorAvailability';
import DoctorPatients from './pages/doctor/DoctorPatients';

// Receptionist Portal
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import ReceptionistPatientManagement from './pages/receptionist/ReceptionistPatientManagement';

// Billing Portal
import BillingDashboard from './pages/billing/BillingDashboard';
import BillingInvoices from './pages/billing/BillingInvoices';
import BillingPayments from './pages/billing/BillingPayments';
import BillingReports from './pages/billing/BillingReports';

// Admin Portal
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffManagement from './pages/admin/StaffManagement';
import AdminReports from './pages/admin/AdminReports';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';
import RegisterPatient from './pages/auth/RegisterPatient';
import RegisterDoctor from './pages/admin/RegisterDoctor';
import RegisterStaff from './pages/admin/RegisterStaff';

function App() {
  console.log("App component is rendering.");
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <AuthProvider>
            <Toaster position="top-right" />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register/patient" element={<RegisterPatient />} />
                <Route path="/signup" element={<Navigate to="/register/patient" replace />} />

                {/* Role-based dashboard routing - WINDSURF: Flowchart implementation */}
                <Route path="/" element={<ProtectedRoute><RoleLayout /></ProtectedRoute>}>
                  <Route index element={<RoleBasedDashboardRedirect />} />

                  {/* Admin Dashboard - AFTER Receptionist */}
                  <Route element={<ProtectedRoute requiredRoles={['ADMIN']} />}>
                    <Route path="admin-dashboard" element={<AdminDashboard />} />
                    <Route path="admin-reports" element={<AdminReports />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="staff" element={<StaffManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="register-doctor" element={<RegisterDoctor />} />
                    <Route path="register-staff" element={<RegisterStaff />} />
                    {/* Admin-specific routes - these should come BEFORE receptionist routes */}
                    <Route path="patients" element={<Patients />} />
                    <Route path="doctors" element={<Doctors />} />
                    <Route path="billing" element={<Billing />} />
                    <Route path="appointments" element={<Appointments />} />
                  </Route>

                  {/* Receptionist Dashboard - AFTER Admin to prevent conflicts */}
                  <Route element={<ProtectedRoute requiredRoles={['RECEPTIONIST']} />}>
                    <Route path="dashboard" element={<ReceptionistDashboard />} />
                    <Route path="receptionist-dashboard" element={<ReceptionistDashboard />} />
                    {/* Receptionist-specific routes - use different paths to avoid conflicts */}
                    <Route path="receptionist-patients" element={<ReceptionistPatientManagement />} />
                    <Route path="receptionist-doctors" element={<Doctors />} />
                    <Route path="receptionist-billing" element={<Billing />} />
                    <Route path="receptionist-appointments" element={<Appointments />} />
                  </Route>

                  {/* Patient Dashboard */}
                  <Route element={<ProtectedRoute requiredRoles={['PATIENT']} />}>
                    <Route path="patient-dashboard" element={<PatientDashboard />} />
                    <Route path="patient-appointments" element={<PatientAppointments />} />
                    <Route path="patient-history" element={<PatientHistory />} />
                    <Route path="patient/profile" element={<PatientProfile />} />
                  </Route>

                  {/* Doctor Dashboard */}
                  <Route element={<ProtectedRoute requiredRoles={['DOCTOR']} />}>
                    <Route path="doctor-dashboard" element={<DoctorDashboard />} />
                    <Route path="doctor-appointments" element={<DoctorAppointments />} />
                    <Route path="doctor-availability" element={<DoctorAvailability />} />
                    <Route path="doctor-patients" element={<DoctorPatients />} />
                  </Route>

                  {/* Billing Dashboard */}
                  <Route element={<ProtectedRoute requiredRoles={['BILLING']} />}>
                    <Route path="billing/dashboard" element={<BillingDashboard />} />
                    <Route path="billing/invoices" element={<BillingInvoices />} />
                    <Route path="billing/payments" element={<BillingPayments />} />
                    <Route path="billing/reports" element={<BillingReports />} />
                  </Route>

                  {/* Legacy redirects for compatibility */}
                  <Route path="patient" element={<Navigate to="/patient-dashboard" replace />} />
                  <Route path="doctor" element={<Navigate to="/doctor-dashboard" replace />} />
                  <Route path="receptionist" element={<Navigate to="/dashboard" replace />} />
                  <Route path="admin" element={<Navigate to="/admin-dashboard" replace />} />

                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </AuthProvider>
          <NotificationDisplay />
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
