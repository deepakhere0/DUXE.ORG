import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const SemesterDropdown = ({ 
  selectedSemester, 
  onSemesterChange,
  placeholder = "Select Semester",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Semester options (1-8)
  const semesterOptions = [
    { id: 1, name: '1st Semester', shortName: 'Sem 1', value: 1, year: 1 },
    { id: 2, name: '2nd Semester', shortName: 'Sem 2', value: 2, year: 1 },
    { id: 3, name: '3rd Semester', shortName: 'Sem 3', value: 3, year: 2 },
    { id: 4, name: '4th Semester', shortName: 'Sem 4', value: 4, year: 2 },
    { id: 5, name: '5th Semester', shortName: 'Sem 5', value: 5, year: 3 },
    { id: 6, name: '6th Semester', shortName: 'Sem 6', value: 6, year: 3 },
    { id: 7, name: '7th Semester', shortName: 'Sem 7', value: 7, year: 4 },
    { id: 8, name: '8th Semester', shortName: 'Sem 8', value: 8, year: 4 }
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

  const handleSemesterSelect = (semester) => {
    onSemesterChange(semester);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const getYearColor = (year) => {
    const colors = {
      1: 'bg-green-100 text-green-800',
      2: 'bg-blue-100 text-blue-800',
      3: 'bg-purple-100 text-purple-800',
      4: 'bg-orange-100 text-orange-800'
    };
    return colors[year] || 'bg-gray-100 text-gray-800';
  };

  // Group semesters by year
  const groupedSemesters = semesterOptions.reduce((acc, semester) => {
    const year = semester.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(semester);
    return acc;
  }, {});

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Semester
      </label>
      
      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        className={`
          w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg
          hover:border-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-accent-500
          transition-colors duration-200 ${isOpen ? 'ring-2 ring-accent-500 border-accent-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          {selectedSemester ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-900">{selectedSemester.shortName}</span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getYearColor(selectedSemester.year)}`}>
                Year {selectedSemester.year}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Header */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Select Academic Semester
              </span>
            </div>
          </div>

          {/* Semesters List */}
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(groupedSemesters).map(([year, yearSemesters]) => (
              <div key={year}>
                {/* Year Header */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">
                      Year {year}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getYearColor(parseInt(year))}`}>
                      {yearSemesters.length} semesters
                    </span>
                  </div>
                </div>
                
                {/* Year Semesters */}
                {yearSemesters.map((semester) => (
                  <button
                    key={semester.id}
                    onClick={() => handleSemesterSelect(semester)}
                    className={`
                      w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50
                      transition-colors duration-200 border-b border-gray-100 last:border-b-0
                      ${selectedSemester?.id === semester.id ? 'bg-accent-50 border-accent-200' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${selectedSemester?.id === semester.id 
                            ? 'bg-accent-500 text-white' 
                            : 'bg-gray-200 text-gray-700'}
                        `}>
                          {semester.value}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{semester.name}</div>
                          <div className="text-sm text-gray-600">
                            Academic Year {semester.year}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedSemester?.id === semester.id && (
                          <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
                        )}
                        <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-600 text-center">
              Standard 4-year degree program (8 semesters)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SemesterDropdown;