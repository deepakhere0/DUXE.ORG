import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AcademicCapIcon, 
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  BeakerIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  HomeIcon,
  TagIcon,
  ArrowRightIcon,
  ArrowUpTrayIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Build nav links dynamically based on user role
  const navLinks = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Notes', href: '/notes', icon: BookOpenIcon },
    { name: 'AI Tools', href: '/tools', icon: BeakerIcon },
    { name: 'Videos', href: '/videos', icon: VideoCameraIcon },
    { name: 'Internships', href: '/internships', icon: BriefcaseIcon },
    { name: 'Pricing', href: '/pricing', icon: TagIcon },
  ];

  // Add admin-only links
  if (isAdmin) {
    navLinks.splice(2, 0, { name: 'Upload', href: '/upload', icon: ArrowUpTrayIcon });
    navLinks.splice(3, 0, { name: 'Review', href: '/admin/review', icon: ShieldCheckIcon });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <AcademicCapIcon className="h-8 w-8 text-accent-500" />
            <span className="text-xl font-bold text-gradient">DUXE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-1
                  ${isActive(link.href) 
                    ? 'bg-accent-100 text-accent-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3 ml-4">
            {user ? (
              // Logged in - Show Dashboard and Logout
              <>
                {isAdmin && (
                  <div className="flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-xs font-medium mr-2">
                    <ShieldCheckIcon className="h-4 w-4 mr-1" />
                    Admin
                  </div>
                )}
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    text-navy-500 hover:bg-navy-100"
                >
                  Dashboard
                </Link>
                <button
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    border-2 border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-500
                    hover:shadow-md"
                >
                  Logout
                </button>
              </>
            ) : (
              // Not logged in - Show Login and Signup
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    border-2 border-navy-500 text-navy-500 hover:bg-navy-500 hover:text-white
                    hover:shadow-md"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    bg-accent-500 text-white hover:bg-accent-600 hover:shadow-lg
                    hover:scale-105 transform flex items-center space-x-1 group"
                >
                  <span>Join for Free</span>
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t animate-slide-up">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-4 py-2 text-sm font-medium rounded-xl mb-1
                  ${isActive(link.href) 
                    ? 'bg-accent-100 text-accent-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <link.icon className="h-5 w-5" />
                  <span>{link.name}</span>
                </div>
              </Link>
            ))}
            
            {/* Auth Buttons - Mobile */}
            <div className="mt-4 pt-4 border-t space-y-2 px-4">
              {user ? (
                // Logged in - Show Dashboard and Logout
                <>
                  {isAdmin && (
                    <div className="flex items-center justify-center px-3 py-2 mb-2">
                      <div className="flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-700 text-xs font-medium">
                        <ShieldCheckIcon className="h-4 w-4 mr-1" />
                        Admin Account
                      </div>
                    </div>
                  )}
                  <Link
                    to="/dashboard"
                    className="block w-full px-4 py-2.5 rounded-xl text-sm font-medium text-center
                      bg-navy-500 text-white hover:bg-navy-600 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                      navigate('/');
                    }}
                    className="block w-full px-4 py-2.5 rounded-xl text-sm font-medium text-center
                      border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white
                      transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Not logged in - Show Login and Signup
                <>
                  <Link
                    to="/login"
                    className="block w-full px-4 py-2.5 rounded-xl text-sm font-medium text-center
                      border-2 border-navy-500 text-navy-500 hover:bg-navy-500 hover:text-white
                      transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full px-4 py-2.5 rounded-xl text-sm font-medium text-center
                      bg-accent-500 text-white hover:bg-accent-600 transition-all duration-200
                      flex items-center justify-center space-x-1 group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>Join for Free</span>
                    <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
