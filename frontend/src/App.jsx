import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import MarketingPage from './pages/MarketingPage';
import Footer from './components/marketing/Footer';

const StutterHelp = lazy(() => import('./components/StutterHelp'));
const Therapy = lazy(() => import('./components/Therapy'));

import './App.css';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Therapy', to: '/therapy' },
];

function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <header className="nav-wrap">
      <nav className="nav container" aria-label="Primary">
        <Link className="brand" to="/" onClick={() => setOpen(false)} aria-label="FLOWspeak home">
          <span className="brand-mark">FLOW</span><span className="brand-rest">speak</span>
        </Link>
        <button
          className="nav-toggle btn btn-ghost"
          aria-expanded={open}
          aria-controls="primary-nav-links"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
        <div id="primary-nav-links" className={`nav-links ${open ? 'open' : ''}`}>
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`nav-item ${location.pathname === l.to ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link className="btn btn-primary nav-cta" to="/stutter-help" onClick={() => setOpen(false)}>
            Launch Lab
          </Link>
        </div>
      </nav>
    </header>
  );
}

const App = () => {
  return (
    <Router>
      <div className="app-shell">
        <Nav />
        <main className="main" id="main-content">
          <Suspense fallback={<div className="lab-loading" role="status">Loading lab…</div>}>
            <Routes>
              <Route path="/" element={<MarketingPage />} />
              <Route path="/stutter-help" element={<StutterHelp />} />
              <Route path="/therapy" element={<Therapy />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
