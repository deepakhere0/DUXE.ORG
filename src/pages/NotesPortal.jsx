import React, { useState, useEffect } from 'react';
import UniversityDropdown from '../components/notes/UniversityDropdown';
import DepartmentDropdown from '../components/notes/DepartmentDropdown';
import SemesterDropdown from '../components/notes/SemesterDropdown';
import SearchBar from '../components/notes/SearchBar';
import NoteCard from '../components/notes/NoteCard';
import { notesService } from '../services/notesService';
import NotePreviewModal from '../components/notes/NotePreviewModal';

const NotesPage = () => {
  // Filters and state
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Notes data
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Preview modal state
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalUniversities: 0,
    totalDepartments: 0,
    totalDownloads: 0
  });

  // Load initial stats
  useEffect(() => {
    const loadStats = async () => {
      const data = await notesService.getNotesStats();
      setStats(data);
    };
    loadStats();
  }, []);

  // Fetch notes whenever filters change
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      
      try {
        const filters = {
          universityId: selectedUniversity?.id || null,
          departmentId: selectedDepartment?.id || null,
          semester: selectedSemester?.value || null
        };

        let result;
        if (searchQuery) {
          result = await notesService.searchNotes(searchQuery, filters, null, 20);
        } else {
          result = await notesService.getNotes(filters, null, 20);
        }
        
        setNotes(result.notes);
        setHasMore(result.hasMore);
        setLastDoc(result.lastDoc);
      } catch (error) {
        console.error('Error fetching notes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [selectedUniversity, selectedDepartment, selectedSemester, searchQuery]);

  // Load more notes
  const loadMoreNotes = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    
    try {
      const filters = {
        universityId: selectedUniversity?.id || null,
        departmentId: selectedDepartment?.id || null,
        semester: selectedSemester?.value || null
      };

      let result;
      if (searchQuery) {
        result = await notesService.searchNotes(searchQuery, filters, lastDoc, 20);
      } else {
        result = await notesService.getNotes(filters, lastDoc, 20);
      }

      setNotes(prev => [...prev, ...result.notes]);
      setHasMore(result.hasMore);
      setLastDoc(result.lastDoc);
    } catch (error) {
      console.error('Error loading more notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    switch (suggestion.type) {
      case 'university':
        setSelectedUniversity(suggestion.data);
        setSelectedDepartment(null);
        break;
      case 'department':
        setSelectedUniversity({ id: suggestion.data.uniId, shortName: suggestion.data.uniName });
        setSelectedDepartment(suggestion.data);
        break;
      case 'note':
        setSearchQuery(suggestion.title);
        break;
    }
  };

  // Handle download
  const handleDownload = async (note) => {
    try {
      await notesService.downloadNote(note.id);
      // Simulate download
      if (note.fileUrl) {
        window.open(note.fileUrl, '_blank');
      }
    } catch (error) {
      console.error('Error downloading note:', error);
    }
  };

  // Handle view/preview
  const handleView = async (note) => {
    setSelectedNote(note);
    setIsPreviewOpen(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedUniversity(null);
    setSelectedDepartment(null);
    setSelectedSemester(null);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Notes Library</h1>
          <p className="mt-2 text-gray-600">Find notes by university, department, semester, or search by subject and course code.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Total Notes</div>
            <div className="text-2xl font-semibold">{stats.totalNotes}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Universities</div>
            <div className="text-2xl font-semibold">{stats.totalUniversities}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Departments</div>
            <div className="text-2xl font-semibold">{stats.totalDepartments}</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="text-sm text-gray-500">Total Downloads</div>
            <div className="text-2xl font-semibold">{stats.totalDownloads}</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar 
            onSearch={handleSearch}
            onSuggestionSelect={handleSuggestionSelect}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UniversityDropdown 
              selectedUniversity={selectedUniversity}
              onUniversityChange={(uni) => {
                setSelectedUniversity(uni);
                setSelectedDepartment(null);
              }}
            />
            <DepartmentDropdown 
              selectedUniversity={selectedUniversity}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
            />
            <SemesterDropdown 
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
            />
          </div>
          
          {/* Clear Filters */}
          <div className="mt-4">
            <button
              onClick={clearFilters}
              className="text-accent-600 hover:text-accent-700 text-sm"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Notes Results */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && notes.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
            ))
          ) : notes.length === 0 ? (
            <div className="col-span-3 text-center py-12">
              <div className="text-2xl font-semibold text-gray-700 mb-2">No notes found</div>
              <p className="text-gray-600">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            notes.map((note) => (
              <NoteCard 
                key={note.id}
                note={note}
                onDownload={handleDownload}
                onView={handleView}
              />
            ))
          )}
        </div>

        {/* Load More */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMoreNotes}
              disabled={loading}
              className="px-6 py-3 bg-accent-600 hover:bg-accent-700 text-white rounded-lg shadow-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load more notes'}
            </button>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <NotePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setSelectedNote(null);
        }}
        note={selectedNote}
      />
    </div>
  );
};

export default NotesPage;
