import React, { useEffect } from 'react';

const MediaViewer = ({ open, onClose, type = 'pdf', src, title }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white w-full h-full md:h-[90%] md:w-[90%] rounded-2xl shadow-glass overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h3 className="font-semibold text-gray-900 truncate">{title || (type.toUpperCase() + ' Preview')}</h3>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close</button>
          </div>
          <div className="flex-1 bg-gray-50">
            {type === 'pdf' ? (
              <iframe title={title || 'PDF'} src={src} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <img src={src} alt={title || 'Image'} className="max-h-full max-w-full" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewer;

