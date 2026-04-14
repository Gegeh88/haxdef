import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import History from './pages/History';
import NotFound from './pages/NotFound';
import { AuthGuard } from './components/auth/AuthGuard';
import { DashboardLayout } from './components/layout/DashboardLayout';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f3f4f6',
            border: '1px solid #374151',
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route element={<AuthGuard />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/domains" element={<Domains />} />
            <Route path="/history" element={<History />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
