import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Shared
import PrivateRoute from './components/shared/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Views
import CustomerDashboard from './dashboards/customer/CustomerDashboard';
import SearchLabourer from './dashboards/customer/SearchLabourer';
import ReviewJob from './dashboards/customer/ReviewJob';

// Labourer Views
import LabourerDashboard from './dashboards/labourer/LabourerDashboard';

// Admin Views
import AdminDashboard from './dashboards/admin/AdminDashboard';
import { AuthContext } from './context/AuthContext';

const RootRedirect = () => {
  const { userRole, loading } = React.useContext(AuthContext);

  if (loading) return null;

  switch (userRole) {
    case 'customer': return <Navigate to="/customer" replace />;
    case 'labourer': return <Navigate to="/labourer" replace />;
    case 'admin': return <Navigate to="/admin" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-gray-800 dark:text-white border dark:border-gray-700 font-medium',
            }}
          />

          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Dashboard Routes nested inside Layout */}
            <Route element={<DashboardLayout />}>

              {/* Customer Routes */}
              <Route path="/customer" element={
                <PrivateRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </PrivateRoute>
              } />
              <Route path="/customer/search" element={
                <PrivateRoute allowedRoles={['customer']}>
                  <SearchLabourer />
                </PrivateRoute>
              } />
              <Route path="/customer/review/:id" element={
                <PrivateRoute allowedRoles={['customer']}>
                  <ReviewJob />
                </PrivateRoute>
              } />

              {/* Labourer Routes */}
              <Route path="/labourer" element={
                <PrivateRoute allowedRoles={['labourer']}>
                  <LabourerDashboard />
                </PrivateRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } />

            </Route>

            {/* Default Catch-all */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
