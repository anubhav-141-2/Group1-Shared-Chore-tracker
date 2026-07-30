import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import CreateHousehold from './pages/CreateHousehold';
import JoinHousehold from './pages/JoinHousehold';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Chores from './pages/Chores';
import Settlements from './pages/Settlements';
import HouseholdSettings from './pages/HouseholdSettings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="text-center text-sm text-gray-500 mt-20">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/household/create" element={<ProtectedRoute><CreateHousehold /></ProtectedRoute>} />
            <Route path="/household/join" element={<ProtectedRoute><JoinHousehold /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
            <Route path="/chores" element={<ProtectedRoute><Chores /></ProtectedRoute>} />
            <Route path="/settlements" element={<ProtectedRoute><Settlements /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><HouseholdSettings /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
