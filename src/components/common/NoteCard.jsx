import React from 'react';
import Rating from './Rating';
import { BookmarkIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const NoteCard = ({ meta, onBookmark, onPreview, onDownload }) => {
  return (
    <article className="card h-full flex flex-col" aria-label={`Note: ${meta.title}`}>
      <div className="card-body flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1 mr-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{meta.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              <span aria-label="Course code">{meta.courseCode}</span> • 
              <span aria-label="Subject">{meta.subject}</span> • 
              <span aria-label="Semester">Sem {meta.semester}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              <span aria-label="University">{meta.universityName}</span> • 
              <span aria-label="Department">{meta.departmentName}</span>
            </p>
          </div>
          {typeof meta.ratingAvg === 'number' && <Rating value={meta.ratingAvg || 0} />}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600" role="list">
          <div role="listitem">
            <span className="sr-only">Number of pages:</span>
            Pages: <span className="font-medium text-gray-900" aria-label={`${meta.pages ?? 0} pages`}>{meta.pages ?? '-'}</span>
          </div>
          <div role="listitem">
            <span className="sr-only">Download count:</span>
            Downloads: <span className="font-medium text-gray-900" aria-label={`${meta.downloads ?? 0} downloads`}>{meta.downloads ?? 0}</span>
          </div>
          <div role="listitem">
            <span className="sr-only">Status:</span>
            Status: <span className="font-medium text-gray-900 capitalize" aria-label={`Status: ${meta.status || 'approved'}`}>{meta.status || 'approved'}</span>
          </div>
        </div>
      </div>
      <div className="p-4 pt-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-500">
          <span className="sr-only">Author:</span>
          By {meta.authorName || 'Unknown'}
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="btn btn-secondary btn-sm min-h-[44px] px-3" 
            onClick={() => onPreview?.(meta)}
            aria-label={`Preview ${meta.title}`}
          >
            <EyeIcon className="h-4 w-4 mr-1" aria-hidden="true" /> 
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button 
            className="btn btn-primary btn-sm min-h-[44px] px-3" 
            onClick={() => onDownload?.(meta)}
            aria-label={`Download ${meta.title}`}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" aria-hidden="true" /> 
            <span className="hidden sm:inline">Download</span>
          </button>
          <button 
            className="btn btn-subtle btn-sm min-h-[44px] min-w-[44px]" 
            onClick={() => onBookmark?.(meta)} 
            aria-label={`Bookmark ${meta.title}`}
            title="Bookmark"
          >
            <BookmarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default NoteCard;

