import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Notes as NotesService, Universities, Departments } from '../services/firestoreData';
import { useAuth } from '../contexts/AuthContext';
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
import LazyNoteCard from '../components/common/LazyNoteCard';
import { SkeletonCard } from '../components/common/Skeleton';
import NotePreviewModal from '../components/notes/NotePreviewModal';

const Notes = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('popular');
  const [page, setPage] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const notesPerPage = 12;
  
  // Fetch universities and departments from Firestore
  const { data: universities = [] } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      const unis = await Universities.list();
      return unis.map(u => ({ value: u.id, label: u.name }));
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
  });
  
  const { data: departments = [] } = useQuery({
    queryKey: ['departments', filters.universityId],
    queryFn: async () => {
      if (!filters.universityId) {
        const depts = await Departments.list();
        return depts.map(d => ({ value: d.id, label: d.name }));
      }
      const depts = await Departments.getByUniversity(filters.universityId);
      return depts.map(d => ({ value: d.id, label: d.name }));
    },
    staleTime: 30 * 60 * 1000,
  });
  
  const semesters = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];


  // Fetch notes from Firestore with filters and pagination
  const { data: notesData = { notes: [], hasMore: false }, isLoading, error, refetch } = useQuery({
    queryKey: ['notes', filters, sortBy, page],
    queryFn: async () => {
      try {
        // Build Firestore query
        let q = query(collection(db, 'notes'));
        
        // Only show approved notes for normal users, admins can see all
        if (!isAdmin) {
          q = query(q, where('status', '==', 'approved'));
        }
        
        // Apply filters
        if (filters.universityId) {
          q = query(q, where('universityId', '==', filters.universityId));
        }
        
        if (filters.departmentId) {
          q = query(q, where('departmentId', '==', filters.departmentId));
        }
        
        if (filters.semester) {
          q = query(q, where('semester', '==', filters.semester));
        }
        
        // Apply sorting
        switch (sortBy) {
          case 'popular':
            q = query(q, orderBy('downloads', 'desc'));
            break;
          case 'rating':
            q = query(q, orderBy('ratingAvg', 'desc'));
            break;
          case 'newest':
            q = query(q, orderBy('createdAt', 'desc'));
            break;
          default:
            q = query(q, orderBy('downloads', 'desc'));
        }
        
        // Apply pagination
        q = query(q, limit(notesPerPage + 1));
        
        if (page > 1 && lastVisible) {
          q = query(q, startAfter(lastVisible));
        }
        
        const snapshot = await getDocs(q);
        const notesList = [];
        
        snapshot.forEach((doc, index) => {
          if (index < notesPerPage) {
            notesList.push({ id: doc.id, ...doc.data() });
          }
        });
        
        // Set last visible document for pagination
        if (notesList.length > 0) {
          setLastVisible(snapshot.docs[Math.min(notesPerPage - 1, snapshot.docs.length - 1)]);
        }
        
        // Check if there are more pages
        const hasMore = snapshot.docs.length > notesPerPage;
        
        // Apply text search client-side (for now)
        let filtered = notesList;
        const queryText = filters.query || '';
        if (queryText) {
          filtered = notesList.filter(note => 
            (note.title?.toLowerCase() || '').includes(queryText.toLowerCase()) ||
            (note.description?.toLowerCase() || '').includes(queryText.toLowerCase()) ||
            (note.courseCode?.toLowerCase() || '').includes(queryText.toLowerCase()) ||
            (note.subject?.toLowerCase() || '').includes(queryText.toLowerCase())
          );
        }
        
        return { notes: filtered, hasMore };
      } catch (err) {
        console.error('Error fetching notes:', err);
        // Return empty array on error
        return { notes: [], hasMore: false };
      }
    },
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
  
  const filteredNotes = notesData.notes;

  const clearFilters = () => {
    setFilters({});
    setSortBy('popular');
    setPage(1);
    setLastVisible(null);
  };
  
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };
  
  const handlePageReset = () => {
    setPage(1);
    setLastVisible(null);
  };
  
  // Reset page when filters or sort changes
  useEffect(() => {
    handlePageReset();
  }, [filters, sortBy]);

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
          universities={universities}
          departments={departments}
        />
        {/* Sort Dropdown */}
        <div className="flex justify-end mb-6">
          <label htmlFor="sort-select" className="sr-only">Sort by</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-full md:w-48 min-h-[44px] text-base"
            aria-label="Sort notes by"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* Results Count */}
        {!isLoading && (
          <div className="mb-6" role="status" aria-live="polite">
            <p className="text-gray-600">
              {filteredNotes.length > 0 ? (
                <>Showing <span className="font-semibold text-gray-900">{filteredNotes.length}</span> notes
                {notesData.hasMore && ' (more available)'}</>
              ) : (
                'No notes found'
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12" role="alert">
            <p className="text-red-600">Error loading notes. Please try again.</p>
          </div>
        )}

        {/* Notes Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotes.map((note) => (
              <LazyNoteCard
                key={note.id}
                meta={{
                  id: note.id,
                  title: note.title || 'Untitled',
                  courseCode: note.courseCode || 'N/A',
                  subject: note.subject || '',
                  semester: note.semester || '',
                  universityName: note.universityName || note.university || '',
                  departmentName: note.departmentName || note.department || '',
                  pages: note.pages || 0,
                  downloads: note.downloads || 0,
                  status: note.status || 'approved',
                  authorName: note.authorName || 'Anonymous',
                  ratingAvg: note.ratingAvg || note.rating || 0,
                  fileUrl: note.fileUrl || '',
                  thumbnailUrl: note.thumbnailUrl || 'https://via.placeholder.com/200x300',
                  price: note.price || 0,
                }}
                userId={user?.uid}
                onPreview={() => {
                  setSelectedNote(note);
                  setIsPreviewOpen(true);
                }}
    onDownload={() => console.log('download', note.id)}
                onBookmark={() => console.log('bookmark', note.id)}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNotes.length === 0 && (
          <div className="text-center py-12" role="status">
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={clearFilters}
              className="btn btn-primary btn-md min-h-[44px]"
              aria-label="Clear all filters"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && filteredNotes.length > 0 && notesData.hasMore && (
          <div className="text-center mt-12">
            <button 
              onClick={handleLoadMore}
              className="btn btn-secondary btn-lg min-h-[44px]"
              aria-label="Load more notes"
            >
              Load More Notes
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

export default Notes;
