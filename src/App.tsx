import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { TenantProvider } from "@/context/TenantContext";
import { OrderProvider } from "@/context/OrderContext";
import { KitchenPinProvider } from "@/context/KitchenPinContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Public pages
import LandingPage from "./pages/LandingPage";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RegisterSetup from "./pages/RegisterSetup";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import KitchenPin from "./pages/KitchenPin";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import JoinTeam from "./pages/JoinTeam";

// Protected pages
import Kitchen from "./pages/Kitchen";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import SuperAdmin from "./pages/SuperAdmin";
import Checkout from "./pages/Checkout";
import TrialExpired from "./pages/TrialExpired";
import Upgrade from "./pages/Upgrade";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <OrderProvider>
            <KitchenPinProvider>
              <TooltipProvider>
              <Toaster />
              <Sonner />
              <ErrorBoundary>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  {/* Playground removed - use /demo */}
                  <Route path="/demo" element={<Demo />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/terminos" element={<Terms />} />
                  <Route path="/privacidad" element={<Privacy />} />
                  <Route path="/join/:token" element={<JoinTeam />} />

                  {/* Tenant Menu (public) - /t/{tenant-slug} */}
                  <Route path="/t/:tenantSlug" element={<Menu />} />
                  <Route path="/t/:tenantSlug/menu" element={<Menu />} />

                  {/* Kitchen PIN Access (public) - /cocina/{tenant-slug} */}
                  <Route path="/cocina/:slug" element={<KitchenPin />} />

                  {/* Protected Routes - require authentication */}
                  <Route path="/register/setup" element={
                    <ProtectedRoute>
                      <RegisterSetup />
                    </ProtectedRoute>
                  } />

                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />

                  <Route path="/cocina" element={
                    <ProtectedRoute>
                      <Kitchen />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin" element={
                    <ProtectedRoute requiredRoles={['owner', 'admin']}>
                      <Admin />
                    </ProtectedRoute>
                  } />

                  {/* Trial/Subscription Routes - skip trial check */}
                  <Route path="/trial-expired" element={
                    <ProtectedRoute skipTrialCheck>
                      <TrialExpired />
                    </ProtectedRoute>
                  } />

                  <Route path="/upgrade" element={
                    <ProtectedRoute skipTrialCheck>
                      <Upgrade />
                    </ProtectedRoute>
                  } />

                  <Route path="/checkout" element={
                    <ProtectedRoute skipTrialCheck>
                      <Checkout />
                    </ProtectedRoute>
                  } />

                  {/* Super Admin (protected by auth + server-side is_super_admin check) */}
                  <Route path="/super-admin" element={
                    <ProtectedRoute skipTrialCheck>
                      <SuperAdmin />
                    </ProtectedRoute>
                  } />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
              </TooltipProvider>
            </KitchenPinProvider>
          </OrderProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
