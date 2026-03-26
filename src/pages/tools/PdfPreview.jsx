import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { 
  FiArrowLeft, 
  FiDownload, 
  FiZoomIn, 
  FiZoomOut, 
  FiChevronLeft, 
  FiChevronRight,
  FiMaximize,
  FiMinimize
} from 'react-icons/fi';
import { getNoteById } from '../../services/firestoreData';
import toast from 'react-hot-toast';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function PDFPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const noteData = await getNoteById(id);
        
        if (!noteData) {
          setError('Note not found');
          toast.error('Note not found');
          return;
        }

        if (!noteData.fileUrl) {
          setError('PDF file not available');
          toast.error('PDF file not available');
          return;
        }

        setNote(noteData);
      } catch (err) {
        console.error('Error fetching note:', err);
        setError('Failed to load note');
        toast.error('Failed to load note');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNote();
    }
  }, [id]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
    setError('Failed to load PDF');
    toast.error('Failed to load PDF file');
  };

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => {
      const newPage = prevPageNumber + offset;
      if (newPage < 1) return 1;
      if (newPage > numPages) return numPages;
      return newPage;
    });
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    if (note?.fileUrl) {
      window.open(note.fileUrl, '_blank');
      toast.success('Opening download...');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {error || 'Note not found'}
          </h2>
          <p className="text-gray-400 mb-6">
            The PDF you're looking for is not available
          </p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            <FiArrowLeft />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Back Button & Title */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors group"
              >
                <FiArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">Back</span>
              </button>
              
              <div className="h-8 w-px bg-gray-700"></div>
              
              <div>
                <h1 className="text-white font-semibold text-lg truncate max-w-xs md:max-w-md">
                  {note.title || 'Untitled Document'}
                </h1>
                <p className="text-gray-400 text-xs">
                  {note.subject || 'PDF Preview'}
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="hidden sm:flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                title="Download PDF"
              >
                <FiDownload />
                <span className="hidden md:inline">Download</span>
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? <FiMinimize /> : <FiMaximize />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Controls Bar */}
        <div className="bg-gray-800 border-b border-gray-700 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              {/* Page Navigation */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => changePage(-1)}
                  disabled={pageNumber <= 1}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Previous Page"
                >
                  <FiChevronLeft className="text-xl" />
                </button>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg">
                  <input
                    type="number"
                    min={1}
                    max={numPages || 1}
                    value={pageNumber}
                    onChange={(e) => {
                      const page = parseInt(e.target.value);
                      if (page >= 1 && page <= numPages) {
                        setPageNumber(page);
                      }
                    }}
                    className="w-12 bg-transparent text-white text-center outline-none"
                  />
                  <span className="text-gray-400">/ {numPages || '?'}</span>
                </div>
                
                <button
                  onClick={() => changePage(1)}
                  disabled={pageNumber >= numPages}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Next Page"
                >
                  <FiChevronRight className="text-xl" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleZoomOut}
                  disabled={scale <= 0.5}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <FiZoomOut className="text-xl" />
                </button>
                
                <span className="text-white font-medium min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                
                <button
                  onClick={handleZoomIn}
                  disabled={scale >= 3.0}
                  className="p-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <FiZoomIn className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-900 p-4">
          <div className="flex justify-center">
            <div className="shadow-2xl">
              <Document
                file={note.fileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500"></div>
                  </div>
                }
                error={
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
                    <p className="text-red-400 font-medium">Failed to load PDF</p>
                    <p className="text-red-300 text-sm mt-2">Please try refreshing the page</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className="shadow-xl"
                />
              </Document>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Download Button (Floating) */}
      <button
        onClick={handleDownload}
        className="sm:hidden fixed bottom-6 right-6 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-lg transition-colors z-50"
        title="Download PDF"
      >
        <FiDownload className="text-xl" />
      </button>
    </div>
  );
}

export default PDFPreview;