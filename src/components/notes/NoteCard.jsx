import React, { useState, useEffect } from 'react';
import { 
  DocumentArrowDownIcon, 
  StarIcon, 
  EyeIcon,
  CalendarDaysIcon,
  UserIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  CurrencyRupeeIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { FiEye, FiDownload } from 'react-icons/fi';
import { paymentService } from '../../services/paymentService';
import PaymentModal from './PaymentModal';

const NoteCard = ({ 
  note, 
  onDownload, 
  onBookmark, 
  onView,
  isBookmarked = false,
  userId = null,
  className = "" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  
  // Check if note has a price
  const notePrice = note.price || 0;
  const isPaidNote = notePrice > 0;

  /**
   * Check if user has already paid for this note
   * Runs on component mount and when payment is successful
   */
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (userId && isPaidNote) {
        setIsCheckingPayment(true);
        const paid = await paymentService.hasUserPaid(userId, note.id);
        setHasPaid(paid);
        setIsCheckingPayment(false);
      } else {
        setIsCheckingPayment(false);
      }
    };
    checkPaymentStatus();
  }, [userId, note.id, isPaidNote]);
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getSubjectColor = (courseCode) => {
    if (!courseCode) return 'bg-gray-100 text-gray-800';
    
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-red-100 text-red-800',
      'bg-indigo-100 text-indigo-800'
    ];
    
    // Use course code to consistently assign colors
    const index = courseCode.length % colors.length;
    return colors[index];
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-200" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return stars;
  };

  /**
   * Handle download button click
   * Shows payment modal if note is paid and user hasn't paid yet
   */
  const handleDownloadClick = () => {
    if (isPaidNote && !hasPaid) {
      setIsPaymentModalOpen(true);
    } else {
      onDownload?.(note);
    }
  };

  /**
   * Handle payment success
   * Updates payment status and allows access
   */
  const handlePaymentSuccess = () => {
    setHasPaid(true);
    setIsPaymentModalOpen(false);
  };

  return (
    <>
    <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 relative ${className}`}>
      {/* Price Badge - Top Right Corner */}
      {isPaidNote && (
        <div className="absolute top-3 right-3 z-10">
          {hasPaid ? (
            <div className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
              <CheckBadgeIcon className="h-4 w-4" />
              <span>PAID</span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg animate-pulse">
              <CurrencyRupeeIcon className="h-4 w-4" />
              <span>₹{notePrice}</span>
            </div>
          )}
        </div>
      )}

      {/* Note Header */}
      <div className="p-6">
        {/* Title and Course Code */}
        <div className="flex items-start justify-between mb-3 pr-16">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
              {note.title || 'Untitled Note'}
            </h3>
            {note.courseCode && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubjectColor(note.courseCode)}`}>
                {note.courseCode}
              </span>
            )}
          </div>
          
          {/* Bookmark Button */}
          <button
            onClick={() => onBookmark?.(note)}
            className={`ml-2 p-2 rounded-full transition-colors duration-200 ${
              isBookmarked 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-400 hover:text-yellow-500'
            }`}
            title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
          >
            {isBookmarked ? (
              <StarIconSolid className="h-5 w-5" />
            ) : (
              <StarIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* University and Department */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <BuildingLibraryIcon className="h-4 w-4" />
            <span>{note.universityName || note.uniName || 'Unknown University'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <AcademicCapIcon className="h-4 w-4" />
            <span>{note.departmentName || note.deptName || 'Unknown Department'}</span>
          </div>
          {note.semester && (
            <div className="flex items-center space-x-1">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>Semester {note.semester}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {note.description && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {note.description}
          </p>
        )}

        {/* Metadata Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {/* Author */}
            <div className="flex items-center space-x-1">
              <UserIcon className="h-4 w-4" />
              <span>{note.authorName || 'Anonymous'}</span>
            </div>
            
            {/* Upload Date */}
            <div className="flex items-center space-x-1">
              <CalendarDaysIcon className="h-4 w-4" />
              <span>{formatDate(note.createdAt)}</span>
            </div>
          </div>

          {/* File Info */}
          <div className="text-sm text-gray-500">
            {note.pages && (
              <span>{note.pages} pages</span>
            )}
            {note.fileSize && note.pages && ' • '}
            {note.fileSize && (
              <span>{formatFileSize(note.fileSize)}</span>
            )}
          </div>
        </div>

        {/* Rating and Stats */}
        <div className="flex items-center justify-between mb-4">
          {/* Rating */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getRatingStars(note.ratingAvg)}
            </div>
            <span className="text-sm text-gray-600">
              {note.ratingAvg ? note.ratingAvg.toFixed(1) : '0.0'}
              {note.ratingCount && (
                <span className="text-gray-500"> ({note.ratingCount})</span>
              )}
            </span>
          </div>

          {/* Downloads */}
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>{note.downloads || 0} downloads</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
<div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
  <div className="flex items-center gap-2">
    {/* Preview Button or Purchase Button */}
    {(!isPaidNote || hasPaid) ? (
      <Link
        to={`/preview/${note.id}`}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white 
                 bg-orange-500 hover:bg-orange-600 rounded-lg
                 transition-colors duration-200 shadow-sm"
      >
        <FiEye className="h-5 w-5" />
        <span>Preview</span>
      </Link>
    ) : (
      <button
        onClick={() => setIsPaymentModalOpen(true)}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white 
                 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-lg
                 transition-all duration-200 shadow-sm"
      >
        <CurrencyRupeeIcon className="h-5 w-5" />
        <span>Buy ₹{notePrice}</span>
      </button>
    )}

    {/* Download Button */}
    <button
      onClick={handleDownloadClick}
      disabled={isPaidNote && !hasPaid}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
        (isPaidNote && !hasPaid)
          ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
      }`}
      title={(isPaidNote && !hasPaid) ? "Purchase to download" : "Download PDF"}
    >
      <DocumentArrowDownIcon className="h-5 w-5" />
    </button>
  </div>
</div>

      {/* Status Badge (for pending/rejected notes) */}
      {note.status && note.status !== 'approved' && (
        <div className="absolute top-4 left-4">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            note.status === 'pending' 
              ? 'bg-yellow-100 text-yellow-800' 
              : note.status === 'rejected'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {note.status}
          </span>
        </div>
      )}
    </div>

    {/* Payment Modal */}
    <PaymentModal
      isOpen={isPaymentModalOpen}
      onClose={() => setIsPaymentModalOpen(false)}
      note={note}
      user={userId ? { uid: userId } : null}
      onPaymentSuccess={handlePaymentSuccess}
    />
    </>
  );
};

export default NoteCard;
