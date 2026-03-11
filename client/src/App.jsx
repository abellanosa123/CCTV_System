import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Observations from './pages/Observations';
import Reviews from './pages/Reviews';
import Releases from './pages/Releases';
import Reports from './pages/Reports';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <Router>
      <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/observations" element={<Observations />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/releases" element={<Releases />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
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
    </Router>
  );
}

export default App;
