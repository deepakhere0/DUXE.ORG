import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  StarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  SparklesIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import FilterBar from '../components/common/FilterBar';
import NoteCard from '../components/common/NoteCard';

const Notes = () => {
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('popular');

  // Mock data - replace with Firebase queries
  const universities = ['MIT', 'Harvard', 'Stanford', 'Yale', 'Princeton'];
  const departments = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology'];
  const subjects = ['Data Structures', 'Algorithms', 'Calculus', 'Linear Algebra', 'Discrete Math'];
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

  const mockNotes = [
    {
      id: 1,
      title: 'Data Structures Complete Notes',
      courseCode: 'CS201',
      university: 'MIT',
      department: 'Computer Science',
      subject: 'Data Structures',
      semester: '3rd',
      author: 'John Doe',
      pages: 125,
      rating: 4.8,
      downloads: 1520,
      uploadedDate: '2024-01-15',
      thumbnail: 'https://via.placeholder.com/200x300',
      description: 'Comprehensive notes covering all data structures topics'
    },
    {
      id: 2,
      title: 'Advanced Algorithms Study Guide',
      courseCode: 'CS301',
      university: 'Stanford',
      department: 'Computer Science',
      subject: 'Algorithms',
      semester: '4th',
      author: 'Jane Smith',
      pages: 98,
      rating: 4.9,
      downloads: 2100,
      uploadedDate: '2024-01-20',
      thumbnail: 'https://via.placeholder.com/200x300',
      description: 'In-depth analysis of advanced algorithmic concepts'
    },
    {
      id: 3,
      title: 'Calculus III Complete Solutions',
      courseCode: 'MATH301',
      university: 'Harvard',
      department: 'Mathematics',
      subject: 'Calculus',
      semester: '3rd',
      author: 'Mike Johnson',
      pages: 210,
      rating: 4.7,
      downloads: 890,
      uploadedDate: '2024-01-18',
      thumbnail: 'https://via.placeholder.com/200x300',
      description: 'Step-by-step solutions for Calculus III problems'
    },
    // Add more mock notes as needed
  ];

  const [filteredNotes, setFilteredNotes] = useState(mockNotes);

  useEffect(() => {
    let filtered = [...mockNotes];

    // Apply filters
    const queryText = filters.query || '';
    if (queryText) {
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(queryText.toLowerCase()) ||
        note.description.toLowerCase().includes(queryText.toLowerCase()) ||
        note.courseCode.toLowerCase().includes(queryText.toLowerCase())
      );
    }

    if (filters.universityId) {
      filtered = filtered.filter(note => note.university === filters.universityId);
    }

    if (filters.departmentId) {
      filtered = filtered.filter(note => note.department === filters.departmentId);
    }

    if (filters.semester) {
      filtered = filtered.filter(note => note.semester === filters.semester);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.uploadedDate) - new Date(a.uploadedDate));
        break;
      default:
        break;
    }

    setFilteredNotes(filtered);
  }, [searchQuery, selectedUniversity, selectedDepartment, selectedSubject, selectedSemester, sortBy]);

  const clearFilters = () => {
    setFilters({});
    setSortBy('popular');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-500 text-white py-12">
        <div className="container-custom">
          <h1 className="text-4xl font-bold mb-4">Notes Portal</h1>
          <p className="text-lg text-gray-200">
            Access thousands of high-quality study materials from top universities
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Filters */}
        <FilterBar
          filters={filters}
          onChange={setFilters}
          universities={universities.map((u) => ({ value: u, label: u }))}
          departments={departments.map((d) => ({ value: d, label: d }))}
        />
        {/* Sort Dropdown */}
        <div className="flex justify-end mb-6">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-full md:w-48"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredNotes.length}</span> notes
          </p>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note.id}
              meta={{
                id: note.id,
                title: note.title,
                courseCode: note.courseCode,
                subject: note.subject,
                semester: note.semester,
                universityName: note.university,
                departmentName: note.department,
                pages: note.pages,
                downloads: note.downloads,
                status: 'approved',
                authorName: note.author,
                ratingAvg: note.rating,
              }}
              onPreview={() => (window.location.href = `/notes/${note.id}`)}
              onDownload={() => console.log('download', note.id)}
              onBookmark={() => console.log('bookmark', note.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredNotes.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary btn-md"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {filteredNotes.length > 0 && (
          <div className="text-center mt-12">
            <button className="btn btn-secondary btn-lg">
              Load More Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
