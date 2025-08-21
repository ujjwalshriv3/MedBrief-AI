import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../CSS/Navbar.css';
import logoImage from '../assets/logo.jpg';

// Clerk imports
import { useClerk, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openSignIn } = useClerk(); // Clerk hook
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Handle Clerk modal login
  const handleLogin = () => {
    openSignIn({}); // Opens Clerk's sign-in modal
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
    if (path === '/' || path === '/about' || path === '/contact') {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left side - Logo and Brand Name */}
        <div className="navbar-brand">
          <div className="navbar-logo">
            <img 
              src={logoImage} 
              alt="MedBrief AI Logo" 
              className="logo-image"
            />
          </div>
          <h1 className="navbar-title">MedBrief AI</h1>
        </div>

        {/* Mobile controls: theme switch + hamburger (visible on mobile) */}
        <div className="navbar-controls">
          <div className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" fill="#fbbf24"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <button
            className={`navbar-toggle ${isMenuOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>

        {/* Center - Navigation Links */}
        <div className="navbar-nav">
          <button 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => handleNavigation('/')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => handleNavigation('/about')}
          >
            About Us
          </button>
          <button 
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={() => handleNavigation('/contact')}
          >
            Contact Us
          </button>
        </div>

        {/* Right side - Auth + Theme Toggle */}
        <div className="navbar-actions">
          
          {/* If signed in → show User Menu */}
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          {/* If signed out → show Login button */}
          <SignedOut>
            <button className="login-btn" onClick={handleLogin}>
              Login
            </button>
          </SignedOut>
          
          {/* Theme Toggle */}
          <div className="theme-toggle" onClick={toggleTheme}>
            {isDarkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="5" fill="#fbbf24"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="mobile-menu-section">
            <button 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
              onClick={() => handleNavigation('/')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${isActive('/about') ? 'active' : ''}`}
              onClick={() => handleNavigation('/about')}
            >
              About Us
            </button>
            <button 
              className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
              onClick={() => handleNavigation('/contact')}
            >
              Contact Us
            </button>
          </div>
          <div className="mobile-menu-section actions">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <button className="login-btn" onClick={() => { setIsMenuOpen(false); handleLogin(); }}>
                Login
              </button>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
