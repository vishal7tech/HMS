// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
          
          {/* Role-based routes */}
          <Route path="/patients" element={
            <ProtectedRoute requiredRoles={['ADMIN', 'RECEPTIONIST']}>
              <Patients />
            </ProtectedRoute>
          } />
          
          <Route path="/doctors" element={
            <ProtectedRoute requiredRoles={['ADMIN', 'RECEPTIONIST']}>
              <Doctors />
            </ProtectedRoute>
          } />
          
          <Route path="/appointments" element={
            <ProtectedRoute requiredRoles={['ADMIN', 'RECEPTIONIST', 'DOCTOR']}>
              <Appointments />
            </ProtectedRoute>
          } />
          
          <Route path="/billing" element={
            <ProtectedRoute requiredRoles={['ADMIN', 'RECEPTIONIST']}>
              <Billing />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
