import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NavbarDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

const menuItems = [
  { label: 'Popular', path: '/movies/popular', icon: '⭐' },
  { label: 'Now Playing', path: '/movies/now-playing', icon: '🎬' },
  { label: 'Upcoming', path: '/movies/upcoming', icon: '🎯' },
  { label: 'Top Rated', path: '/movies/top-rated', icon: '🏆' },
  { label: 'Mood Movies', path: '/movies/mood-based', icon: '🎭' }
];


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-white hover:text-indigo-400 transition-colors"
      >
        <span className="font-semibold">Movies</span>
        <ChevronDown 
          size={18} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl overflow-hidden z-50">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(item.path)}
              className="w-full px-4 py-3 text-left flex items-center gap-3 text-white hover:bg-slate-800 transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavbarDropdown;