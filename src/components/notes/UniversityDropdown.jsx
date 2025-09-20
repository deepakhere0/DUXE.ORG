import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, orderBy, where, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';

const UniversityDropdown = ({ 
  selectedUniversity, 
  onUniversityChange, 
  placeholder = "Select University",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch universities from Firestore
  useEffect(() => {
    const fetchUniversities = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'universities'),
          where('active', '==', true),
          orderBy('shortName', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const universitiesData = [];
        
        snapshot.forEach((doc) => {
          universitiesData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setUniversities(universitiesData);
        setFilteredUniversities(universitiesData);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  // Filter universities based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUniversities(universities);
      return;
    }

    const filtered = universities.filter(uni => 
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredUniversities(filtered);
  }, [searchQuery, universities]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUniversitySelect = (university) => {
    onUniversityChange(university);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Focus search input when dropdown opens
    setTimeout(() => {
      searchRef.current?.focus();
    }, 100);
  };

  const getUniversityTypeColor = (type) => {
    const colors = {
      'IIT': 'bg-blue-100 text-blue-800',
      'NIT': 'bg-green-100 text-green-800',
      'IIIT': 'bg-purple-100 text-purple-800',
      'Private': 'bg-orange-100 text-orange-800',
      'Central': 'bg-red-100 text-red-800',
      'State': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        University
      </label>
      
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg
          hover:border-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500
          transition-colors duration-200 ${isOpen ? 'ring-2 ring-accent-500 border-accent-500' : ''}
        `}
        disabled={loading}
      >
        <div className="flex items-center justify-between">
          {selectedUniversity ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{selectedUniversity.shortName}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUniversityTypeColor(selectedUniversity.type)}`}>
                {selectedUniversity.type}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">
              {loading ? 'Loading universities...' : placeholder}
            </span>
          )}
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search universities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          {/* Universities List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading universities...
              </div>
            ) : filteredUniversities.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No universities found matching your search.' : 'No universities available.'}
              </div>
            ) : (
              filteredUniversities.map((university) => (
                <button
                  key={university.id}
                  onClick={() => handleUniversitySelect(university)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50
                    transition-colors duration-200 border-b border-gray-100 last:border-b-0
                    ${selectedUniversity?.id === university.id ? 'bg-accent-50 border-accent-200' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{university.shortName}</div>
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {university.name}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUniversityTypeColor(university.type)}`}>
                      {university.type}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityDropdown;