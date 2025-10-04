import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { toggleTheme } from '../../store/slices/uiSlice'
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import './Header.css'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { theme } = useSelector((state) => state.ui)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Apply theme on mount and when it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
    setIsMobileMenuOpen(false)
    setIsAccountMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsAccountMenuOpen(false)
  }

  const toggleAccountMenu = () => {
    setIsAccountMenuOpen(!isAccountMenuOpen)
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Placer</h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="desktop-nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
              <Link to="/create" className={`nav-link ${isActive('/create') ? 'active' : ''}`}>Add Place</Link>

              {/* Theme Toggle */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="theme-toggle-btn"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <MoonIcon className="icon" /> : <SunIcon className="icon" />}
              </button>

              <div className="user-menu">
                <button className="user-menu-trigger">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="avatar" />
                  ) : (
                    <UserCircleIcon className="user-icon" />
                  )}
                </button>
                <div className="user-menu-dropdown">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="dropdown-item admin-dropdown-item">Admin Dashboard</Link>
                  )}
                  <button onClick={handleLogout} className="dropdown-item">
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Theme Toggle for non-authenticated users */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="theme-toggle-btn"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <MoonIcon className="icon" /> : <SunIcon className="icon" />}
              </button>
              <Link to="/auth" className="btn btn-primary">Sign In</Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <Link to="/" className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/create" className={`mobile-nav-link ${isActive('/create') ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                Add Place
              </Link>

              {/* Accordion Account Menu */}
              <div className="mobile-accordion">
                <button className="mobile-accordion-trigger" onClick={toggleAccountMenu}>
                  <span className="accordion-title">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="mobile-avatar" />
                    ) : (
                      <UserCircleIcon className="mobile-avatar-icon" />
                    )}
                    Account
                  </span>
                  <ChevronDownIcon className={`accordion-icon ${isAccountMenuOpen ? 'open' : ''}`} />
                </button>
                {isAccountMenuOpen && (
                  <div className="mobile-accordion-content">
                    <Link to="/profile" className="mobile-accordion-link" onClick={() => setIsMobileMenuOpen(false)}>
                      Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="mobile-accordion-link admin-mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleLogout} className="mobile-accordion-link logout-btn">
                      Sign Out
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle in Mobile Menu */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="mobile-nav-link theme-toggle-mobile"
              >
                {theme === 'light' ? <MoonIcon className="icon" /> : <SunIcon className="icon" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
                Sign In
              </Link>
              {/* Theme Toggle for non-authenticated mobile users */}
              <button
                onClick={() => dispatch(toggleTheme())}
                className="mobile-nav-link theme-toggle-mobile"
              >
                {theme === 'light' ? <MoonIcon className="icon" /> : <SunIcon className="icon" />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </>
          )}
        </div>
      )}
    </header>
  )
}

export default Header