import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login, Register } from './features/auth/AuthPages';
import { DashboardRouter } from './features/dashboard/DashboardRouter';
import { CulturalExplorer } from './features/public-explorer/CulturalExplorer';
import { CommunityDetail } from './features/public-explorer/CommunityDetail';
import { Marketplace } from './features/marketplace/Marketplace';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CulturalExplorer />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/cultural-explorer" element={<CulturalExplorer />} />
          <Route path="/community/:id" element={<CommunityDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* General catch-all for dashboards */}
            <Route path="/dashboard/*" element={<DashboardRouter />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
