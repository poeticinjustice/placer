import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../store/slices/authSlice'
import { Bars3Icon, XMarkIcon, UserCircleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import './Header.css'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  // Debug logging
  console.log('Header.jsx - isAuthenticated:', isAuthenticated)
  console.log('Header.jsx - user:', user)
  console.log('Header.jsx - user.role:', user?.role)

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
            <Link to="/auth" className="btn btn-primary">Sign In</Link>
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
            </>
          ) : (
            <Link to="/auth" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </header>
  )
}

export default Header