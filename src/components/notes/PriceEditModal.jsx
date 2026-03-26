import React, { useState } from 'react';
import {
  XMarkIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import toast from 'react-hot-toast';

/**
 * PriceEditModal Component
 * Allows admins to edit note prices
 * Handles price updates with validation
 */
const PriceEditModal = ({ isOpen, onClose, note, onSuccess }) => {
  const [price, setPrice] = useState(note?.price || 0);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !note) return null;

  const handleUpdatePrice = async (e) => {
    e.preventDefault();

    // Validation
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue < 0) {
      toast.error('Please enter a valid price (0 or greater)');
      return;
    }

    setIsUpdating(true);

    try {
      // Update note price in Firestore
      const noteRef = doc(db, 'notes', note.id);
      await updateDoc(noteRef, {
        price: priceValue,
        updatedAt: new Date().toISOString(),
      });

      toast.success(`Price updated to ₹${priceValue}`);

      // Call success callback
      if (onSuccess) {
        onSuccess({ ...note, price: priceValue });
      }

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error('Failed to update price: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (!isUpdating) {
      setPrice(note?.price || 0);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="price-edit-modal"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
          {/* Close Button */}
          <button
            onClick={handleClose}
            disabled={isUpdating}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <CurrencyRupeeIcon className="h-8 w-8" />
              <h3 className="text-2xl font-bold">Edit Note Price</h3>
            </div>
            <p className="text-orange-100 text-sm">Update the pricing for this note</p>
          </div>

          {/* Note Details */}
          <div className="p-6 border-b border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-1">{note.title}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {note.courseCode} • {note.semester && `Semester ${note.semester}`}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Current Price:</span>
                <span className="text-lg font-bold text-gray-900">
                  {note.price > 0 ? `₹${note.price}` : 'Free'}
                </span>
              </div>
              {note.purchaseCount > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Total Sales:</span>
                    <span className="font-medium">{note.purchaseCount} purchases</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Revenue Generated:</span>
                    <span className="font-medium">₹{note.totalRevenue || 0}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Edit Form */}
          <form onSubmit={handleUpdatePrice} className="p-6">
            <div className="mb-6">
              <label htmlFor="new-price" className="block text-sm font-medium text-gray-700 mb-2">
                New Price (INR)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">
                  ₹
                </span>
                <input
                  id="new-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  disabled={isUpdating}
                  required
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Set to 0 for free notes. Students must pay before accessing paid notes.
              </p>
            </div>

            {/* Warning for existing purchases */}
            {note.purchaseCount > 0 && parseFloat(price) !== note.price && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 flex items-start space-x-2">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Note:</p>
                  <p className="mt-1">
                    This note has {note.purchaseCount} existing purchase
                    {note.purchaseCount > 1 ? 's' : ''}. Price changes only affect new purchases.
                  </p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isUpdating || parseFloat(price) === note.price}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isUpdating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Update Price</span>
                </>
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={handleClose}
              disabled={isUpdating}
              className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PriceEditModal;
