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
  InformationCircleIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import PriceEditModal from '../components/notes/PriceEditModal';

const AdminReview = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all
  const [editingNote, setEditingNote] = useState(null);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedNoteForPurchasers, setSelectedNoteForPurchasers] = useState(null);
  const [purchasers, setPurchasers] = useState([]);

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

  const handleEditPrice = (note) => {
    setEditingNote(note);
    setIsPriceModalOpen(true);
  };

  const handlePriceUpdateSuccess = async () => {
    // Refresh notes list after price update
    await fetchNotes();
    setEditingNote(null);
    setIsPriceModalOpen(false);
  };

  const handleViewPurchasers = async (note) => {
    setSelectedNoteForPurchasers(note);
    try {
      // Query payments collection for this note
      const q = query(
        collection(db, 'payments'),
        where('noteId', '==', note.id),
        where('status', '==', 'completed')
      );
      
      const querySnapshot = await getDocs(q);
      const purchasersList = [];
      
      querySnapshot.forEach((doc) => {
        purchasersList.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort by payment date (newest first)
      purchasersList.sort((a, b) => {
        const aTime = a.paymentDate?.toDate?.() || new Date(0);
        const bTime = b.paymentDate?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      setPurchasers(purchasersList);
    } catch (error) {
      console.error('Error fetching purchasers:', error);
      toast.error('Failed to fetch purchasers');
    }
  };

  const closePurchasersModal = () => {
    setSelectedNoteForPurchasers(null);
    setPurchasers([]);
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
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      {getStatusBadge(note.status)}
                      <span className="ml-3 text-sm text-gray-500">
                        {note.createdAt?.toDate?.().toLocaleDateString() || 'Unknown date'}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{note.title}</h3>
                    <p className="text-gray-600 mb-4">{note.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-medium text-orange-600">
                          {note.price && note.price > 0 ? `₹${note.price}` : 'Free'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center text-sm text-gray-600">
                      <span>Uploaded by: {note.authorName || 'Unknown'}</span>
                      {note.fileSize && (
                        <span className="ml-4">
                          Size: {(note.fileSize / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                      {note.purchaseCount !== undefined && note.price > 0 && (
                        <>
                          <span className="ml-4">
                            Sales: {note.purchaseCount || 0} • Revenue: ₹{note.totalRevenue || 0}
                          </span>
                          {note.purchaseCount > 0 && (
                            <button
                              onClick={() => handleViewPurchasers(note)}
                              className="ml-4 text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              View Purchasers
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-6 flex flex-col space-y-2">
                    {note.fileUrl && (
                      <a
                        href={note.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </a>
                    )}
                    
                    <button
                      onClick={() => handleEditPrice(note)}
                      className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm flex items-center"
                    >
                      <CurrencyRupeeIcon className="h-4 w-4 mr-1" />
                      Price
                    </button>
                    
                    {note.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(note.id)}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(note.id)}
                          className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm flex items-center"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => handleDelete(note.id, note.fileUrl, note.filePath)}
                      disabled={deletingId === note.id}
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingId === note.id ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Delete
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

        {/* Price Edit Modal */}
        <PriceEditModal
          isOpen={isPriceModalOpen}
          onClose={() => {
            setIsPriceModalOpen(false);
            setEditingNote(null);
          }}
          note={editingNote}
          onSuccess={handlePriceUpdateSuccess}
        />

        {/* Purchasers Modal */}
        {selectedNoteForPurchasers && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{selectedNoteForPurchasers.title}</h3>
                    <p className="text-sm opacity-90 mt-1">
                      {purchasers.length} {purchasers.length === 1 ? 'Purchase' : 'Purchases'} • 
                      ₹{purchasers.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString('en-IN')} Total Revenue
                    </p>
                  </div>
                  <button
                    onClick={closePurchasersModal}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <XCircleIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
                {purchasers.length === 0 ? (
                  <div className="p-12 text-center">
                    <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No purchases found for this note</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Transaction ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {purchasers.map((purchase) => (
                        <tr key={purchase.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {purchase.userName || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {purchase.userEmail || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-green-600">
                              ₹{purchase.amount || 0}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {purchase.paymentDate?.toDate?.().toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {purchase.transactionId?.substring(0, 20) || 'N/A'}...
                            </code>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={closePurchasersModal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReview;
