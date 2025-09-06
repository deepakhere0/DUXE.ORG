import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  DocumentTextIcon,
  ArrowDownTrayIcon,
  BookmarkIcon,
  ShareIcon,
  SparklesIcon,
  ListBulletIcon,
  QuestionMarkCircleIcon,
  Square3Stack3DIcon,
  StarIcon,
  ChevronLeftIcon,
  UserIcon,
  CalendarIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid, BookmarkIcon as BookmarkIconSolid } from '@heroicons/react/24/solid';
import { AIService } from '../services/aiService';
import Toast from '../components/common/Toast';

const NoteDetail = () => {
  const { noteId } = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  // Mock data - replace with Firebase query
  const note = {
    id: noteId,
    title: 'Data Structures Complete Notes',
    courseCode: 'CS201',
    university: 'MIT',
    department: 'Computer Science',
    subject: 'Data Structures',
    semester: '3rd',
    author: 'John Doe',
    authorId: 'user123',
    pages: 125,
    rating: 4.8,
    downloads: 1520,
    views: 5230,
    uploadedDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    description: 'Comprehensive notes covering all data structures topics including arrays, linked lists, stacks, queues, trees, graphs, and advanced data structures. Perfect for exam preparation and concept revision.',
    topics: ['Arrays', 'Linked Lists', 'Stacks & Queues', 'Trees', 'Graphs', 'Hashing', 'Heaps'],
    fileUrl: 'https://example.com/notes.pdf',
    previewImages: [
      'https://via.placeholder.com/600x800',
      'https://via.placeholder.com/600x800',
      'https://via.placeholder.com/600x800'
    ]
  };

  const relatedNotes = [
    { id: 2, title: 'Advanced Algorithms', courseCode: 'CS301', rating: 4.9 },
    { id: 3, title: 'Database Systems', courseCode: 'CS302', rating: 4.7 },
    { id: 4, title: 'Operating Systems', courseCode: 'CS303', rating: 4.6 }
  ];

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // Add Firebase logic to save bookmark
  };

  const handleDownload = () => {
    // Add download logic and analytics
    console.log('Downloading note:', noteId);
  };

  const handleShare = () => {
    // Add share functionality
    if (navigator.share) {
      navigator.share({
        title: note.title,
        text: note.description,
        url: window.location.href
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-navy-500 text-white">
        <div className="container-custom py-6">
          <Link to="/notes" className="inline-flex items-center text-white/80 hover:text-white mb-4">
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Notes
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="chip bg-white/20 text-white">
                  {note.courseCode}
                </span>
                <span className="text-sm text-white/80">
                  {note.university} • {note.department}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-3">{note.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-1" />
                  {note.author}
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  Updated {new Date(note.lastUpdated).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  {note.semester} Semester
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIconSolid
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(note.rating) ? 'text-yellow-400' : 'text-white/30'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/80 mt-1">{note.rating} rating</p>
              </div>
              <div className="text-center px-4 border-l border-white/20">
                <p className="text-2xl font-bold">{note.downloads}</p>
                <p className="text-xs text-white/80">Downloads</p>
              </div>
              <div className="text-center px-4 border-l border-white/20">
                <p className="text-2xl font-bold">{note.views}</p>
                <p className="text-xs text-white/80">Views</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-card mb-6">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'preview'
                        ? 'border-accent-500 text-accent-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === 'details'
                        ? 'border-accent-500 text-accent-600'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Details
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'preview' ? (
                  <div className="space-y-4">
                    {/* Preview Images */}
                    {note.previewImages.map((image, index) => (
                      <div key={index} className="bg-gray-100 rounded-xl p-4">
                        <img
                          src={image}
                          alt={`Page ${index + 1}`}
                          className="w-full rounded-lg"
                        />
                      </div>
                    ))}
                    {/* AI Actions */}
                    <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                          await AIService.summarize({ noteId, inputText: note.description, createdBy: 'local' });
                          Toast.info('Summary job created');
                        }}
                      >
                        <ListBulletIcon className="h-4 w-4 mr-1" /> AI Summary
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                          await AIService.generateMCQ({ inputText: note.description, createdBy: 'local' });
                          Toast.info('MCQ job created');
                        }}
                      >
                        <QuestionMarkCircleIcon className="h-4 w-4 mr-1" /> MCQs
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={async () => {
                          await AIService.flashcards({ inputText: note.description, createdBy: 'local' });
                          Toast.info('Flashcards job created');
                        }}
                      >
                        <Square3Stack3DIcon className="h-4 w-4 mr-1" /> Flashcards
                      </button>
                    </div>
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        This is a preview. Download the full document to access all {note.pages} pages.
                      </p>
                      <button
                        onClick={handleDownload}
                        className="btn btn-primary btn-lg"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Download Full Notes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600">{note.description}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Topics Covered</h3>
                      <div className="flex flex-wrap gap-2">
                        {note.topics.map((topic, index) => (
                          <span key={index} className="chip chip-secondary">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Document Information</h3>
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="text-gray-500">Pages</dt>
                          <dd className="font-medium text-gray-900">{note.pages}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Format</dt>
                          <dd className="font-medium text-gray-900">PDF</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Size</dt>
                          <dd className="font-medium text-gray-900">12.5 MB</dd>
                        </div>
                        <div>
                          <dt className="text-gray-500">Language</dt>
                          <dd className="font-medium text-gray-900">English</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Notes */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Related Notes</h3>
              <div className="space-y-3">
                {relatedNotes.map((related) => (
                  <Link
                    key={related.id}
                    to={`/notes/${related.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{related.title}</p>
                      <p className="text-sm text-gray-500">{related.courseCode}</p>
                    </div>
                    <div className="flex items-center">
                      <StarIconSolid className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{related.rating}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Actions */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="btn btn-primary btn-lg w-full justify-center"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Download Notes
                  </button>
                  
                  <button
                    onClick={handleBookmark}
                    className={`btn ${isBookmarked ? 'btn-primary' : 'btn-secondary'} btn-lg w-full justify-center`}
                  >
                    {isBookmarked ? (
                      <BookmarkIconSolid className="h-5 w-5 mr-2" />
                    ) : (
                      <BookmarkIcon className="h-5 w-5 mr-2" />
                    )}
                    {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                  </button>

                  <button
                    onClick={handleShare}
                    className="btn btn-secondary btn-lg w-full justify-center"
                  >
                    <ShareIcon className="h-5 w-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* AI Tools */}
              <div className="bg-gradient-to-br from-accent-50 to-navy-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <SparklesIcon className="h-5 w-5 mr-2 text-accent-600" />
                  AI Study Tools
                </h3>
                <div className="space-y-3">
                  <Link
                    to={`/tools/summarize?noteId=${noteId}`}
                    className="flex items-center p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <ListBulletIcon className="h-5 w-5 text-accent-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Generate Summary</p>
                      <p className="text-xs text-gray-500">Get key points instantly</p>
                    </div>
                  </Link>

                  <Link
                    to={`/tools/mcq?noteId=${noteId}`}
                    className="flex items-center p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <QuestionMarkCircleIcon className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Generate MCQs</p>
                      <p className="text-xs text-gray-500">Practice with AI questions</p>
                    </div>
                  </Link>

                  <Link
                    to={`/tools/flashcards?noteId=${noteId}`}
                    className="flex items-center p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                  >
                    <Square3Stack3DIcon className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Create Flashcards</p>
                      <p className="text-xs text-gray-500">Study smarter</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Author Info */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Uploaded By</h3>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-navy-100 rounded-full flex items-center justify-center">
                    <UserIcon className="h-6 w-6 text-navy-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{note.author}</p>
                    <p className="text-sm text-gray-500">15 uploads • 4.8 avg rating</p>
                  </div>
                </div>
                <Link
                  to={`/profile/${note.authorId}`}
                  className="btn btn-secondary btn-sm w-full justify-center mt-4"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteDetail;
