import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, EyeIcon } from '@heroicons/react/24/outline';

// Admin Review Queue page for moderating uploads (status=pending)
const ReviewQueue = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Placeholder: replace with Firestore query for notes where status=='pending'
    setItems([
      { id: 'n1', title: 'Sample Upload 1', uploader: 'alice@example.com', submittedAt: '2025-01-01' },
      { id: 'n2', title: 'Sample Upload 2', uploader: 'bob@example.com', submittedAt: '2025-01-02' },
    ]);
  }, []);

  const approve = async (id) => {
    // TODO: update Firestore: notes/id status=approved
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const reject = async (id) => {
    // TODO: update Firestore: notes/id status=rejected
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Review Queue</h1>
        <div className="bg-white rounded-2xl shadow-card">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-5 w-5 mr-2" /> Pending Submissions
            </div>
          </div>
          <div className="divide-y">
            {items.map((i) => (
              <div key={i.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{i.title}</div>
                  <div className="text-sm text-gray-600">By {i.uploader} • {i.submittedAt}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn btn-secondary btn-sm"><EyeIcon className="h-4 w-4 mr-1"/>Preview</button>
                  <button onClick={() => approve(i.id)} className="btn btn-primary btn-sm"><CheckCircleIcon className="h-4 w-4 mr-1"/>Approve</button>
                  <button onClick={() => reject(i.id)} className="btn btn-secondary btn-sm"><XCircleIcon className="h-4 w-4 mr-1"/>Reject</button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-8 text-center text-gray-600">No items in the queue.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewQueue;

