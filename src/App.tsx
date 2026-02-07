import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StructuredData from './components/StructuredData';
import Home from './pages/Home';
import MenuPage from './pages/Menu';
import About from './pages/About';
import Contact from './pages/Contact';
import ThankYou from './pages/ThankYou';
import Gallery from './components/Gallery';
import Dashboard from './pages/admin/Dashboard';
import { usePageTracking } from './hooks/usePageTracking';
import ChatConcierge from "./modules/ai/chat/ChatConcierge";
import Login from "./pages/admin/Login";
import ProtectedRoute from "./components/protectedRoute";
import MenuManager from "./pages/admin/MenuManager";
import { useRestaurant } from "./hooks/useRestaurant";
import CategoryManager from './pages/admin/CategoryManager';
import CreateOrder from "./pages/admin/CreateOrder";
import ErrorBoundary from "./components/ErrorBoundary";

const AppContent: React.FC = () => {
  // Track page views on route changes
  usePageTracking();
  const location = useLocation();
  const { restaurant, loading: restaurantLoading } = useRestaurant();
  const hasThankYouAccess = Boolean(
    (location.state as { reservation?: unknown } | null)?.reservation
  );

  useEffect(() => {
    if (restaurant?.theme_color) {
      document.documentElement.style.setProperty("--primary-color", restaurant.theme_color);
    }
  }, [restaurant?.theme_color]);

  if (restaurantLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <span className="text-lg font-semibold tracking-wide text-white/80">Loading...</span>
      </div>
    );
  }

  return (
    <>
      <StructuredData />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-secondary focus:text-primary focus:px-4 focus:py-2 focus:rounded focus:font-bold"
      >
        Skip to main content
      </a>
      <div className="relative min-h-screen">
        {!location.pathname.startsWith('/admin') && <Navbar />}

        <main id="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/thank-you"
              element={hasThankYouAccess ? <ThankYou /> : <Navigate to="/" replace />}
            />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/menu"
              element={
                <ProtectedRoute>
                  <MenuManager />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/categories" element={<ProtectedRoute><CategoryManager /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/create-order" element={<ProtectedRoute><CreateOrder /></ProtectedRoute>} />
          </Routes>
        </main>

        {!location.pathname.startsWith('/admin') && <Footer />}
        {!location.pathname.startsWith('/admin') && <ChatConcierge />}
      </div>
    </>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </Router>
  );
};

export default App;
