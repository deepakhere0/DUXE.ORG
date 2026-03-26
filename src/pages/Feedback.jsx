import React, { useState } from 'react';

const Feedback = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Wire this to a backend or email service
    alert('Thanks for the feedback!');
    setMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Feedback</h1>
        <p className="text-gray-600 mb-6">We value your thoughts. Help us improve StudyHub.</p>
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body space-y-4">
            <div>
              <label className="label">Your Feedback</label>
              <textarea
                className="input min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts..."
              />
            </div>
            <button className="btn btn-primary btn-md" type="submit">
              Send Feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Feedback;
