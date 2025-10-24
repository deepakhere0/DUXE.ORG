import React, { useState } from 'react';
import { 
  XMarkIcon, 
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { paymentService } from '../../services/paymentService';
import toast from 'react-hot-toast';

/**
 * PaymentModal Component
 * Displays payment interface for purchasing paid notes
 * Includes mock payment integration ready to be replaced with real gateway
 */
const PaymentModal = ({ isOpen, onClose, note, userId, onPaymentSuccess }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', null
  const [errorMessage, setErrorMessage] = useState('');

  // Mock card details (for UI demonstration)
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  if (!isOpen || !note) return null;

  const notePrice = note.price || 0;
  const isFree = notePrice === 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!isFree && (!cardNumber || !cardName || !expiryDate || !cvv)) {
      toast.error('Please fill in all payment details');
      return;
    }

    if (!userId) {
      toast.error('You must be logged in to purchase notes');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus(null);
    setErrorMessage('');

    try {
      // Process payment through payment service
      const result = await paymentService.processPayment({
        userId,
        noteId: note.id,
        amount: notePrice,
        currency: 'INR',
        noteName: note.title
      });

      if (result.success) {
        setPaymentStatus('success');
        toast.success('Payment successful! You can now access this note.');
        
        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess?.(note.id);
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'Payment failed. Please try again.');
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setPaymentStatus(null);
      setErrorMessage('');
      setCardNumber('');
      setCardName('');
      setExpiryDate('');
      setCvv('');
      onClose();
    }
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substring(0, 19);
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="payment-modal" role="dialog" aria-modal="true">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-4">
                You can now access and download this note.
              </p>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-800">
                  Redirecting you to the note...
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {paymentStatus === 'error' && (
            <div className="p-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <ExclamationCircleIcon className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-4 text-center">
                {errorMessage}
              </p>
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
                <p className="text-gray-200 text-sm">
                  Complete your payment to access this note
                </p>
              </div>

              {/* Note Details */}
              <div className="p-6 border-b border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {note.title}
                  </h4>
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
                {!isFree && (
                  <>
                    {/* Card Number */}
                    <div className="mb-4">
                      <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength="19"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                        disabled={isProcessing}
                        required
                      />
                    </div>

                    {/* Card Name */}
                    <div className="mb-4">
                      <label htmlFor="card-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <input
                        id="card-name"
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                        disabled={isProcessing}
                        required
                      />
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          id="expiry-date"
                          type="text"
                          placeholder="MM/YY"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                          maxLength="5"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                          disabled={isProcessing}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          id="cvv"
                          type="text"
                          placeholder="123"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                          maxLength="3"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                          disabled={isProcessing}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Security Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 flex items-start space-x-2">
                  <LockClosedIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    {isFree 
                      ? 'This note is free. Click below to access it.'
                      : 'This is a mock payment system. In production, this will be replaced with a secure payment gateway like Stripe or Razorpay.'
                    }
                  </p>
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
