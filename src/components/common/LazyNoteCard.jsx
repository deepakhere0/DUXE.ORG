import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import NoteCard from './NoteCard';
import { SkeletonCard } from './Skeleton';

const LazyNoteCard = ({ meta, onPreview, onDownload, onBookmark, userId }) => {
  const [ref, isVisible] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px'
  });

  return (
    <div ref={ref} className="min-h-[320px]">
      {isVisible ? (
        <NoteCard
          note={meta}
          onPreview={onPreview}
          onDownload={onDownload}
          onBookmark={onBookmark}
          userId={userId}
        />
      ) : (
        <SkeletonCard />
      )}
    </div>
  );
};

export default LazyNoteCard;
