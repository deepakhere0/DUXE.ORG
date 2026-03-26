import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NOTE_STATUS } from '../../constants/status';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TrashIcon,
  EyeIcon,
  InformationCircleIcon,
  CurrencyRupeeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

// Admin Review Component
const AdminReview = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [editingPriceId, setEditingPriceId] = useState(null);
  const [priceInputValue, setPriceInputValue] = useState('');
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [selectedNoteForPrice, setSelectedNoteForPrice] = useState(null);

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
        status: NOTE_STATUS.APPROVED,
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
        status: NOTE_STATUS.REJECTED,
        reviewedBy: user.uid,
        reviewedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Note rejected');
      fetchNotes();
    } catch (error) {
      console.error('Error rejecting note:', error);
      toast.error('Failed to reject note');
    }
  };

  /**
   * Handle price editing
   * Opens inline price editor (top of card)
   */
  const handleStartPriceEdit = (note) => {
    setEditingPriceId(note.id);
    setPriceInputValue(note.price || 0);
  };

  /**
   * Open price modal (from Price button)
   */
  const handleOpenPriceModal = (note) => {
    setSelectedNoteForPrice(note);
    setPriceInputValue(note.price || 0);
    setPriceModalOpen(true);
  };

  /**
   * Close price modal
   */
  const handleClosePriceModal = () => {
    setPriceModalOpen(false);
    setSelectedNoteForPrice(null);
    setPriceInputValue('');
  };

  /**
   * Save price from modal
   */
  const handleSavePriceFromModal = async () => {
    if (!selectedNoteForPrice) return;

    try {
      const newPrice = parseFloat(priceInputValue);

      if (isNaN(newPrice) || newPrice < 0) {
        toast.error('Please enter a valid price (0 or greater)');
        return;
      }

      await updateDoc(doc(db, 'notes', selectedNoteForPrice.id), {
        price: newPrice,
        updatedAt: serverTimestamp(),
      });

      toast.success(`Price updated to ₹${newPrice}`);
      handleClosePriceModal();
      await fetchNotes();
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  /**
   * Save price changes
   * Updates note price in Firestore
   */
  const handleSavePrice = async (noteId) => {
    try {
      const newPrice = parseFloat(priceInputValue);

      if (isNaN(newPrice) || newPrice < 0) {
        toast.error('Please enter a valid price');
        return;
      }

      await updateDoc(doc(db, 'notes', noteId), {
        price: newPrice,
        updatedAt: serverTimestamp(),
      });

      toast.success(`Price updated to ₹${newPrice}`);
      setEditingPriceId(null);
      await fetchNotes();
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price');
    }
  };

  /**
   * Cancel price editing
   */
  const handleCancelPriceEdit = () => {
    setEditingPriceId(null);
    setPriceInputValue('');
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
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
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
                  filter === tab ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'pending' &&
                  notes.filter((n) => n.status === NOTE_STATUS.PENDING).length > 0 && (
                    <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs">
                      {notes.filter((n) => n.status === NOTE_STATUS.PENDING).length}
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
                {/* Header Row with Status and Price */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(note.status)}
                    <span className="text-sm text-gray-500">
                      {note.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                    </span>
                  </div>

                  {/* Price Display/Editor */}
                  <div className="flex items-center gap-2">
                    {editingPriceId === note.id ? (
                      // Price editing mode
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <CurrencyRupeeIcon className="h-4 w-4 text-gray-500" />
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={priceInputValue}
                            onChange={(e) => setPriceInputValue(e.target.value)}
                            className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => handleSavePrice(note.id)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelPriceEdit}
                          className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      // Price display mode
                      <div className="flex items-center gap-2">
                        <div
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-semibold ${
                            note.price > 0
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {note.price > 0 ? (
                            <>
                              <CurrencyRupeeIcon className="h-4 w-4" />
                              <span>{note.price}</span>
                            </>
                          ) : (
                            <span>FREE</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleStartPriceEdit(note)}
                          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Edit price"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
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
                      {/* Revenue Stats for Paid Notes */}
                      {note.price > 0 && (
                        <span className="font-medium text-green-600">
                          💰 Sales: {note.purchaseCount || 0} | Revenue: ₹{note.totalRevenue || 0}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - FIXED VERSION */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      minWidth: '140px',
                    }}
                  >
                    {/* View */}
                    {note.fileUrl && (
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          padding: '8px 16px',
                          background: '#f3f4f6',
                          color: '#374151',
                          borderRadius: '8px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500',
                        }}
                      >
                        View
                      </a>
                    )}

                    {/* Approve (pending only) */}
                    {note.status === NOTE_STATUS.PENDING && (
                      <button
                        onClick={() => handleApprove(note.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Approve
                      </button>
                    )}

                    {/* Reject (pending only) */}
                    {note.status === NOTE_STATUS.PENDING && (
                      <button
                        onClick={() => handleReject(note.id)}
                        style={{
                          padding: '8px 16px',
                          background: '#ca8a04',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    )}

                    {/* PRICE - ALWAYS VISIBLE */}
                    <button
                      onClick={() => handleOpenPriceModal(note)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(to right, #f97316, #ea580c)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                      }}
                    >
                      💰 Set Price
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(note.id, note.fileUrl, note.filePath)}
                      disabled={deletingId === note.id}
                      style={{
                        padding: '8px 16px',
                        background: deletingId === note.id ? '#9ca3af' : '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: deletingId === note.id ? 'not-allowed' : 'pointer',
                        opacity: deletingId === note.id ? 0.5 : 1,
                      }}
                    >
                      {deletingId === note.id ? 'Deleting...' : 'Delete'}
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
                  <li>Price: Set or update the note price (₹0 = free)</li>
                  <li>Delete: Permanently removes the note and its file</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Modal */}
      {priceModalOpen && selectedNoteForPrice && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          aria-labelledby="price-modal"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleClosePriceModal}
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CurrencyRupeeIcon className="h-8 w-8" />
                    <h3 className="text-2xl font-bold">Set Note Price</h3>
                  </div>
                  <button
                    onClick={handleClosePriceModal}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label="Close modal"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Note Details */}
              <div className="p-6 border-b border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedNoteForPrice.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {selectedNoteForPrice.courseCode} • {selectedNoteForPrice.subject}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">Current Price:</span>
                    <span className="font-bold text-orange-600">
                      {selectedNoteForPrice.price > 0 ? `₹${selectedNoteForPrice.price}` : 'FREE'}
                    </span>
                  </div>
                  {selectedNoteForPrice.price > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Sales: {selectedNoteForPrice.purchaseCount || 0}</span>
                        <span>Revenue: ₹{selectedNoteForPrice.totalRevenue || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Price Input Form */}
              <div className="p-6">
                <label
                  htmlFor="price-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Price (₹)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <CurrencyRupeeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="price-input"
                    type="number"
                    min="0"
                    step="1"
                    value={priceInputValue}
                    onChange={(e) => setPriceInputValue(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg font-semibold"
                    placeholder="Enter price (0 for free)"
                    autoFocus
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  💡 Tip: Set to 0 to make the note free for everyone
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50 rounded-b-2xl flex gap-3">
                <button
                  onClick={handleClosePriceModal}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePriceFromModal}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <CurrencyRupeeIcon className="h-5 w-5" />
                  Save Price
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReview;
