import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserCircleIcon, EnvelopeIcon, AcademicCapIcon, PencilIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { currentUser, userProfile, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: userProfile?.displayName || '',
    university: userProfile?.university || '',
    department: userProfile?.department || '',
    semester: userProfile?.semester || '',
    bio: userProfile?.bio || ''
  });

  const handleSave = async () => {
    await updateUserProfile(formData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="card mb-8">
          <div className="card-body">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center">
                  <UserCircleIcon className="h-12 w-12 text-navy-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold">{userProfile?.displayName}</h2>
                  <p className="text-gray-600">{currentUser?.email}</p>
                  <span className="chip chip-primary text-xs mt-2">{userProfile?.role || 'Student'}</span>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary btn-sm"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="label">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="input"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">University</label>
                    <input
                      type="text"
                      value={formData.university}
                      onChange={(e) => setFormData({...formData, university: e.target.value})}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="input"
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Current Semester</label>
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: e.target.value})}
                    className="input"
                  >
                    <option value="">Select Semester</option>
                    {[1,2,3,4,5,6,7,8].map(sem => (
                      <option key={sem} value={sem}>{sem}st Semester</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="input h-24"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <button onClick={handleSave} className="btn btn-primary btn-md">
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">University</p>
                    <p className="font-medium">{userProfile?.university || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="font-medium">{userProfile?.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Semester</p>
                    <p className="font-medium">{userProfile?.semester ? `${userProfile.semester}st Semester` : 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium">{new Date(currentUser?.metadata?.creationTime).toLocaleDateString()}</p>
                  </div>
                </div>
                {userProfile?.bio && (
                  <div>
                    <p className="text-sm text-gray-500">Bio</p>
                    <p className="font-medium">{userProfile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive updates about your uploads and bookmarks</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-500"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Verified</p>
                  <p className="text-sm text-gray-500">{currentUser?.email}</p>
                </div>
                <span className={`chip ${currentUser?.emailVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'} text-xs`}>
                  {currentUser?.emailVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
