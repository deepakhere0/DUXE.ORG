import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../services/storage';
import { createNote } from '../services/firestoreData';
import { showToast } from '../components/common/Toast';
import { Upload as UploadIcon, File, X, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import NotePreviewModal from '../components/notes/NotePreviewModal';

const Upload = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    courseCode: '',
    subject: '',
    semester: '',
    universityId: 'uni1',
    departmentId: 'dept1',
    pages: '',
    description: '',
  });

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file selection
  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      // Validate file size
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (selectedFile.size > maxSize) {
        setError('File too large. Maximum size: 50MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.webp'];
      const fileExt = '.' + selectedFile.name.split('.').pop().toLowerCase();
      if (!allowedTypes.includes(fileExt)) {
        setError('Invalid file type. Allowed: PDF, Word, Images');
        return;
      }

      setFile(selectedFile);
      setError(null);
      console.log('📎 File selected:', selectedFile.name);
    }
  };

  // Handle preview before upload
  const handlePreview = () => {
    if (!file) {
      showToast('Please select a file first', 'error');
      return;
    }

    // Create temporary URL for preview
    const fileUrl = URL.createObjectURL(file);
    const previewNote = {
      title: formData.title || 'Preview',
      subject: formData.subject || 'N/A',
      authorName: currentUser.displayName || currentUser.email || 'You',
      createdAt: new Date(),
      fileUrl: fileUrl,
      fileName: file.name,
      fileType: file.type,
    };

    setPreviewFile(previewNote);
    setIsPreviewOpen(true);
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Validate form
  const validateForm = () => {
    if (!file) {
      showToast('Please select a file', 'error');
      return false;
    }

    const required = ['title', 'courseCode', 'subject', 'semester', 'universityId', 'departmentId'];
    for (const field of required) {
      if (!formData[field]?.trim()) {
        showToast(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
        return false;
      }
    }

    return true;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('🎯 Form submitted');
    console.log('👤 Current user:', currentUser);
    console.log('📄 File:', file);

    if (!validateForm()) return;

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      console.log('📤 Starting file upload...');

      // Upload file to Storage
      const uploadResult = await uploadFile(file, {
        path: 'notes',
        userId: currentUser.uid,
        onProgress: (progress) => {
          console.log('Progress:', progress + '%');
          setUploadProgress(progress);
        },
      });

      console.log('✅ File uploaded:', uploadResult);

      // Create note in Firestore
      const noteData = {
        title: formData.title.trim(),
        courseCode: formData.courseCode.trim().toUpperCase(),
        subject: formData.subject.trim(),
        semester: formData.semester.trim(),
        universityId: formData.universityId,
        departmentId: formData.departmentId,
        pages: parseInt(formData.pages) || 0,
        description: formData.description.trim(),
        fileUrl: uploadResult.downloadURL,
        fileName: uploadResult.fileName,
        filePath: uploadResult.fullPath,
        fileSize: uploadResult.size,
        fileType: uploadResult.type,
        authorName: currentUser.displayName || currentUser.email,
        createdBy: currentUser.uid,
        status: 'pending',
        ratingAvg: 0,
        ratingCount: 0,
        downloads: 0,
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      console.log('💾 Creating note document:', noteData);

      await createNote(noteData);

      console.log('🎉 Note created successfully!');

      showToast('Note submitted successfully! It will be reviewed by our team.', 'success');

      // Reset form
      setFormData({
        title: '',
        courseCode: '',
        subject: '',
        semester: '',
        universityId: 'uni1',
        departmentId: 'dept1',
        pages: '',
        description: '',
      });
      setFile(null);
      setUploadProgress(0);

      // Redirect after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err.message || 'Failed to upload. Please try again.');
      showToast(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Format file size
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Study Material</h1>
          <p className="mt-2 text-gray-600">
            Share your notes with the community. All uploads are reviewed before publishing.
          </p>
        </div>

        {/* Development Mode Warning */}
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="font-medium text-yellow-800">Development Mode</p>
              <p className="text-sm text-yellow-700">
                Simplified upload without strict permission checking. For development only.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-8 space-y-8">
          {/* File Upload */}
          <div>
            <h2 className="text-xl font-semibold mb-4">1. Upload Your File</h2>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center transition-all
                ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}
                ${file ? 'border-green-500 bg-green-50' : ''}
                ${error ? 'border-red-500 bg-red-50' : ''}
              `}
            >
              <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp"
                className="hidden"
                id="file-input"
                disabled={uploading}
              />

              {!file ? (
                <div className="space-y-4">
                  <UploadIcon className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Drop your file here or{' '}
                      <label
                        htmlFor="file-input"
                        className="text-blue-600 hover:text-blue-700 cursor-pointer underline"
                      >
                        browse
                      </label>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: PDF, Word, Images (Max 50MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3 flex-1">
                    <File className="w-8 h-8 text-blue-500" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  {!uploading && (
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="ml-4 p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  )}
                  {uploading && uploadProgress === 100 && (
                    <CheckCircle className="w-6 h-6 text-green-500 ml-4" />
                  )}
                </div>
              )}

              {/* Progress Bar */}
              {uploading && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Uploading... {uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Upload Error</p>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div>
            <h2 className="text-xl font-semibold mb-4">2. Note Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures Complete Notes"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={uploading}
                />
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="courseCode"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                  placeholder="e.g., CS201"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={uploading}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Data Structures"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={uploading}
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester *
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={uploading}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Pages
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  placeholder="e.g., 45"
                  min="1"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                />
              </div>

              {/* University */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University *
                </label>
                <select
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={uploading}
                >
                  <option value="uni1">MIT</option>
                  <option value="uni2">Stanford</option>
                  <option value="uni3">Harvard</option>
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={uploading}
                >
                  <option value="dept1">Computer Science</option>
                  <option value="dept2">Electronics</option>
                  <option value="dept3">Mechanical</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Add any additional details..."
                  rows="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handlePreview}
              disabled={!file || uploading}
              className="flex items-center justify-center gap-2 py-3 px-6 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>

            <button
              type="submit"
              disabled={uploading || !file}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? `Uploading... ${uploadProgress}%` : 'Submit for Review'}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormData({
                  title: '',
                  courseCode: '',
                  subject: '',
                  semester: '',
                  universityId: 'uni1',
                  departmentId: 'dept1',
                  pages: '',
                  description: '',
                });
                setFile(null);
                setError(null);
              }}
              disabled={uploading}
              className="py-3 px-6 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 font-medium"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Preview Modal */}
        <NotePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            if (previewFile?.fileUrl) {
              URL.revokeObjectURL(previewFile.fileUrl);
            }
            setPreviewFile(null);
          }}
          note={previewFile}
        />
      </div>
    </div>
  );
};

export default Upload;
