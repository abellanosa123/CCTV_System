
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Observations from './pages/Observations';
import Reviews from './pages/Reviews';
import Releases from './pages/Releases';
import Reports from './pages/Reports';
import Login from './pages/Login';
import Users from './pages/Users';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import ConfirmDialog from './components/ConfirmDialog';
import { useAuth } from './context/AuthContext';
import { toast } from 'react-toastify';

function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [logoutConfirm, setLogoutConfirm] = React.useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname.includes('/login');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    setLogoutConfirm(false);
  };

  return (
    <div className={`app-layout ${sidebarCollapsed && !isLoginPage ? 'sidebar-collapsed' : ''} ${logoutConfirm ? 'blur-content' : ''}`}>
      {!isLoginPage && (
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
          onLogout={() => setLogoutConfirm(true)}
        />
      )}
      <main className="main-content" style={isLoginPage ? { marginLeft: 0, width: '100%', padding: 0 } : {}}>
        <Routes>
          <Route path="/cctvsystem/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/cctvsystem" element={<Dashboard />} />
            <Route path="/cctvsystem/observations" element={<Observations />} />
            <Route path="/cctvsystem/reviews" element={<Reviews />} />
            <Route path="/cctvsystem/releases" element={<Releases />} />
            <Route path="/cctvsystem/notifications" element={<Notifications />} />
            <Route path="/cctvsystem/profile" element={<Profile />} />
          </Route>

          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/cctvsystem/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute adminExclusive={true} />}>
            <Route path="/cctvsystem/users" element={<Users />} />
          </Route>
          
          {/* Default redirect to login if root is accessed */}
          <Route path="/" element={<Navigate to="/cctvsystem/login" replace />} />
          <Route path="/cctvsystem" element={<Navigate to="/cctvsystem/login" replace />} />
        </Routes>
      </main>

      <ConfirmDialog
        isOpen={logoutConfirm}
        title="Logout Confirmation"
        message="Are you sure you want to sign out of the system? Any unsaved changes will be lost."
        onConfirm={handleLogout}
        onCancel={() => setLogoutConfirm(false)}
        confirmLabel="Logout"
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainLayout />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
