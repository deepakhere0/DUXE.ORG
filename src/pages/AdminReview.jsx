import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import { 
  ShieldCheckIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AdminReview = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin && user) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
    }
  }, [isAdmin, user, navigate]);

  // Fetch notes based on filter
  useEffect(() => {
    if (isAdmin) {
      fetchNotes();
    }
  }, [isAdmin, filter]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      let q;
      if (filter === 'all') {
        q = query(collection(db, 'notes'));
      } else {
        q = query(collection(db, 'notes'), where('status', '==', filter));
      }
      
      const querySnapshot = await getDocs(q);
      const notesData = [];
      querySnapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by creation date (newest first)
      notesData.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      setNotes(notesData);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to fetch notes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (noteId) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), {
        status: 'approved',
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Note approved successfully');
      fetchNotes();
    } catch (error) {
      console.error('Error approving note:', error);
      toast.error('Failed to approve note');
    }
  };

  const handleReject = async (noteId) => {
    try {
      await updateDoc(doc(db, 'notes', noteId), {
        status: 'rejected',
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Note rejected');
      fetchNotes();
    } catch (error) {
      console.error('Error rejecting note:', error);
      toast.error('Failed to reject note');
    }
  };


  const handleDelete = async (noteId, fileUrl, filePath) => {
    if (!window.confirm('Are you sure you want to permanently delete this note?')) {
      return;
    }

    console.log('🗑️ Deleting note:', { noteId, fileUrl, filePath });
    setDeletingId(noteId);

    try {
      // Delete file from storage if it exists
      if (fileUrl || filePath) {
        try {
          let storagePath = filePath;
          
          // If no filePath provided, extract from URL
          if (!storagePath && fileUrl) {
            // Extract path from Firebase Storage URL
            // URL format: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/PATH?alt=media&token=...
            const urlMatch = fileUrl.match(/\/o\/([^?]+)/);
            if (urlMatch) {
              storagePath = decodeURIComponent(urlMatch[1]);
            }
          }
          
          if (storagePath) {
            console.log('📂 Storage path:', storagePath);
            const storageRef = ref(storage, storagePath);
            await deleteObject(storageRef);
            console.log('✅ File deleted from storage');
          } else {
            console.warn('⚠️ Could not determine storage path, skipping file deletion');
          }
        } catch (storageError) {
          console.error('❌ Error deleting file from storage:', storageError);
          // Continue with Firestore deletion even if storage deletion fails
        }
      }
      
      // Delete document from Firestore
      console.log('🗑️ Deleting Firestore document...');
      await deleteDoc(doc(db, 'notes', noteId));
      console.log('✅ Document deleted from Firestore');
      
      toast.success('Note deleted permanently');
      await fetchNotes();
    } catch (error) {
      console.error('❌ Error deleting note:', error);
      toast.error('Failed to delete note: ' + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <ShieldCheckIcon className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page.
          </p>
          <button 
            onClick={() => navigate('/')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center mb-2">
                <ShieldCheckIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Admin Review Panel</h1>
              </div>
              <p className="text-gray-600">Manage and review uploaded notes</p>
            </div>
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Upload New Note
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-white rounded-lg shadow-sm p-1">
            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  filter === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' && notes.filter(n => n.status === 'pending').length > 0 && (
                  <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
                    {notes.filter(n => n.status === 'pending').length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-600">
              {filter === 'pending' 
                ? 'No notes are waiting for review'
                : `No ${filter === 'all' ? '' : filter} notes available`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl shadow-sm p-6">
                {/* Header Row with Status */}
                <div className="flex items-center mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(note.status)}
                    <span className="text-sm text-gray-500">
                      {note.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                    </span>
                  </div>
                </div>

                {/* Title and Description */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h3>
                <p className="text-gray-600 mb-4">{note.description}</p>

                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">University:</span>
                        <p className="font-medium">{note.universityId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Department:</span>
                        <p className="font-medium">{note.departmentId}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Subject:</span>
                        <p className="font-medium">{note.subject}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Course Code:</span>
                        <p className="font-medium">{note.courseCode}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span>📤 {note.authorName || 'Unknown'}</span>
                      {note.fileSize && (
                        <span>📄 {(note.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Vertical Stack */}
                  <div className="flex lg:flex-col flex-row flex-wrap gap-2 lg:min-w-[140px]">
                    {note.fileUrl && (
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </a>
                    )}
                    {note.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(note.id)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(note.id)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                          <XCircleIcon className="h-4 w-4" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDelete(note.id, note.fileUrl, note.filePath)}
                      disabled={deletingId === note.id}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {deletingId === note.id ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <TrashIcon className="h-4 w-4" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {notes.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Admin Actions</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Approve: Makes the note visible to all users</li>
                  <li>Reject: Hides the note from public view</li>
                  <li>Delete: Permanently removes the note and its file</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
