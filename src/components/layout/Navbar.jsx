import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  AcademicCapIcon, 
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

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Notes', href: '/notes', icon: BookOpenIcon },
    { name: 'AI Tools', href: '/tools', icon: BeakerIcon },
    { name: 'Videos', href: '/videos', icon: VideoCameraIcon },
    { name: 'Internships', href: '/internships', icon: BriefcaseIcon },
    { name: 'Upload', href: '/upload', icon: ArrowUpTrayIcon },
    { name: 'Pricing', href: '/pricing', icon: TagIcon },
  ];

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
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
