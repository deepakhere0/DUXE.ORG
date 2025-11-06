import React, { useState, useEffect } from 'react';
import { BriefcaseIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, BookmarkIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, orderBy, limit, addDoc, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Internships as InternshipsService } from '../services/firestoreData';
import { AIService } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import Toast from '../components/common/Toast';

const Internships = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [userSkills, setUserSkills] = useState(['React', 'JavaScript', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [sortedInternships, setSortedInternships] = useState([]);
  
  // Fetch internships from Firestore
  const { data: internships = [], isLoading, error } = useQuery({
    queryKey: ['internships'],
    queryFn: async () => {
      try {
        const q = query(
          collection(db, 'internships'),
          orderBy('postedAt', 'desc'),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const internshipsList = [];
        snapshot.forEach((doc) => {
          internshipsList.push({ id: doc.id, ...doc.data() });
        });
        return internshipsList;
      } catch (err) {
        console.error('Error fetching internships:', err);
        // Return mock data as fallback
        return [
          {
            id: '1',
            company: 'Tech Corp',
            role: 'Frontend Developer Intern',
            stipend: '$1500/month',
            location: 'Remote',
            duration: '3 months',
            skills: ['React', 'JavaScript', 'CSS'],
            applyUrl: 'https://example.com/apply',
            postedAt: new Date()
          },
          {
            id: '2',
            company: 'Data Systems Inc',
            role: 'Data Science Intern',
            stipend: '$2000/month',
            location: 'New York',
            duration: '6 months',
            skills: ['Python', 'Machine Learning', 'SQL'],
            applyUrl: 'https://example.com/apply',
            postedAt: new Date()
          },
          {
            id: '3',
            company: 'Web Solutions',
            role: 'Full Stack Developer Intern',
            stipend: '$1800/month',
            location: 'San Francisco',
            duration: '4 months',
            skills: ['React', 'Node.js', 'MongoDB'],
            applyUrl: 'https://example.com/apply',
            postedAt: new Date()
          }
        ];
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch user's bookmarked internships
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['internshipBookmarks', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      try {
        const q = query(
          collection(db, 'internshipBookmarks'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const bookmarksList = [];
        snapshot.forEach((doc) => {
          bookmarksList.push({ id: doc.id, ...doc.data() });
        });
        return bookmarksList;
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async ({ internshipId, isBookmarked }) => {
      if (!user) throw new Error('User not authenticated');

      if (isBookmarked) {
        // Remove bookmark
        const bookmark = bookmarks.find(b => b.internshipId === internshipId);
        if (bookmark) {
          await deleteDoc(doc(db, 'internshipBookmarks', bookmark.id));
        }
      } else {
        // Add bookmark
        await addDoc(collection(db, 'internshipBookmarks'), {
          userId: user.uid,
          internshipId: internshipId,
          createdAt: new Date()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['internshipBookmarks', user?.uid] });
    },
  });
  
  // Apply AI matching when internships or skills change
  useEffect(() => {
    if (internships.length > 0) {
      const matched = AIService.matchInternships({
        userSkills,
        internships
      });
      setSortedInternships(matched);
    }
  }, [internships, userSkills]);
  
  const addSkill = () => {
    if (newSkill.trim() && !userSkills.includes(newSkill.trim())) {
      setUserSkills([...userSkills, newSkill.trim()]);
      setNewSkill('');
      setShowSkillInput(false);
      Toast.success('Skill added');
    }
  };
  
  const removeSkill = (skillToRemove) => {
    setUserSkills(userSkills.filter(skill => skill !== skillToRemove));
  };
  
  const handleApply = (internship) => {
    if (internship.applyUrl) {
      window.open(internship.applyUrl, '_blank');
    } else {
      Toast.info('Application link not available');
    }
  };
  
  const handleBookmark = async (internshipId) => {
    if (!user) {
      Toast.error('Please login to bookmark internships');
      return;
    }

    const isBookmarked = bookmarks.some(b => b.internshipId === internshipId);

    try {
      await bookmarkMutation.mutateAsync({ internshipId, isBookmarked });
      Toast.success(isBookmarked ? 'Bookmark removed' : 'Internship bookmarked');
    } catch (error) {
      console.error('Error bookmarking internship:', error);
      Toast.error('Failed to bookmark internship');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-bold mb-8">Internship Opportunities</h1>

        {/* Skills Input */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
          <h3 className="font-semibold mb-4">Your Skills</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {userSkills.map((skill, index) => (
              <span key={index} className="chip chip-primary group">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-white/70 hover:text-white transition-colors"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            ))}
            {showSkillInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  placeholder="Enter skill"
                  className="input input-sm"
                  autoFocus
                />
                <button onClick={addSkill} className="btn btn-primary btn-sm">
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowSkillInput(false);
                    setNewSkill('');
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSkillInput(true)}
                className="chip bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Skill
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {AIService.isConfigured() 
              ? 'AI-powered matching based on your skills' 
              : 'Add your skills to see matching internships'}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading internships...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading internships. Showing sample data.</p>
          </div>
        )}

        {/* Internship Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedInternships.map((internship) => {
              const matchScore = internship.matchScore || 0;
              const isGoodMatch = matchScore >= 60;
              const isGreatMatch = matchScore >= 80;
              
              return (
                <div key={internship.id} className="card hover:shadow-card-hover transition-shadow">
                  <div className="card-body">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{internship.role}</h3>
                        <p className="text-gray-600">{internship.company}</p>
                      </div>
                      {matchScore > 0 && (
                        <div className="text-right">
                          <span className={`chip text-xs ${
                            isGreatMatch ? 'bg-green-100 text-green-700' :
                            isGoodMatch ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {matchScore}% Match
                          </span>
                          {internship.aiEnhanced && (
                            <p className="text-xs text-accent-600 mt-1">AI Enhanced</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        {internship.stipend || 'Negotiable'}
                      </div>
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {internship.location || 'Not specified'}
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        {internship.duration || 'Flexible'}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {(internship.skills || []).map((skill, index) => {
                          const hasSkill = userSkills.some(s => 
                            s.toLowerCase() === skill.toLowerCase()
                          );
                          return (
                            <span 
                              key={index} 
                              className={`text-xs px-2 py-1 rounded ${
                                hasSkill 
                                  ? 'bg-green-100 text-green-700 font-medium' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {skill}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {internship.matchReason && (
                      <p className="text-xs text-gray-600 mb-3 italic">
                        {internship.matchReason}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApply(internship)}
                        className="btn btn-primary btn-sm flex-1"
                      >
                        Apply Now
                      </button>
                      <button
                        onClick={() => handleBookmark(internship.id)}
                        className={`btn btn-sm ${
                          bookmarks.some(b => b.internshipId === internship.id)
                            ? 'btn-primary'
                            : 'btn-secondary'
                        }`}
                        disabled={bookmarkMutation.isPending}
                      >
                        {bookmarks.some(b => b.internshipId === internship.id) ? (
                          <BookmarkSolidIcon className="h-4 w-4" />
                        ) : (
                          <BookmarkIcon className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sortedInternships.length === 0 && (
          <div className="text-center py-12">
            <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600">Check back later for new opportunities</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Internships;
