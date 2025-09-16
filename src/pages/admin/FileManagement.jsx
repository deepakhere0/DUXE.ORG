import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll,
  getMetadata 
} from 'firebase/storage';
import { db, storage } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { 
  DocumentIcon, 
  PhotoIcon,
  VideoCameraIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ChevronRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FileManagement = () => {
  const { isAdmin } = useAuth();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewModal, setPreviewModal] = useState(false);

  // Fetch all files from storage and database
  useEffect(() => {
    const fetchFiles = async () => {
      if (!isAdmin) return;

      try {
        // Get files from database (notes with file URLs)
        const notesQuery = query(
          collection(db, 'notes'),
          orderBy('createdAt', 'desc')
        );
        const notesSnapshot = await getDocs(notesQuery);
        
        const filesList = [];
        
        for (const noteDoc of notesSnapshot.docs) {
          const noteData = noteDoc.data();
          if (noteData.fileUrl) {
            try {
              // Try to get file metadata if it exists in storage
              const fileName = noteData.fileUrl.split('/').pop().split('?')[0];
              const fileRef = ref(storage, `notes/${fileName}`);
              
              try {
                const metadata = await getMetadata(fileRef);
                filesList.push({
                  id: noteDoc.id,
                  name: noteData.title || fileName,
                  url: noteData.fileUrl,
                  type: getFileType(noteData.fileUrl),
                  size: metadata.size || 0,
                  uploadedAt: noteData.createdAt?.toDate() || new Date(),
                  uploadedBy: noteData.authorName || 'Unknown',
                  status: noteData.status || 'unknown',
                  path: `notes/${fileName}`,
                  associatedNote: {
                    id: noteDoc.id,
                    title: noteData.title,
                    courseCode: noteData.courseCode,
                    university: noteData.universityId
                  }
                });
              } catch (metaError) {
                // If metadata fetch fails, still add the file with basic info
                filesList.push({
                  id: noteDoc.id,
                  name: noteData.title || 'Unknown File',
                  url: noteData.fileUrl,
                  type: getFileType(noteData.fileUrl),
                  size: 0,
                  uploadedAt: noteData.createdAt?.toDate() || new Date(),
                  uploadedBy: noteData.authorName || 'Unknown',
                  status: noteData.status || 'unknown',
                  path: noteData.fileUrl,
                  associatedNote: {
                    id: noteDoc.id,
                    title: noteData.title,
                    courseCode: noteData.courseCode,
                    university: noteData.universityId
                  }
                });
              }
            } catch (error) {
              console.error('Error processing file:', error);
            }
          }
        }
        
        setFiles(filesList);
        setFilteredFiles(filesList);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to load files');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [isAdmin]);

  // Filter files based on search and type
  useEffect(() => {
    let filtered = files;

    if (searchTerm) {
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.associatedNote?.courseCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => file.type === typeFilter);
    }

    setFilteredFiles(filtered);
  }, [searchTerm, typeFilter, files]);

  const getFileType = (url) => {
    if (!url) return 'unknown';
    const extension = url.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) return 'image';
    if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
    if (['doc', 'docx'].includes(extension)) return 'document';
    return 'other';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return 'Unknown size';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
      case 'document':
        return DocumentIcon;
      case 'image':
        return PhotoIcon;
      case 'video':
        return VideoCameraIcon;
      default:
        return DocumentIcon;
    }
  };

  const getFileTypeColor = (type) => {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'image':
        return 'bg-green-100 text-green-800';
      case 'video':
        return 'bg-purple-100 text-purple-800';
      case 'document':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFileUpload = async (uploadedFiles) => {
    setUploadLoading(true);
    
    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const timestamp = Date.now();
        const fileName = `admin-upload-${timestamp}-${file.name}`;
        const storageRef = ref(storage, `admin-uploads/${fileName}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Create a database entry for the uploaded file
        const newNote = {
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          fileUrl: downloadURL,
          status: 'approved', // Admin uploads are auto-approved
          authorName: 'Admin Upload',
          createdAt: serverTimestamp(),
          createdBy: 'admin',
          courseCode: 'ADMIN',
          subject: 'Administrative',
          universityId: 'admin',
          departmentId: 'admin',
          semester: 'N/A',
          pages: 0,
          ratingAvg: 0,
          downloads: 0
        };

        // Add to database
        const docRef = await addDoc(collection(db, 'notes'), newNote);
        
        return {
          id: docRef.id,
          name: file.name,
          url: downloadURL,
          type: getFileType(file.name),
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: 'Admin',
          status: 'approved',
          path: `admin-uploads/${fileName}`,
          associatedNote: {
            id: docRef.id,
            title: newNote.title,
            courseCode: 'ADMIN',
            university: 'admin'
          }
        };
      });

      const newFiles = await Promise.all(uploadPromises);
      setFiles(prev => [...newFiles, ...prev]);
      setFilteredFiles(prev => [...newFiles, ...prev]);
      
      toast.success(`${newFiles.length} file(s) uploaded successfully`);
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Delete from storage if it's in our storage
      if (file.path && file.path.startsWith('notes/') || file.path.startsWith('admin-uploads/')) {
        const fileRef = ref(storage, file.path);
        await deleteObject(fileRef);
      }

      // Delete associated note from database
      if (file.associatedNote?.id) {
        await deleteDoc(doc(db, 'notes', file.associatedNote.id));
      }

      // Update local state
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setFilteredFiles(prev => prev.filter(f => f.id !== file.id));

      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  const UploadModal = () => {
    const [dragOver, setDragOver] = useState(false);
    const [filesToUpload, setFilesToUpload] = useState([]);

    const handleFileSelect = (files) => {
      const fileList = Array.from(files);
      setFilesToUpload(prev => [...prev, ...fileList]);
    };

    const removeFile = (index) => {
      setFilesToUpload(prev => prev.filter((_, i) => i !== index));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Upload Files</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFilesToUpload([]);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${
                dragOver 
                  ? 'border-accent-500 bg-accent-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFileSelect(e.dataTransfer.files);
              }}
            >
              <CloudArrowUpIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-gray-600 mb-4">
                Supports PDF, images, documents, and videos
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.doc,.docx"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 cursor-pointer transition-colors"
              >
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                Select Files
              </label>
            </div>

            {/* Files to Upload */}
            {filesToUpload.length > 0 && (
              <div className="space-y-2 mb-6">
                <h3 className="font-medium text-gray-900">Files to Upload:</h3>
                {filesToUpload.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <DocumentIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setFilesToUpload([]);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFileUpload(filesToUpload)}
                disabled={filesToUpload.length === 0 || uploadLoading}
                className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ) : (
                  <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                )}
                Upload {filesToUpload.length} File(s)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PreviewModal = ({ file, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{file.name}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {file.type === 'image' ? (
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full h-auto mx-auto rounded-lg"
            />
          ) : file.type === 'pdf' ? (
            <iframe
              src={file.url}
              className="w-full h-[600px] border rounded-lg"
              title={file.name}
            />
          ) : (
            <div className="text-center py-12">
              <DocumentIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
              >
                <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                Download File
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">File Management</h1>
              <p className="text-gray-600">Manage uploaded files and storage</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {files.length} files
              </span>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
              >
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Files
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search files by name, author, or course code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
          >
            <option value="all">All File Types</option>
            <option value="pdf">PDF Files</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Files Grid */}
        {filteredFiles.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-600">
              {searchTerm || typeFilter !== 'all'
                ? 'No files match your current filters.'
                : 'No files have been uploaded yet.'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
            >
              <CloudArrowUpIcon className="h-4 w-4 mr-2" />
              Upload First File
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFiles.map(file => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <div key={file.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FileIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <h3 className="font-medium text-gray-900 truncate">{file.name}</h3>
                        <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getFileTypeColor(file.type)}`}>
                        {file.type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Uploaded by:</span> {file.uploadedBy}</p>
                    <p><span className="font-medium">Date:</span> {file.uploadedAt.toLocaleDateString()}</p>
                    {file.associatedNote?.courseCode && (
                      <p><span className="font-medium">Course:</span> {file.associatedNote.courseCode}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setPreviewModal(true);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-accent-600 bg-accent-50 rounded-lg hover:bg-accent-100 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Preview
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                        Download
                      </a>
                      
                      <button
                        onClick={() => deleteFile(file)}
                        className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && <UploadModal />}
      
      {/* Preview Modal */}
      {previewModal && selectedFile && (
        <PreviewModal 
          file={selectedFile} 
          onClose={() => {
            setPreviewModal(false);
            setSelectedFile(null);
          }} 
        />
      )}
    </div>
  );
};

export default FileManagement;
