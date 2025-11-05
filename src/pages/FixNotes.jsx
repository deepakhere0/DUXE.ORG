import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const FixNotes = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle, checking, fixing, done
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }]);
    console.log(message);
  };

  // Real working PDF URLs
  const workingPDFs = [
    'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf',
    'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  ];

  const checkAndFixNotes = async () => {
    setStatus('checking');
    setLogs([]);
    addLog('🔍 Starting database check...', 'info');

    try {
      // Get all notes
      const notesRef = collection(db, 'notes');
      const snapshot = await getDocs(notesRef);

      if (snapshot.empty) {
        addLog('❌ No notes found in database!', 'error');
        setStatus('done');
        setResults({ total: 0, valid: 0, invalid: 0, fixed: 0 });
        return;
      }

      addLog(`✅ Found ${snapshot.size} notes`, 'success');

      // Analyze notes
      const notesToFix = [];
      let validCount = 0;

      snapshot.forEach((docSnap) => {
        const noteData = docSnap.data();
        const fileUrl = noteData.fileUrl || '';
        const title = noteData.title || 'Untitled';

        addLog(`Checking: ${title}...`, 'info');

        const isFakeUrl = fileUrl.includes('example.com') ||
                         fileUrl.includes('placeholder') ||
                         !fileUrl.startsWith('http') ||
                         !fileUrl;

        if (isFakeUrl) {
          addLog(`   ❌ Invalid URL: ${fileUrl || 'MISSING'}`, 'error');
          notesToFix.push({
            id: docSnap.id,
            title: title,
            currentUrl: fileUrl || 'MISSING'
          });
        } else {
          addLog(`   ✅ Valid URL`, 'success');
          validCount++;
        }
      });

      if (notesToFix.length === 0) {
        addLog('\n✅ All notes have valid URLs!', 'success');
        setStatus('done');
        setResults({
          total: snapshot.size,
          valid: validCount,
          invalid: 0,
          fixed: 0
        });
        return;
      }

      addLog(`\n🔧 Found ${notesToFix.length} notes that need fixing`, 'warning');
      setStatus('fixing');

      // Fix notes
      let fixedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < notesToFix.length; i++) {
        const note = notesToFix[i];
        const newUrl = workingPDFs[i % workingPDFs.length];

        addLog(`\nFixing: ${note.title}`, 'info');
        addLog(`   Old: ${note.currentUrl}`, 'info');
        addLog(`   New: ${newUrl}`, 'info');

        try {
          const noteRef = doc(db, 'notes', note.id);
          await updateDoc(noteRef, {
            fileUrl: newUrl,
            fileType: 'application/pdf',
            updatedAt: new Date().toISOString()
          });

          addLog(`   ✅ Fixed!`, 'success');
          fixedCount++;
        } catch (error) {
          addLog(`   ❌ Failed: ${error.message}`, 'error');
          failedCount++;
        }
      }

      addLog(`\n${'='.repeat(50)}`, 'info');
      addLog('📊 SUMMARY', 'info');
      addLog(`Total notes: ${snapshot.size}`, 'info');
      addLog(`Already valid: ${validCount}`, 'success');
      addLog(`Fixed: ${fixedCount}`, 'success');
      if (failedCount > 0) {
        addLog(`Failed: ${failedCount}`, 'error');
      }
      addLog('='.repeat(50), 'info');

      setStatus('done');
      setResults({
        total: snapshot.size,
        valid: validCount,
        invalid: notesToFix.length,
        fixed: fixedCount,
        failed: failedCount
      });

      if (fixedCount > 0) {
        addLog('\n✅ SUCCESS! Notes have been fixed!', 'success');
        addLog('📌 Refresh your browser and try previewing notes', 'info');
      }

    } catch (error) {
      addLog(`\n❌ ERROR: ${error.message}`, 'error');
      setStatus('done');
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Fix Notes Preview
          </h1>
          <p className="text-gray-600">
            This tool will scan your database and fix any notes with invalid PDF URLs.
          </p>
        </div>

        {/* Action Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to Fix?
              </h2>
              <p className="text-gray-600 text-sm">
                Click the button to check and fix all notes with invalid URLs
              </p>
            </div>
            <button
              onClick={checkAndFixNotes}
              disabled={status === 'checking' || status === 'fixing'}
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
            >
              {status === 'idle' && '🚀 Check & Fix Notes'}
              {status === 'checking' && '🔍 Checking...'}
              {status === 'fixing' && '🔧 Fixing...'}
              {status === 'done' && '✅ Done! Click to Re-run'}
            </button>
          </div>
        </div>

        {/* Results Summary */}
        {results && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Results
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{results.total}</div>
                <div className="text-sm text-gray-600">Total Notes</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{results.valid}</div>
                <div className="text-sm text-gray-600">Already Valid</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{results.fixed || 0}</div>
                <div className="text-sm text-gray-600">Fixed</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{results.failed || 0}</div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            {results.fixed > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium mb-2">✅ Success!</p>
                <p className="text-green-700 text-sm mb-3">
                  {results.fixed} note{results.fixed > 1 ? 's' : ''} ha{results.fixed > 1 ? 've' : 's'} been fixed with valid PDF URLs.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                  >
                    🔄 Refresh Page
                  </button>
                  <button
                    onClick={() => navigate('/notes')}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
                  >
                    📝 Go to Notes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              📋 Activity Log
            </h2>
            <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className={`${getLogColor(log.type)} mb-1`}>
                  <span className="text-gray-500">[{log.time}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default FixNotes;
