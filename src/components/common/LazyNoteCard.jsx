import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import NoteCard from './NoteCard';
import { SkeletonCard } from './Skeleton';

const LazyNoteCard = ({ meta, onPreview, onDownload, onBookmark }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div ref={ref} className="min-h-[320px]">
      {isVisible ? (
        <NoteCard
          meta={meta}
          onPreview={onPreview}
          onDownload={onDownload}
          onBookmark={onBookmark}
        />
      ) : (
        <SkeletonCard />
      )}
    </div>
  );
};

export default LazyNoteCard;
