import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../services/firebase';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
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

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin && user) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/notes');
    }
  }, [isAdmin, user, navigate]);

  // Show loading while checking auth
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <ShieldExclamationIcon className="h-24 w-24 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Only administrators can upload notes.
          </p>
          <button 
            onClick={() => navigate('/notes')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Browse Notes
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast.error('Only PDF and image files are allowed');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    
    try {
      // Upload file to Firebase Storage
      const timestamp = Date.now();
      const fileName = `notes/${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      const snapshot = await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(snapshot.ref);
      
      // Create note document in Firestore
      const noteData = {
        title: formData.title,
        universityId: formData.university,
        departmentId: formData.department,
        subject: formData.subject,
        semester: parseInt(formData.semester),
        courseCode: formData.courseCode,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'approved', // Admin uploads are auto-approved
        createdBy: user.uid,
        authorName: user.displayName || user.email,
        authorEmail: user.email,
        fileUrl: fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        downloads: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Save to Firestore
      await addDoc(collection(db, 'notes'), noteData);
      
      setUploading(false);
      setUploadSuccess(true);
      toast.success('Note uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
    }
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Upload Successful!</h2>
          <p className="text-gray-600 mb-6">Your note has been uploaded and is now available.</p>
          <div className="space-x-4">
            <button 
              onClick={() => {
                setUploadSuccess(false);
                setFile(null);
                setFormData({
                  title: '',
                  university: '',
                  department: '',
                  subject: '',
                  semester: '',
                  courseCode: '',
                  description: '',
                  tags: ''
                });
              }} 
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Upload Another
            </button>
            <button 
              onClick={() => navigate('/notes')} 
              className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              View Notes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Admin Badge */}
        <div className="mb-6 inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
          <ShieldExclamationIcon className="h-5 w-5 mr-2" />
          Admin Upload Panel
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload Notes</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Upload File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
              {file ? (
                <div className="space-y-4">
                  <DocumentTextIcon className="h-16 w-16 text-blue-600 mx-auto" />
                  <p className="text-gray-900 font-medium">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors text-sm"
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
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PDF or Image files only (Max 50MB)</p>
                </>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., Advanced Calculus Notes - Chapter 5"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">University *</label>
                <select
                  value={formData.university}
                  onChange={(e) => setFormData({...formData, university: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select University</option>
                  <option value="MIT">MIT</option>
                  <option value="Harvard">Harvard</option>
                  <option value="Stanford">Stanford</option>
                  <option value="Berkeley">UC Berkeley</option>
                  <option value="Oxford">Oxford</option>
                  <option value="Cambridge">Cambridge</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Business">Business</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., Calculus III"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CS201"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                required
                placeholder="Provide a detailed description of the notes content..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., algorithms, data structures, exam prep"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Admin Upload</p>
                <p>As an administrator, your uploads are automatically approved and immediately available to all users.</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-3 px-4 rounded-full font-medium transition-colors ${
              uploading || !file
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Note'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;