import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';

const DepartmentDropdown = ({ 
  selectedDepartment, 
  onDepartmentChange,
  selectedUniversity,
  placeholder = "Select Department",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Fetch departments when university changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!selectedUniversity) {
        setDepartments([]);
        setFilteredDepartments([]);
        return;
      }

      setLoading(true);
      try {
        const q = query(
          collection(db, 'departments'),
          where('uniId', '==', selectedUniversity.id),
          where('active', '==', true),
          orderBy('name', 'asc')
        );
        
        const snapshot = await getDocs(q);
        const departmentsData = [];
        
        snapshot.forEach((doc) => {
          departmentsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setDepartments(departmentsData);
        setFilteredDepartments(departmentsData);
        
        // Clear selected department if it doesn't belong to new university
        if (selectedDepartment && selectedDepartment.uniId !== selectedUniversity.id) {
          onDepartmentChange(null);
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [selectedUniversity, selectedDepartment, onDepartmentChange]);

  // Filter departments based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDepartments(departments);
      return;
    }

    const filtered = departments.filter(dept => 
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredDepartments(filtered);
  }, [searchQuery, departments]);

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

  const handleDepartmentSelect = (department) => {
    onDepartmentChange(department);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    if (!selectedUniversity) return;
    
    setIsOpen(true);
    // Focus search input when dropdown opens
    setTimeout(() => {
      searchRef.current?.focus();
    }, 100);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'engineering': 'bg-blue-100 text-blue-800',
      'sciences': 'bg-green-100 text-green-800',
      'management': 'bg-purple-100 text-purple-800',
      'arts': 'bg-yellow-100 text-yellow-800',
      'law': 'bg-red-100 text-red-800',
      'medical': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'engineering': return '⚙️';
      case 'sciences': return '🔬';
      case 'management': return '💼';
      case 'arts': return '🎨';
      case 'law': return '⚖️';
      case 'medical': return '🏥';
      default: return '📚';
    }
  };

  // Group departments by category
  const groupedDepartments = filteredDepartments.reduce((acc, dept) => {
    const category = dept.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dept);
    return acc;
  }, {});

  const isDisabled = !selectedUniversity || loading;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Department
      </label>
      
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={isDisabled}
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg
          hover:border-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500
          transition-colors duration-200 
          ${isOpen ? 'ring-2 ring-accent-500 border-accent-500' : ''}
          ${isDisabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          {selectedDepartment ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{selectedDepartment.shortName}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(selectedDepartment.category)}`}>
                {getCategoryIcon(selectedDepartment.category)} {selectedDepartment.category}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">
              {!selectedUniversity 
                ? 'Select university first' 
                : loading 
                ? 'Loading departments...' 
                : placeholder}
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
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
              />
            </div>
          </div>

          {/* Departments List */}
          <div className="max-h-60 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading departments...
              </div>
            ) : filteredDepartments.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? 'No departments found matching your search.' : 'No departments available for this university.'}
              </div>
            ) : (
              Object.entries(groupedDepartments).map(([category, categoryDepartments]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getCategoryIcon(category)}</span>
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category} ({categoryDepartments.length})
                      </span>
                    </div>
                  </div>
                  
                  {/* Category Departments */}
                  {categoryDepartments.map((department) => (
                    <button
                      key={department.id}
                      onClick={() => handleDepartmentSelect(department)}
                      className={`
                        w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50
                        transition-colors duration-200 border-b border-gray-100 last:border-b-0
                        ${selectedDepartment?.id === department.id ? 'bg-accent-50 border-accent-200' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{department.shortName}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {department.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Code: {department.code}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AcademicCapIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDropdown;