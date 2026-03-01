import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login, Register } from './features/auth/AuthPages';
import { DashboardRouter } from './features/dashboard/DashboardRouter';
import { CulturalExplorer } from './features/public-explorer/CulturalExplorer';
import { CommunityDetail } from './features/public-explorer/CommunityDetail';
import { Marketplace } from './features/marketplace/Marketplace';
import { PageTransition } from './components/Layout/PageTransition';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PageTransition><CulturalExplorer /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/cultural-explorer" element={<PageTransition><CulturalExplorer /></PageTransition>} />
          <Route path="/community/:id" element={<PageTransition><CommunityDetail /></PageTransition>} />
          <Route path="/marketplace" element={<PageTransition><Marketplace /></PageTransition>} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* General catch-all for dashboards */}
            <Route path="/dashboard/*" element={<PageTransition><DashboardRouter /></PageTransition>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
