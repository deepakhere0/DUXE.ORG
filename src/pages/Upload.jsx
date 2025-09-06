import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const Upload = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    university: '',
    department: '',
    subject: '',
    semester: '',
    courseCode: '',
    description: '',
    tags: ''
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/'))) {
      setFile(selectedFile);
    } else {
      alert('Please select a PDF or image file');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    // Add Firebase upload logic here
    setTimeout(() => {
      setUploading(false);
      setUploadSuccess(true);
    }, 2000);
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-6">Your notes are under review and will be available soon.</p>
          <button onClick={() => navigate('/dashboard')} className="btn btn-primary btn-md">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">Upload Notes</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="card">
            <div className="card-body">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Upload File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                {file ? (
                  <div className="space-y-4">
                    <DocumentTextIcon className="h-16 w-16 text-accent-500 mx-auto" />
                    <p className="text-gray-900 font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,image/*"
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label htmlFor="file-upload" className="btn btn-primary btn-md cursor-pointer">
                      Choose File
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PDF or Image files only (Max 50MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="card">
            <div className="card-body space-y-4">
              <div>
                <label className="label">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="input"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">University</label>
                  <select
                    value={formData.university}
                    onChange={(e) => setFormData({...formData, university: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select University</option>
                    <option value="MIT">MIT</option>
                    <option value="Harvard">Harvard</option>
                    <option value="Stanford">Stanford</option>
                  </select>
                </div>

                <div>
                  <label className="label">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="input"
                    required
                  >
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>{sem}st Semester</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Course Code</label>
                  <input
                    type="text"
                    value={formData.courseCode}
                    onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                    className="input"
                    placeholder="e.g., CS201"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="input h-32"
                  required
                />
              </div>

              <div>
                <label className="label">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  className="input"
                  placeholder="e.g., algorithms, data structures, exam prep"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Review Process</p>
                <p>Your upload will be reviewed within 24-48 hours. Once approved, it will be available to all students.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="btn btn-primary btn-lg w-full"
          >
            {uploading ? 'Uploading...' : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
