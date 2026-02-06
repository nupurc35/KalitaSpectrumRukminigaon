import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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

const AppContent: React.FC = () => {
  // Track page views on route changes
  usePageTracking();
  const location = useLocation();

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
            <Route path="/thank-you" element={<ThankYou />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
      <AppContent />
    </Router>
  );
};

export default App;
