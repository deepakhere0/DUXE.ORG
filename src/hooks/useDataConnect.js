import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import dataConnect from '../services/dataConnect';
import toast from 'react-hot-toast';

// Hook for fetching notes with Data Connect
export const useNotes = (filters = {}, options = {}) => {
  const queryKey = ['notes', filters];

  return useQuery({
    queryKey,
    queryFn: () => dataConnect.queries.getApprovedNotes(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Hook for fetching a single note
export const useNote = (noteId, options = {}) => {
  return useQuery({
    queryKey: ['note', noteId],
    queryFn: () => dataConnect.queries.getNoteById(noteId),
    enabled: !!noteId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook for fetching user's notes
export const useUserNotes = (userId, status = null, options = {}) => {
  return useQuery({
    queryKey: ['userNotes', userId, status],
    queryFn: () => dataConnect.queries.getUserNotes(userId, status),
    enabled: !!userId,
    ...options,
  });
};

// Hook for searching notes
export const useSearchNotes = (searchText, options = {}) => {
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  return useQuery({
    queryKey: ['searchNotes', debouncedSearch],
    queryFn: () => dataConnect.queries.searchNotes(debouncedSearch),
    enabled: debouncedSearch?.length > 2,
    ...options,
  });
};

// Hook for fetching universities
export const useUniversities = (options = {}) => {
  return useQuery({
    queryKey: ['universities'],
    queryFn: () => dataConnect.queries.getUniversities(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    ...options,
  });
};

// Hook for fetching departments
export const useDepartments = (universityId = null, options = {}) => {
  return useQuery({
    queryKey: ['departments', universityId],
    queryFn: () => dataConnect.queries.getDepartments(universityId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    ...options,
  });
};

// Hook for fetching internships
export const useInternships = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['internships', filters],
    queryFn: () => dataConnect.queries.getInternships(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook for fetching videos
export const useVideos = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: ['videos', filters],
    queryFn: () => dataConnect.queries.getVideos(filters),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook for fetching user profile
export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => dataConnect.queries.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    ...options,
  });
};

// Hook for fetching user's AI jobs
export const useUserAIJobs = (userId, status = null, options = {}) => {
  return useQuery({
    queryKey: ['aiJobs', userId, status],
    queryFn: () => dataConnect.queries.getUserAIJobs(userId, status),
    enabled: !!userId,
    ...options,
  });
};

// Mutation hooks

// Hook for creating a note
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteData) => {
      return dataConnect.mutations.createNote({
        ...noteData,
        uploadedBy: currentUser?.uid,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['notes']);
      queryClient.invalidateQueries(['userNotes']);
      toast.success('Note uploaded successfully! It will be reviewed soon.');
    },
    onError: (error) => {
      console.error('Error creating note:', error);
      toast.error('Failed to upload note. Please try again.');
    },
  });
};

// Hook for updating note status (admin/moderator)
export const useUpdateNoteStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, status, moderationNotes }) => {
      return dataConnect.mutations.updateNoteStatus(
        noteId,
        status,
        moderationNotes,
        currentUser?.uid
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['notes']);
      queryClient.invalidateQueries(['note', variables.noteId]);
      toast.success(`Note ${variables.status.toLowerCase()}`);
    },
    onError: (error) => {
      console.error('Error updating note status:', error);
      toast.error('Failed to update note status');
    },
  });
};

// Hook for incrementing downloads
export const useIncrementDownloads = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId) => dataConnect.mutations.incrementDownloads(noteId),
    onSuccess: (data, noteId) => {
      queryClient.invalidateQueries(['note', noteId]);
    },
  });
};

// Hook for incrementing views
export const useIncrementViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId) => dataConnect.mutations.incrementViews(noteId),
    onSuccess: (data, noteId) => {
      queryClient.invalidateQueries(['note', noteId]);
    },
  });
};

// Hook for adding a rating
export const useAddRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ noteId, rating, comment }) => {
      return dataConnect.mutations.addRating(noteId, rating, comment, currentUser?.uid);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['note', variables.noteId]);
      toast.success('Rating added successfully!');
    },
    onError: (error) => {
      console.error('Error adding rating:', error);
      toast.error('Failed to add rating');
    },
  });
};

// Hook for creating/updating user profile
export const useCreateOrUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => {
      if (userData.isUpdate) {
        const { userId, ...updates } = userData;
        return dataConnect.mutations.updateUser(userId, updates);
      }
      return dataConnect.mutations.createUser(userData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['userProfile', variables.id || variables.userId]);
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Failed to update profile');
    },
  });
};

// Hook for creating AI jobs
export const useCreateAIJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobData) => {
      return dataConnect.mutations.createAIJob({
        ...jobData,
        createdBy: currentUser?.uid,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['aiJobs']);
      toast.success('AI job created! Processing...');
    },
    onError: (error) => {
      console.error('Error creating AI job:', error);
      toast.error('Failed to create AI job');
    },
  });
};

// Hook for bookmarks
export const useBookmarks = () => {
  const queryClient = useQueryClient();

  const addBookmark = useMutation({
    mutationFn: ({ resourceId, resourceType }) => {
      return dataConnect.mutations.addBookmark(currentUser?.uid, resourceId, resourceType);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      toast.success('Bookmarked!');
    },
    onError: (error) => {
      console.error('Error adding bookmark:', error);
      toast.error('Failed to bookmark');
    },
  });

  const removeBookmark = useMutation({
    mutationFn: (bookmarkId) => {
      return dataConnect.mutations.removeBookmark(bookmarkId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      toast.success('Bookmark removed');
    },
    onError: (error) => {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    },
  });

  return { addBookmark, removeBookmark };
};

// Hook for paginated data
export const usePaginatedData = (queryFn, queryKey, options = {}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = options.limit || 12;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [...queryKey, page],
    queryFn: () =>
      queryFn({
        ...options.filters,
        limit: limit + 1,
        offset: (page - 1) * limit,
      }),
    ...options,
  });

  useEffect(() => {
    if (data) {
      setHasMore(data.length > limit);
    }
  }, [data, limit]);

  const items = data ? data.slice(0, limit) : [];

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading]);

  const reset = useCallback(() => {
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
    refetch,
    page,
  };
};

// Custom hook for real-time updates (using polling for now)
export const useRealTimeQuery = (queryFn, queryKey, options = {}) => {
  const pollInterval = options.pollInterval || 30000; // 30 seconds default

  return useQuery({
    queryKey,
    queryFn,
    refetchInterval: pollInterval,
    refetchIntervalInBackground: false,
    ...options,
  });
};

// Export all hooks
export default {
  useNotes,
  useNote,
  useUserNotes,
  useSearchNotes,
  useUniversities,
  useDepartments,
  useInternships,
  useVideos,
  useUserProfile,
  useUserAIJobs,
  useCreateNote,
  useUpdateNoteStatus,
  useIncrementDownloads,
  useIncrementViews,
  useAddRating,
  useCreateOrUpdateUser,
  useCreateAIJob,
  useBookmarks,
  usePaginatedData,
  useRealTimeQuery,
};
