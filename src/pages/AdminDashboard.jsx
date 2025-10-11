import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { adminNotesService } from '../services/adminNotesService';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notesData, statsData] = await Promise.all([
        adminNotesService.getPendingNotes(),
        adminNotesService.getNoteStats()
      ]);
      
      setPendingNotes(notesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (noteId) => {
    setActionLoading(true);
    try {
      await adminNotesService.approveNote(noteId, { reviewedBy: user.uid });
      await loadData(); // Reload data
      alert('Note approved successfully!');
    } catch (error) {
      console.error('Error approving note:', error);
      alert('Error approving note: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (noteId) => {
    const reason = prompt('Enter rejection reason (optional):');
    setActionLoading(true);
    try {
      await adminNotesService.rejectNote(noteId, reason);
      await loadData(); // Reload data
      alert('Note rejected successfully!');
    } catch (error) {
      console.error('Error rejecting note:', error);
      alert('Error rejecting note: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedNotes.length === 0) {
      alert('Please select notes to approve');
      return;
    }

    if (!confirm(`Approve ${selectedNotes.length} selected notes?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await adminNotesService.bulkApproveNotes(selectedNotes, user.uid);
      await loadData();
      setSelectedNotes([]);
      alert(`${selectedNotes.length} notes approved successfully!`);
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Error bulk approving: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedNotes.length === 0) {
      alert('Please select notes to reject');
      return;
    }

    const reason = prompt('Enter rejection reason (optional):');
    if (!confirm(`Reject ${selectedNotes.length} selected notes?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await adminNotesService.bulkRejectNotes(selectedNotes, reason);
      await loadData();
      setSelectedNotes([]);
      alert(`${selectedNotes.length} notes rejected successfully!`);
    } catch (error) {
      console.error('Error bulk rejecting:', error);
      alert('Error bulk rejecting: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage pending notes and content review</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm text-gray-500">Total Notes</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Notes Section */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Notes ({pendingNotes.length})
              </h2>
              
              {selectedNotes.length > 0 && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleBulkApprove}
                    disabled={actionLoading}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    Approve ({selectedNotes.length})
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={actionLoading}
                    className="btn btn-secondary btn-sm"
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Reject ({selectedNotes.length})
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {pendingNotes.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">There are no pending notes to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingNotes.map((note) => (
                  <div key={note.id} className="border rounded-xl p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedNotes.includes(note.id)}
                          onChange={() => toggleNoteSelection(note.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                            <span className="ml-3 px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Pending Review
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div className="flex items-center">
                              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                              {note.universityName}
                            </div>
                            <div className="flex items-center">
                              <AcademicCapIcon className="h-4 w-4 mr-1" />
                              {note.departmentName}
                            </div>
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {note.createdAt?.toDate ? new Date(note.createdAt.toDate()).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-600 mb-3">
                            <span className="font-medium">{note.courseCode}</span>
                            <span className="mx-2">•</span>
                            <span>{note.subject}</span>
                            <span className="mx-2">•</span>
                            <span>Semester {note.semester}</span>
                            {note.authorName && (
                              <>
                                <span className="mx-2">•</span>
                                <span>By {note.authorName}</span>
                              </>
                            )}
                          </div>
                          
                          {note.description && (
                            <p className="text-gray-700 mb-4 line-clamp-2">{note.description}</p>
                          )}
                          
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {note.tags.map((tag, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(note.id)}
                          disabled={actionLoading}
                          className="btn btn-primary btn-sm"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(note.id)}
                          disabled={actionLoading}
                          className="btn btn-secondary btn-sm"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;