import React from 'react';
import Rating from './Rating';
import { BookmarkIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const NoteCard = ({ meta, onBookmark, onPreview, onDownload }) => {
  return (
    <div className="card h-full flex flex-col">
      <div className="card-body flex-1">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{meta.title}</h3>
            <p className="text-sm text-gray-600">{meta.courseCode} • {meta.subject} • Sem {meta.semester}</p>
            <p className="text-xs text-gray-500 mt-1">{meta.universityName} • {meta.departmentName}</p>
          </div>
          {typeof meta.ratingAvg === 'number' && <Rating value={meta.ratingAvg || 0} />}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div>Pages: <span className="font-medium text-gray-900">{meta.pages ?? '-'}</span></div>
          <div>Downloads: <span className="font-medium text-gray-900">{meta.downloads ?? 0}</span></div>
          <div>Status: <span className="font-medium text-gray-900 capitalize">{meta.status || 'approved'}</span></div>
        </div>
      </div>
      <div className="p-4 pt-0 flex items-center justify-between">
        <div className="text-sm text-gray-500">By {meta.authorName || 'Unknown'}</div>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => onPreview?.(meta)}>
            <EyeIcon className="h-4 w-4 mr-1" /> Preview
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => onDownload?.(meta)}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" /> Download
          </button>
          <button className="btn btn-subtle btn-sm" onClick={() => onBookmark?.(meta)} aria-label="Bookmark">
            <BookmarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;

