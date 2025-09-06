import React from 'react';
import { Link } from 'react-router-dom';
import { 
  AcademicCapIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    'Quick Links': [
      { name: 'Notes Portal', href: '/notes' },
      { name: 'AI Tools', href: '/tools' },
      { name: 'Video Lectures', href: '/videos' },
      { name: 'Internships', href: '/internships' },
    ],
    Services: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Blog', href: '/blog' },
    ],
    About: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    Support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Guidelines', href: '/guidelines' },
      { name: 'Report Issue', href: '/report' },
      { name: 'Feedback', href: '/feedback' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', href: '#', icon: 'fb' },
    { name: 'Twitter', href: '#', icon: 'tw' },
    { name: 'Instagram', href: '#', icon: 'ig' },
    { name: 'LinkedIn', href: '#', icon: 'li' },
  ];

  return (
    <footer className="bg-navy-600 text-white mt-auto">
      <div className="container-custom py-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <AcademicCapIcon className="h-8 w-8 text-accent-500" />
              <span className="text-xl font-bold">StudyHub</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">
              Empowering students with premium study materials, AI-powered tools, and career opportunities.
            </p>
            <div className="flex space-x-3 mb-6">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-accent-500 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <span className="text-xs font-bold">{social.icon}</span>
                </a>
              ))}
            </div>
            {/* Newsletter */}
            <div className="bg-white/10 rounded-xl p-4">
              <h3 className="font-semibold text-accent-300 mb-2">Newsletter</h3>
              <p className="text-sm text-gray-200 mb-3">Get study tips and platform updates.</p>
              <form className="flex flex-col sm:flex-row gap-2">
                <input type="email" placeholder="you@example.com" className="w-full px-4 py-2 rounded-xl text-gray-900" />
                <button type="submit" className="btn btn-subtle btn-md">Subscribe</button>
              </form>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-accent-400 mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-white/10 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-5 w-5 text-accent-400" />
              <span>support@studyhub.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-5 w-5 text-accent-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-5 w-5 text-accent-400" />
              <span>123 Education Ave, Learning City</span>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-300">
              © {currentYear} StudyHub. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-300 hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-300 hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-300 hover:text-white transition-colors duration-200">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
