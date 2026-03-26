import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Notes } from '../../services/firestoreData';
import { Link } from 'react-router-dom';

function Pending() {
  const [pendingNotes, setPendingNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchPendingNotes = async () => {
      // No need to check currentUser - ProtectedRoute already handles it
      try {
        setLoading(true);
        const notes = await Notes.listPending(currentUser.uid);
        setPendingNotes(notes);
        setError(null);
      } catch (err) {
        console.error('Error fetching pending notes:', err);
        setError('Failed to load pending notes');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPendingNotes();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading pending notes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md mb-4">
            <p className="font-semibold">{error}</p>
          </div>
          <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Pending Review</h1>
          <p className="text-gray-600">Your uploaded notes waiting for approval</p>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <span className="text-2xl">🕒</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{pendingNotes.length}</p>
              <p className="text-gray-600">Notes Pending Approval</p>
            </div>
          </div>
        </div>

        {pendingNotes.length === 0 ? (
          <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Notes</h3>
            <p className="text-gray-600 mb-6">You don't have any notes waiting for review</p>
            <Link
              to="/upload"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Upload New Note
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="bg-yellow-50 border-b border-yellow-100 px-4 py-2">
                  <span className="inline-flex items-center gap-2 text-yellow-700 text-sm font-medium">
                    🕒 Pending Review
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                    {note.title || 'Untitled Note'}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {note.description || 'No description'}
                  </p>

                  <div className="space-y-2 text-sm text-gray-500">
                    {note.subject && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Subject:</span>
                        <span>{note.subject}</span>
                      </div>
                    )}

                    {note.semester && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Semester:</span>
                        <span>{note.semester}</span>
                      </div>
                    )}

                    {note.createdAt && (
                      <div className="flex items-center gap-2 text-gray-400">
                        <span>📅</span>
                        <span>
                          Uploaded {new Date(note.createdAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500">Your note is being reviewed by our team</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pendingNotes.length > 0 && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">What happens next?</h4>
            <ul className="text-blue-800 text-sm space-y-2">
              <li>• Our team will review your notes within 24-48 hours</li>
              <li>• You'll receive a notification once approved or if changes are needed</li>
              <li>• Approved notes will appear in the public notes library</li>
              <li>• You can upload more notes while waiting for review</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Pending;
