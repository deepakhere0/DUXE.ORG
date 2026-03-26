import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { paymentService } from '../../services/paymentService';
import { validateRazorpayConfig } from '../../config/razorpayConfig';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

/**
 * PaymentModal Component
 * Displays payment interface for purchasing paid notes
 * Integrates with Razorpay for real payment processing
 * Supports UPI, cards, netbanking, and wallets
 */
const PaymentModal = ({ isOpen, onClose, note, userId, onPaymentSuccess }) => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');
  const [configValid, setConfigValid] = useState(true);

  // Validate Razorpay configuration on mount
  useEffect(() => {
    const isValid = validateRazorpayConfig();
    setConfigValid(isValid);
    if (!isValid) {
      setErrorMessage('Payment system is not configured. Please contact support.');
    }
  }, []);

  if (!isOpen || !note) return null;

  const notePrice = note.price || 0;
  const isFree = notePrice === 0;

  /**
   * Handle payment initialization
   * Supports both Razorpay and mock payment
   */
  const handlePayment = async (e) => {
    e.preventDefault();

    // Validate user authentication
    if (!userId) {
      toast.error('You must be logged in to purchase notes');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(null);
    setErrorMessage('');

    try {
      // Process payment (automatically uses mock if Razorpay not configured)
      const result = await paymentService.processPayment({
        userId,
        noteId: note.id,
        amount: notePrice,
        currency: 'INR',
        noteName: note.title,
        userName: user?.displayName || user?.userData?.displayName || '',
        userEmail: user?.email || '',
        userPhone: user?.userData?.phone || '',
      });

      // Payment successful
      if (result.success) {
        setPaymentStatus('success');
        toast.success('Payment successful! You can now access this note.');

        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess?.(note.id);
          handleClose();
        }, 2000);
      } else if (result.error) {
        // Payment failed
        setPaymentStatus('error');
        setErrorMessage(result.error);
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Payment error:', error);

      // Handle specific error cases
      if (error.message && error.message.includes('cancelled')) {
        toast('Payment cancelled', { icon: 'ℹ️' });
        setIsProcessing(false);
        return;
      } else {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        toast.error(error.message || 'Payment failed');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Handle modal close
   * Resets state and closes the modal
   */
  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStatus(null);
      setErrorMessage('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="payment-modal"
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
            disabled={isProcessing}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>

          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">You can now access and download this note.</p>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-800">Redirecting you to the note...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="p-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <ExclamationCircleIcon className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">Payment Failed</h3>
              <p className="text-gray-600 mb-4 text-center">{errorMessage}</p>
              <button
                onClick={() => setPaymentStatus(null)}
                className="w-full bg-navy-600 text-white py-3 rounded-lg hover:bg-navy-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Payment Form */}
          {paymentStatus === null && (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-navy-600 to-navy-500 text-white p-6 rounded-t-2xl">
                <div className="flex items-center space-x-3 mb-4">
                  <CreditCardIcon className="h-8 w-8" />
                  <h3 className="text-2xl font-bold">Purchase Note</h3>
                </div>
                <p className="text-gray-200 text-sm">Complete your payment to access this note</p>
              </div>

              {/* Note Details */}
              <div className="p-6 border-b border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{note.title}</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {note.courseCode} • {note.semester && `Semester ${note.semester}`}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700 font-medium">Price:</span>
                    <span className="text-2xl font-bold text-navy-600">
                      {isFree ? 'Free' : `₹${notePrice}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handlePayment} className="p-6">
                {/* Payment Methods Info */}
                {!isFree && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Accepted Payment Methods:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                        <CreditCardIcon className="h-4 w-4 text-navy-600" />
                        <span>Credit/Debit Cards</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                        <svg
                          className="h-4 w-4 text-navy-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>UPI</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                        <svg
                          className="h-4 w-4 text-navy-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span>Net Banking</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                        <svg
                          className="h-4 w-4 text-navy-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                        <span>Mobile Wallets</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start space-x-2">
                  <LockClosedIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    {isFree ? (
                      <p>This note is free. Click below to access it.</p>
                    ) : (
                      <>
                        <p className="font-medium mb-1">🔒 Secure Payment via Razorpay</p>
                        <p className="text-xs">
                          Your payment is processed securely through Razorpay. We never store your
                          card details.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-navy-600 to-navy-500 text-white py-4 rounded-lg hover:from-navy-700 hover:to-navy-600 transition-all font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isFree ? 'Access Note' : `Pay ₹${notePrice}`}</span>
                  )}
                </button>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isProcessing}
                  className="w-full mt-3 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
