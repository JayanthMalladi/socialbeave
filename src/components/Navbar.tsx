import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  isChatbotOpen?: boolean;
}

export function Navbar({ isChatbotOpen }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      className={`fixed top-0 left-0 right-0 h-16 z-30 transition-all duration-300
                ${isChatbotOpen ? 'bg-white/50 backdrop-blur-xl' : 'bg-white'}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src="https://imgur.com/7fDQF34.png" 
                alt="socialBeaver Logo" 
                className="object-contain rounded-full bg-white p-1 border border-gray-100"
                style={{ width: '3.75rem', height: '3.75rem' }}
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                social<span className="text-green-600">Beaver.</span>
              </span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors duration-200
                       ${isChatbotOpen ? 'text-gray-600 hover:text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className={`text-sm font-medium transition-colors duration-200
                       ${isChatbotOpen ? 'text-gray-600 hover:text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/about"
              className={`text-sm font-medium transition-colors duration-200
                       ${isChatbotOpen ? 'text-gray-600 hover:text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              About
            </Link>
            <Link 
              to="/team"
              className={`text-sm font-medium transition-colors duration-200 flex items-center gap-2
                       ${isChatbotOpen ? 'text-gray-600 hover:text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="w-4 h-4" />
              <span>Meet the Devs</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0
          }}
          transition={{ duration: 0.2 }}
          className="md:hidden absolute left-0 right-0 bg-white shadow-lg overflow-hidden"
        >
          <div className="px-4 py-2 space-y-2">
            <Link 
              to="/" 
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/dashboard" 
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              to="/about"
              className="block py-2 text-gray-600 hover:text-gray-900"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/team"
              className="block py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              onClick={() => setIsMenuOpen(false)}
            >
              <Users className="w-4 h-4" />
              <span>Meet the Devs</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
}