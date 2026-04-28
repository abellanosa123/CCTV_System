import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ adminOnly = false, adminExclusive = false }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/cctvsystem/login" state={{ from: location }} replace />;
  }

  // adminExclusive: only admin role (used for User Management)
  if (adminExclusive && user.role !== 'admin') {
    return <Navigate to="/cctvsystem/" replace />;
  }

  // adminOnly: admin OR team_leader (used for Reports)
  if (adminOnly && user.role !== 'admin' && user.role !== 'team_leader') {
    return <Navigate to="/cctvsystem/" replace />;
  }

  return <Outlet />;
}
