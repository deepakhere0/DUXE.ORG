import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  AcademicCapIcon, 
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BookOpenIcon,
  BeakerIcon,
  VideoCameraIcon,
  BriefcaseIcon,
  ArrowUpTrayIcon,
  HomeIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import Badge from '../common/Badge';

const Navbar = () => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Notes', href: '/notes', icon: BookOpenIcon },
    { name: 'AI Tools', href: '/tools', icon: BeakerIcon },
    { name: 'Videos', href: '/videos', icon: VideoCameraIcon },
    { name: 'Internships', href: '/internships', icon: BriefcaseIcon },
    { name: 'Pricing', href: '/pricing', icon: TagIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

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

            {currentUser && (
              <Link
                to="/upload"
                className="ml-2 px-3 py-2 rounded-xl text-sm font-medium bg-navy-600 text-white hover:bg-navy-700 transition-all duration-200 flex items-center space-x-1"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                <span>Upload</span>
              </Link>
            )}
          </div>

          {/* Right Section */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                >
                  <UserCircleIcon className="h-8 w-8" />
                  <span className="text-sm font-medium">
                    {userProfile?.displayName || currentUser.email}
                  </span>
                  <ChevronDownIcon className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 animate-slide-up">
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="btn btn-secondary btn-sm"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
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

            {currentUser && (
              <Link
                to="/upload"
                className="block px-4 py-2 text-sm font-medium bg-navy-600 text-white rounded-xl mb-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <ArrowUpTrayIcon className="h-5 w-5" />
                  <span>Upload Notes</span>
                </div>
              </Link>
            )}

            <div className="mt-4 pt-4 border-t">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="px-4 space-y-2">
                  <Link
                    to="/login"
                    className="btn btn-secondary btn-md w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary btn-md w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
