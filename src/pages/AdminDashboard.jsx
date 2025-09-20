import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminNotesService } from '../services/adminNotesService';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  TagIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid
} from '@heroicons/react/24/solid';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [pendingNotes, setPendingNotes] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [editingNote, setEditingNote] = useState(null);
  const [editData, setEditData] = useState({});
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notes, unis, depts, statistics] = await Promise.all([
        adminNotesService.getPendingNotes(),
        adminNotesService.getUniversities(),
        adminNotesService.getAllDepartments(),
        adminNotesService.getNoteStats()
      ]);
      
      setPendingNotes(notes);
      setUniversities(unis);
      setDepartments(depts);
      setStats(statistics);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (note) => {
    setEditingNote(note.id);
    setEditData({
      title: note.title || '',
      courseCode: note.courseCode || '',
      universityId: note.universityId || '',
      departmentId: note.departmentId || '',
      semester: note.semester || 1
    });
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
    setEditData({});
  };

  const handleApproveNote = async (noteId, skipEdit = false) => {
    try {
      const updateData = skipEdit ? {} : editData;
      updateData.reviewedBy = currentUser.uid;

      await adminNotesService.approveNote(noteId, updateData);
      
      // Remove from pending list
      setPendingNotes(prev => prev.filter(note => note.id !== noteId));
      setEditingNote(null);
      setEditData({});
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        approved: prev.approved + 1
      }));
      
      toast.success('Note approved successfully!');
    } catch (error) {
      console.error('Error approving note:', error);
      toast.error('Failed to approve note');
    }
  };

  const handleRejectNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to reject and delete this note? This action cannot be undone.')) {
      return;
    }

    try {
      await adminNotesService.rejectNote(noteId, 'Rejected by admin');
      
      // Remove from pending list
      setPendingNotes(prev => prev.filter(note => note.id !== noteId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - 1,
        rejected: prev.rejected + 1
      }));
      
      toast.success('Note rejected and deleted');
    } catch (error) {
      console.error('Error rejecting note:', error);
      toast.error('Failed to reject note');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedNotes.length === 0) return;
    
    try {
      await adminNotesService.bulkApproveNotes(selectedNotes, currentUser.uid);
      
      // Remove approved notes from pending list
      setPendingNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - selectedNotes.length,
        approved: prev.approved + selectedNotes.length
      }));
      
      setSelectedNotes([]);
      setShowBulkActions(false);
      toast.success(`${selectedNotes.length} notes approved successfully!`);
    } catch (error) {
      console.error('Error bulk approving notes:', error);
      toast.error('Failed to bulk approve notes');
    }
  };

  const handleBulkReject = async () => {
    if (selectedNotes.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to reject and delete ${selectedNotes.length} notes? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await adminNotesService.bulkRejectNotes(selectedNotes, 'Bulk rejected by admin');
      
      // Remove rejected notes from pending list
      setPendingNotes(prev => prev.filter(note => !selectedNotes.includes(note.id)));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pending: prev.pending - selectedNotes.length,
        rejected: prev.rejected + selectedNotes.length
      }));
      
      setSelectedNotes([]);
      setShowBulkActions(false);
      toast.success(`${selectedNotes.length} notes rejected successfully!`);
    } catch (error) {
      console.error('Error bulk rejecting notes:', error);
      toast.error('Failed to bulk reject notes');
    }
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => {
      const newSelection = prev.includes(noteId)
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const selectAllNotes = () => {
    const allNoteIds = pendingNotes.map(note => note.id);
    setSelectedNotes(allNoteIds);
    setShowBulkActions(allNoteIds.length > 0);
  };

  const deselectAllNotes = () => {
    setSelectedNotes([]);
    setShowBulkActions(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 text-accent-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Review and manage pending notes</p>
            </div>
            <button
              onClick={loadData}
              className="btn btn-secondary inline-flex items-center"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircleIconSolid className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <XCircleIconSolid className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.rejected}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DocumentTextIcon className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {showBulkActions && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-sm text-gray-600">
                  {selectedNotes.length} note{selectedNotes.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleBulkApprove}
                  className="btn btn-success btn-sm inline-flex items-center"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Approve Selected
                </button>
                <button
                  onClick={handleBulkReject}
                  className="btn btn-danger btn-sm inline-flex items-center"
                >
                  <XCircleIcon className="h-4 w-4 mr-1" />
                  Reject Selected
                </button>
                <button
                  onClick={deselectAllNotes}
                  className="text-gray-400 hover:text-gray-600"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">
                Pending Notes ({pendingNotes.length})
              </h2>
              {pendingNotes.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={selectAllNotes}
                    className="text-sm text-accent-600 hover:text-accent-700"
                  >
                    Select All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={deselectAllNotes}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {pendingNotes.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIconSolid className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">No pending notes to review at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {pendingNotes.map((note) => (
                <div key={note.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotes.includes(note.id)}
                      onChange={() => toggleNoteSelection(note.id)}
                      className="mt-1 rounded border-gray-300 text-accent-600 focus:ring-accent-500"
                    />

                    <div className="flex-1 min-w-0">
                      {/* Note Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {editingNote === note.id ? (
                            <input
                              type="text"
                              value={editData.title}
                              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                              className="text-lg font-semibold text-gray-900 border-b border-accent-500 focus:outline-none focus:border-accent-600 bg-transparent w-full"
                              placeholder="Note Title"
                            />
                          ) : (
                            <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                          )}
                        </div>
                        
                        {/* View File Button */}
                        {note.fileUrl && (
                          <a
                            href={note.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 inline-flex items-center text-sm text-accent-600 hover:text-accent-700"
                          >
                            <EyeIcon className="h-4 w-4 mr-1" />
                            View File
                          </a>
                        )}
                      </div>

                      {/* Note Metadata */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Course Code */}
                        <div className="flex items-center">
                          <TagIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {editingNote === note.id ? (
                            <input
                              type="text"
                              value={editData.courseCode}
                              onChange={(e) => setEditData({ ...editData, courseCode: e.target.value })}
                              className="text-sm text-gray-700 border-b border-gray-300 focus:outline-none focus:border-accent-500 bg-transparent"
                              placeholder="Course Code"
                            />
                          ) : (
                            <span className="text-sm text-gray-700">{note.courseCode}</span>
                          )}
                        </div>

                        {/* University */}
                        <div className="flex items-center">
                          <BuildingLibraryIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {editingNote === note.id ? (
                            <select
                              value={editData.universityId}
                              onChange={(e) => setEditData({ ...editData, universityId: e.target.value })}
                              className="text-sm text-gray-700 border-b border-gray-300 focus:outline-none focus:border-accent-500 bg-transparent"
                            >
                              <option value="">Select University</option>
                              {universities.map(uni => (
                                <option key={uni.id} value={uni.id}>{uni.shortName}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-700">{note.universityName}</span>
                          )}
                        </div>

                        {/* Department */}
                        <div className="flex items-center">
                          <AcademicCapIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {editingNote === note.id ? (
                            <select
                              value={editData.departmentId}
                              onChange={(e) => setEditData({ ...editData, departmentId: e.target.value })}
                              className="text-sm text-gray-700 border-b border-gray-300 focus:outline-none focus:border-accent-500 bg-transparent"
                            >
                              <option value="">Select Department</option>
                              {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.shortName}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-700">{note.departmentName}</span>
                          )}
                        </div>

                        {/* Semester */}
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400 mr-2" />
                          {editingNote === note.id ? (
                            <select
                              value={editData.semester}
                              onChange={(e) => setEditData({ ...editData, semester: parseInt(e.target.value) })}
                              className="text-sm text-gray-700 border-b border-gray-300 focus:outline-none focus:border-accent-500 bg-transparent"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <option key={sem} value={sem}>Semester {sem}</option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-sm text-gray-700">Semester {note.semester}</span>
                          )}
                        </div>
                      </div>

                      {/* Note Info */}
                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <UserIcon className="h-3 w-3 mr-1" />
                        <span className="mr-4">By {note.authorName}</span>
                        <ClockIcon className="h-3 w-3 mr-1" />
                        <span>Uploaded {formatDate(note.createdAt)}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-3">
                        {editingNote === note.id ? (
                          <>
                            <button
                              onClick={() => handleApproveNote(note.id)}
                              className="btn btn-success btn-sm inline-flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Save & Approve
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="btn btn-secondary btn-sm"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(note)}
                              className="btn btn-secondary btn-sm inline-flex items-center"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleApproveNote(note.id, true)}
                              className="btn btn-success btn-sm inline-flex items-center"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectNote(note.id)}
                              className="btn btn-danger btn-sm inline-flex items-center"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;