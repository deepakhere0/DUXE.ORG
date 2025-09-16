import { useEffect, useRef, useState } from 'react';

/**
 * Hook to observe when an element enters the viewport
 * @param {Object} options - Intersection Observer options
 * @returns {[React.Ref, boolean]} - Ref to attach to element and visibility state
 */
export function useIntersectionObserver(options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        // Once visible, stop observing to prevent re-renders
        observer.unobserve(element);
      }
    }, observerOptions);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options.threshold, options.rootMargin, options.root]);

  return [elementRef, isVisible];
}

export default useIntersectionObserver;
