import React, { useState } from 'react';

const Report = () => {
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder: Wire this to a backend or email service
    alert('Thanks for the report! We will review it shortly.');
    setSubject('');
    setDetails('');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Report an Issue</h1>
        <p className="text-gray-600 mb-6">Tell us what went wrong or what needs attention.</p>
        <form onSubmit={handleSubmit} className="card">
          <div className="card-body space-y-4">
            <div>
              <label className="label">Subject</label>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Issue subject"
              />
            </div>
            <div>
              <label className="label">Details</label>
              <textarea
                className="input min-h-[120px]"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe the issue..."
              />
            </div>
            <button className="btn btn-primary btn-md" type="submit">
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Report;
