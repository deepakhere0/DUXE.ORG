import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon, DocumentTextIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';
import MediaViewer from '../../components/common/MediaViewer';

// Admin Review Queue page for moderating uploads (status=pending)
const ReviewQueue = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedNote, setSelectedNote] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  // Check if user is admin
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      Toast.error('Admin access required');
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  // Fetch pending notes from Firestore
  const { data: pendingNotes = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-pending-notes'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'notes'),
          where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        const notes = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          notes.push({
            id: doc.id,
            ...data,
            submittedAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
          });
        });
        return notes.sort((a, b) => b.submittedAt - a.submittedAt);
      } catch (err) {
        console.error('Error fetching pending notes:', err);
        Toast.error('Failed to load pending notes');
        return [];
      }
    },
    enabled: !!currentUser && currentUser.role === 'admin',
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Mutation for approving notes
  const approveMutation = useMutation({
    mutationFn: async (noteId) => {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        status: 'approved',
        approvedAt: serverTimestamp(),
        approvedBy: currentUser.uid
      });
    },
    onSuccess: (_, noteId) => {
      Toast.success('Note approved successfully');
      queryClient.invalidateQueries(['admin-pending-notes']);
      queryClient.invalidateQueries(['notes']);
    },
    onError: (error) => {
      console.error('Error approving note:', error);
      Toast.error('Failed to approve note');
    }
  });
  
  // Mutation for rejecting notes
  const rejectMutation = useMutation({
    mutationFn: async ({ noteId, reason }) => {
      const noteRef = doc(db, 'notes', noteId);
      await updateDoc(noteRef, {
        status: 'rejected',
        rejectedAt: serverTimestamp(),
        rejectedBy: currentUser.uid,
        rejectionReason: reason || 'Does not meet quality standards'
      });
    },
    onSuccess: () => {
      Toast.success('Note rejected');
      queryClient.invalidateQueries(['admin-pending-notes']);
    },
    onError: (error) => {
      console.error('Error rejecting note:', error);
      Toast.error('Failed to reject note');
    }
  });
  
  const handleApprove = (noteId) => {
    if (window.confirm('Approve this note? It will be visible to all users.')) {
      approveMutation.mutate(noteId);
    }
  };
  
  const handleReject = (noteId) => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason !== null) {
      rejectMutation.mutate({ noteId, reason });
    }
  };
  
  const handlePreview = (note) => {
    setSelectedNote(note);
    setPreviewOpen(true);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Review Queue</h1>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingNotes.length}</p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {approveMutation.isSuccess ? '+1' : '0'}
                </p>
                <p className="text-sm text-gray-600">Approved Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {rejectMutation.isSuccess ? '+1' : '0'}
                </p>
                <p className="text-sm text-gray-600">Rejected Today</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Pending Submissions</h2>
          </div>
          
          {/* Loading State */}
          {isLoading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading pending notes...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="p-8 text-center">
              <p className="text-red-600">Error loading pending notes</p>
            </div>
          )}
          
          {/* Notes List */}
          {!isLoading && !error && (
            <div className="divide-y">
              {pendingNotes.map((note) => (
                <div key={note.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <DocumentTextIcon className="h-10 w-10 text-gray-400 flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {note.title || 'Untitled'}
                          </h3>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>
                              Course: <span className="font-medium">{note.courseCode || 'N/A'}</span> • 
                              Subject: <span className="font-medium">{note.subject || 'N/A'}</span>
                            </p>
                            <p>
                              University: <span className="font-medium">{note.universityName || 'N/A'}</span> • 
                              Department: <span className="font-medium">{note.departmentName || 'N/A'}</span>
                            </p>
                            <p>
                              Uploaded by: <span className="font-medium">{note.authorName || 'Unknown'}</span> • 
                              {note.submittedAt ? new Date(note.submittedAt).toLocaleDateString() : 'Unknown date'}
                            </p>
                            {note.description && (
                              <p className="text-gray-500 mt-2">{note.description.substring(0, 150)}...</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button 
                        onClick={() => handlePreview(note)}
                        className="btn btn-secondary btn-sm"
                        disabled={!note.fileUrl}
                      >
                        <EyeIcon className="h-4 w-4 mr-1"/>
                        Preview
                      </button>
                      <button 
                        onClick={() => handleApprove(note.id)} 
                        className="btn btn-primary btn-sm"
                        disabled={approveMutation.isLoading || rejectMutation.isLoading}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-1"/>
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReject(note.id)} 
                        className="btn btn-secondary btn-sm"
                        disabled={approveMutation.isLoading || rejectMutation.isLoading}
                      >
                        <XCircleIcon className="h-4 w-4 mr-1"/>
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {pendingNotes.length === 0 && (
                <div className="p-12 text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up!</h3>
                  <p className="text-gray-600">No notes pending review</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Preview Modal */}
      {selectedNote && (
        <MediaViewer
          isOpen={previewOpen}
          onClose={() => {
            setPreviewOpen(false);
            setSelectedNote(null);
          }}
          url={selectedNote.fileUrl}
          type={selectedNote.fileUrl?.endsWith('.pdf') ? 'pdf' : 'image'}
          title={selectedNote.title}
        />
      )}
    </div>
  );
};

export default ReviewQueue;

