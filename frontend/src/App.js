import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import PredictionForm from './components/PredictionForm';
import ResumeBuilder from './components/ResumeBuilder';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import StreamPredictionForm from './components/StreamPredictionForm';
import LinkedInAuditorPage from './pages/LinkedInAuditorPage';
import MockInterview from './components/MockInterview';
import JobMarketInsightsPage from './components/JobMarketInsightsPage';
import PortfolioGenerator from './components/PortfolioGenerator';

const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    return (
        <Link
            to={to}
            className={`app-nav-link ${isActive ? 'app-nav-link--active' : ''}`}
        >
            {children}
        </Link>
    );
};

const AppNavbar = ({ user, onLogout }) => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <nav className={`app-navbar ${scrolled ? 'app-navbar--scrolled' : ''}`}>
            <div className="app-navbar__underline" />

            <Container className="app-navbar__inner">
                <Link to="/dashboard" className="app-navbar__brand">
                    <span className="app-navbar__brand-icon">✦</span>
                    <span className="app-navbar__brand-text">
                        AICareer<span className="app-navbar__brand-accent">Pro</span>
                    </span>
                </Link>
                <ul className="app-navbar__links">
                    <li><NavLink to="/about">About Us</NavLink></li>
                    <li><NavLink to="/contact">Contact Us</NavLink></li>
                </ul>
                <div className="app-navbar__auth">
                    {user ? (
                        <>
                            <div className="app-navbar__welcome">
                                <span className="app-navbar__welcome-dot" />
                                Welcome,&nbsp;<strong>{user}</strong>
                            </div>
                            <button
                                className="app-navbar__btn app-navbar__btn--logout"
                                onClick={onLogout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="app-navbar__btn app-navbar__btn--ghost">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="app-navbar__btn app-navbar__btn--primary">
                                    Sign Up
                                </button>
                            </Link>
                        </>
                    )}
                </div>
                <button
                    className={`app-navbar__hamburger ${menuOpen ? 'open' : ''}`}
                    onClick={() => setMenuOpen(v => !v)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </Container>
            <div className={`app-navbar__drawer ${menuOpen ? 'app-navbar__drawer--open' : ''}`}>
                <NavLink to="/about"   >About Us</NavLink>
                <NavLink to="/contact" >Contact Us</NavLink>
                <div className="app-navbar__drawer-divider" />
                {user ? (
                    <>
                        <span className="app-navbar__drawer-user">👤 {user}</span>
                        <button
                            className="app-navbar__btn app-navbar__btn--logout"
                            style={{ width: '100%', marginTop: 4 }}
                            onClick={() => { setMenuOpen(false); onLogout(); }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login"  onClick={() => setMenuOpen(false)}><button className="app-navbar__btn app-navbar__btn--ghost"   style={{ width: '100%' }}>Login</button></Link>
                        <Link to="/signup" onClick={() => setMenuOpen(false)}><button className="app-navbar__btn app-navbar__btn--primary" style={{ width: '100%', marginTop: 6 }}>Sign Up</button></Link>
                    </>
                )}
            </div>
        </nav>
    );
};
const ProtectedRoute = ({ children, user }) => {
    if (!user) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    const [user, setUser] = useState(null);

    const handleAuthSuccess = (userName) => setUser(userName);
    const handleLogout = () => {
        setUser(null);
        window.location.href = '/';
    };

    return (
        <Router>
            <AppNavbar user={user} onLogout={handleLogout} />
            <div className="App">
                <Routes>
                    <Route path="/"          element={<Dashboard user={user} />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/about"     element={<AboutUs />} />
                    <Route path="/contact"   element={<ContactUs />} />

                    <Route path="/login"  element={user ? <Navigate to="/dashboard" replace /> : <AuthForm isAuthenticated={true}  setUser={handleAuthSuccess} />} />
                    <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <AuthForm isAuthenticated={false} setUser={handleAuthSuccess} />} />

                    <Route path="/predict"           element={<ProtectedRoute user={user}><PredictionForm user={user} /></ProtectedRoute>} />
                    <Route path="/resume"            element={<ProtectedRoute user={user}><ResumeBuilder user={user} /></ProtectedRoute>} />
                    <Route path="/cover-letter"      element={<ProtectedRoute user={user}><CoverLetterGenerator user={user} /></ProtectedRoute>} />
                    <Route path="/stream-predict"    element={<ProtectedRoute user={user}><StreamPredictionForm /></ProtectedRoute>} />
                    <Route path="/linkedin-auditor"  element={<ProtectedRoute user={user}><LinkedInAuditorPage /></ProtectedRoute>} />
                    <Route path="/portfolio-generator" element={<ProtectedRoute user={user}><PortfolioGenerator user={user} /></ProtectedRoute>} />
                    <Route path="/job-market-insights" element={<ProtectedRoute user={user}><JobMarketInsightsPage user={user} /></ProtectedRoute>} />
                    <Route path="/mock-interview" element={
                        <ProtectedRoute user={user}>
                            <div className="container mt-5">
                                <h2 className="text-center mb-4">Interview Practice Tool</h2>
                                <MockInterview career={user || 'Software Engineer'} />
                            </div>
                        </ProtectedRoute>
                    } />
                </Routes>
            </div>
        </Router>
    );
}

export default App;