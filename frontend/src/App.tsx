import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Login, Register } from './features/auth/AuthPages';
import { DashboardRouter } from './features/dashboard/DashboardRouter';
import { CulturalExplorer } from './features/public-explorer/CulturalExplorer';
import { CommunityDetail } from './features/public-explorer/CommunityDetail';
import { Marketplace } from './features/marketplace/Marketplace';
import { ApplyForLicense } from './features/licenses/ApplyForLicense';
import { Loader } from './components/Loader/Loader';
import { PageTransition } from './components/Layout/PageTransition';
import { useAuth } from './features/auth/AuthContext';

/** Inner shell — has access to AuthContext so can show the global auth loader */
const AppShell = () => {
  const { isLoading: isAuthChecking } = useAuth();

  // Show the institutional loader while session is being verified
  if (isAuthChecking) {
    return <Loader label="Verifying session..." />;
  }

  return (
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
        <Route path="/dashboard/*" element={<PageTransition><DashboardRouter /></PageTransition>} />
        <Route path="/apply/:assetId" element={<PageTransition><ApplyForLicense /></PageTransition>} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
