import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  CloudArrowUpIcon,
  DocumentTextIcon,
  XMarkIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ShieldExclamationIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../services/firebase';
import toast from 'react-hot-toast';

const Upload = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [debugInfo, setDebugInfo] = useState([]);
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

  // Debug logging helper
  const addDebugInfo = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    console.log(logEntry, data);
    setDebugInfo(prev => [...prev, logEntry].slice(-10)); // Keep last 10 entries
  };

  // Check Firebase configuration on component mount
  useEffect(() => {
    if (!isFirebaseConfigured) {
      addDebugInfo('⚠️ Firebase not properly configured');
      toast.error('Firebase is not properly configured. Please check environment variables.');
    } else {
      addDebugInfo('✅ Firebase configuration verified');
    }
  }, []);

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin && user) {
      addDebugInfo('❌ Access denied - user is not admin');
      toast.error('Access denied. Admin privileges required.');
      navigate('/notes');
    } else if (isAdmin && user) {
      addDebugInfo('✅ Admin access confirmed', { email: user.email, role: user.userData?.role });
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
    
    // Initial validation
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!isFirebaseConfigured) {
      toast.error('Firebase is not properly configured. Cannot upload files.');
      return;
    }

    if (!user || !isAdmin) {
      toast.error('Admin authentication required');
      return;
    }

    // Reset states
    setUploading(true);
    setUploadProgress(0);
    setCurrentStep('Starting upload...');
    addDebugInfo('🚀 Starting upload process', { fileName: file.name, fileSize: file.size });
    
    try {
      // Step 1: Validate user permissions in Firestore first
      setCurrentStep('Validating admin permissions...');
      addDebugInfo('🔐 Validating user permissions in database');
      
      // Skip database check if we already know user is admin from AuthContext
      if (isAdmin) {
        addDebugInfo('✅ Admin permissions verified from Auth Context');
      } else {
        // Double-check in database if AuthContext says not admin
        const userDoc = doc(db, 'users', user.uid);
        const userData = await import('firebase/firestore').then(({ getDoc }) => getDoc(userDoc));
        
        if (!userData.exists()) {
          addDebugInfo('⚠️ User document not found in database, creating admin document');
          // Create admin document for authenticated user
          await import('firebase/firestore').then(({ setDoc }) => 
            setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || user.email,
              role: 'admin',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              bookmarks: [],
              skills: []
            })
          );
          addDebugInfo('✅ Admin document created');
        } else {
          const userRole = userData.data().role;
          const normalizedRole = userRole ? String(userRole).trim().toLowerCase() : 'user';
          
          if (normalizedRole !== 'admin') {
            addDebugInfo(`❌ User role is '${userRole}' (normalized: '${normalizedRole}'), not admin`);
            throw new Error(`Insufficient permissions. User role: ${userRole || 'not set'}. Please ensure your account has admin privileges.`);
          }
          addDebugInfo('✅ Admin permissions verified in database');
        }
      }
      
      // Step 2: Upload file to Firebase Storage with progress tracking
      setCurrentStep('Uploading file to storage...');
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `notes/${timestamp}_${sanitizedFileName}`;
      
      addDebugInfo('📁 Uploading file to storage', { path: fileName });
      
      let fileUrl = '';
      
      // Check if storage is available
      if (!storage) {
        addDebugInfo('⚠️ Storage service not available');
        throw new Error('Firebase Storage service is not available');
      }
      
      const storageRef = ref(storage, fileName);
      
      // Use resumable upload for better reliability
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      fileUrl = await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          (snapshot) => {
            // Progress tracking
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
            setCurrentStep(`Uploading file: ${Math.round(progress)}%`);
            addDebugInfo(`📄 Upload progress: ${Math.round(progress)}%`);
          }, 
          (error) => {
            // Handle upload errors
            addDebugInfo('❌ Storage upload failed', error);
            reject(error);
          }, 
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              addDebugInfo('✅ File uploaded successfully, URL obtained');
              resolve(downloadURL);
            } catch (urlError) {
              addDebugInfo('❌ Failed to get download URL', urlError);
              reject(urlError);
            }
          }
        );
      });
      
      // Step 3: Create note document in Firestore
      setCurrentStep('Saving note information...');
      addDebugInfo('💾 Creating Firestore document');
      
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
        ratingAvg: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      addDebugInfo('💾 Saving to Firestore', { title: noteData.title, status: noteData.status });
      
      const docRef = await addDoc(collection(db, 'notes'), noteData);
      
      addDebugInfo('✅ Document saved successfully', { documentId: docRef.id });
      
      // Success!
      setUploadProgress(100);
      setCurrentStep('Upload completed successfully!');
      setUploading(false);
      setUploadSuccess(true);
      toast.success('🎉 Note uploaded successfully!');
      
      addDebugInfo('🎉 Upload process completed successfully');
    } catch (error) {
      // Log detailed error information
      setCurrentStep('Error occurred');
      addDebugInfo('❌ Upload failed', { 
        message: error.message,
        code: error.code || 'no_code',
        stack: error.stack?.split('\n')[0] || 'no_stack'
      });
      
      console.error('Upload error details:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Upload failed: ';
      let recoveryTip = '';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'Permission denied.';
        recoveryTip = 'Your account does not have permission to upload files. Please check your admin role or Firebase Storage rules.';
        addDebugInfo('🛑 Storage permission denied');
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'Upload was canceled.';
        recoveryTip = 'Please try uploading again.';
      } else if (error.code === 'storage/server-file-wrong-size') {
        errorMessage += 'Upload failed due to network issues.';
        recoveryTip = 'Try uploading a smaller file or check your internet connection.';
      } else if (error.code === 'storage/retry-limit-exceeded') {
        errorMessage += 'Upload timed out.';
        recoveryTip = 'Try again with a more stable internet connection or a smaller file.';
      } else if (error.code === 'storage/unknown' || error.message.includes('Firebase Storage')) {
        errorMessage += 'Storage service error.';
        recoveryTip = 'Check Firebase configuration and try again.';
      } else if (error.message.includes('permission') || error.message.includes('Permission')) {
        errorMessage += 'Permission issue detected.';
        recoveryTip = 'Verify your admin status and permissions.';
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        errorMessage += 'Network issue detected.';
        recoveryTip = 'Please check your internet connection and try again.';
      } else {
        errorMessage += error.message;
      }
      
      // Show error toast with recovery tip
      toast.error(errorMessage);
      if (recoveryTip) {
        setTimeout(() => {
          toast(recoveryTip, {
            icon: '❓',
            duration: 6000
          });
        }, 1000);
      }
      
      setUploading(false);
      setUploadProgress(0);
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
                setUploadProgress(0);
                setCurrentStep('');
                setDebugInfo([]);
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
        
        {/* Firebase Configuration Warning */}
        {!isFirebaseConfigured && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Firebase Configuration Required</p>
                <p>Firebase services are not properly configured. Please check your environment variables before uploading files.</p>
              </div>
            </div>
          </div>
        )}
        
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

          {/* Upload Progress */}
          {uploading && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Uploading Note</h3>
                <p className="text-sm text-gray-600 mb-4">{currentStep}</p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-500">{uploadProgress}% completed</p>
              </div>
              
              {/* Debug Information */}
              {debugInfo.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 max-h-32 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-700 mb-2">Debug Information:</p>
                  {debugInfo.map((info, index) => (
                    <p key={index} className="text-xs text-gray-600 font-mono">{info}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className={`w-full py-3 px-4 rounded-full font-medium transition-colors ${
              uploading || !file
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Uploading... {uploadProgress}%</span>
              </div>
            ) : (
              'Upload Note'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;