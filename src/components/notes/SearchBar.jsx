import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy, limit, startAt, endAt } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { debounce } from 'lodash';

const SearchBar = ({ 
  onSearch, 
  onSuggestionSelect,
  placeholder = "Search by subject, course code, university, or department...",
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const searchSuggestions = await Promise.all([
          searchUniversities(query),
          searchDepartments(query),
          searchNotes(query)
        ]);

        const combinedSuggestions = [
          ...searchSuggestions[0],
          ...searchSuggestions[1],
          ...searchSuggestions[2]
        ].slice(0, 10); // Limit to 10 suggestions

        setSuggestions(combinedSuggestions);
        setShowSuggestions(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Search universities
  const searchUniversities = async (query) => {
    try {
      const normalizedQuery = query.toLowerCase();
      const q = query(
        collection(db, 'universities'),
        where('active', '==', true),
        orderBy('shortName'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const results = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.name.toLowerCase().includes(normalizedQuery) ||
          data.shortName.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: doc.id,
            type: 'university',
            title: data.shortName,
            subtitle: data.name,
            icon: '🏫',
            data: { id: doc.id, ...data }
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Error searching universities:', error);
      return [];
    }
  };

  // Search departments
  const searchDepartments = async (query) => {
    try {
      const normalizedQuery = query.toLowerCase();
      const q = query(
        collection(db, 'departments'),
        where('active', '==', true),
        orderBy('name'),
        limit(3)
      );

      const snapshot = await getDocs(q);
      const results = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.name.toLowerCase().includes(normalizedQuery) ||
          data.shortName.toLowerCase().includes(normalizedQuery) ||
          data.code.toLowerCase().includes(normalizedQuery)
        ) {
          results.push({
            id: doc.id,
            type: 'department',
            title: data.shortName,
            subtitle: `${data.name} - ${data.uniName}`,
            icon: getCategoryIcon(data.category),
            data: { id: doc.id, ...data }
          });
        }
      });

      return results;
    } catch (error) {
      console.error('Error searching departments:', error);
      return [];
    }
  };

  // Search notes
  const searchNotes = async (query) => {
    try {
      const normalizedQuery = query.toLowerCase();
      
      // Search by title and course code
      const titleQuery = query(
        collection(db, 'notes'),
        where('status', '==', 'approved'),
        orderBy('title'),
        startAt(query),
        endAt(query + '\uf8ff'),
        limit(4)
      );

      const snapshot = await getDocs(titleQuery);
      const results = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        results.push({
          id: doc.id,
          type: 'note',
          title: data.title,
          subtitle: `${data.courseCode} - ${data.departmentName || 'Unknown Dept'}`,
          icon: '📄',
          data: { id: doc.id, ...data }
        });
      });

      return results;
    } catch (error) {
      console.error('Error searching notes:', error);
      return [];
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'engineering': '⚙️',
      'sciences': '🔬',
      'management': '💼',
      'arts': '🎨',
      'law': '⚖️',
      'medical': '🏥'
    };
    return icons[category] || '📚';
  };

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion.title);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else {
          handleSearch(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Clear search
  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('');
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionTypeColor = (type) => {
    const colors = {
      'university': 'bg-blue-100 text-blue-800',
      'department': 'bg-green-100 text-green-800',
      'note': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => searchQuery && setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 bg-white border border-gray-300 rounded-xl 
                     focus:ring-2 focus:ring-accent-500 focus:border-accent-500
                     text-gray-900 placeholder-gray-500 text-lg
                     shadow-sm hover:shadow-md transition-shadow duration-200"
          />
          
          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 
                       text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search Button (Hidden - form submission handles search) */}
        <button type="submit" className="sr-only">Search</button>
      </form>

      {/* Search Suggestions */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-80 overflow-hidden"
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-500"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No suggestions found. Try a different search term.
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {/* Header */}
              <div className="p-3 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium text-gray-700">
                  Search Suggestions ({suggestions.length})
                </div>
              </div>

              {/* Suggestions List */}
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.id}`}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`
                    w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50
                    transition-colors duration-200 border-b border-gray-100 last:border-b-0
                    ${index === selectedIndex ? 'bg-accent-50 border-accent-200' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <span className="text-xl">{suggestion.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {suggestion.title}
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {suggestion.subtitle}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSuggestionTypeColor(suggestion.type)}`}>
                      {suggestion.type}
                    </span>
                  </div>
                </button>
              ))}

              {/* Search All Results Footer */}
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={handleSearch}
                  className="w-full text-center text-sm text-accent-600 hover:text-accent-700 font-medium"
                >
                  Press Enter or click here to search all results for "{searchQuery}"
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;