import React, { useState, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getImageUrl } from '../utils/imageUtils';
import { 
  User, 
  Lock, 
  KeyRound, 
  Save, 
  Camera, 
  Trash2, 
  Upload, 
  Check, 
  Loader2
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'security'
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone_number: user?.phone_number || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || 'USA',
    postal_code: user?.postal_code || '',
  });

  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
  });

  // Profile Picture Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSavePhoto = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', selectedFile);

      const res = await axiosClient.patch('/api/accounts/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data);
      setSelectedFile(null);
      setPreviewUrl(null);
      showToast('Profile picture updated successfully!', 'success');
    } catch (err) {
      const msg = err.response?.data?.profile_image?.[0] || 'Failed to upload profile picture.';
      showToast(msg, 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancelPhoto = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setUploadingImage(true);
    try {
      // In DRF, clearing ImageField can be done by sending empty value or patch with null
      const formData = new FormData();
      formData.append('profile_image', '');

      const res = await axiosClient.patch('/api/accounts/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      updateUser(res.data);
      setSelectedFile(null);
      setPreviewUrl(null);
      showToast('Profile picture removed.', 'info');
    } catch (err) {
      showToast('Failed to remove profile picture.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const res = await updateProfile(profileData);
    setSavingProfile(false);
    if (res.success) {
      showToast('Profile information updated successfully!', 'success');
    } else {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangingPass(true);
    try {
      await axiosClient.post('/api/accounts/change-password/', passwordData);
      showToast('Password changed successfully!', 'success');
      setPasswordData({ old_password: '', new_password: '' });
    } catch (err) {
      const msg = err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Failed to change password.';
      showToast(msg, 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const currentAvatar = previewUrl || getImageUrl(user?.profile_image);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '1.5rem' }}>
        Account Settings
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('details')}
          className={`btn btn-sm ${activeTab === 'details' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <User size={16} /> Personal Details & Photo
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Lock size={16} /> Password & Security
        </button>
      </div>

      {activeTab === 'details' && (
        <div className="card" style={{ padding: '2rem' }}>
          {/* Profile Picture Header / Edit Section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            marginBottom: '2rem',
            paddingBottom: '1.75rem',
            borderBottom: '1px solid var(--border-subtle)',
            flexWrap: 'wrap'
          }}>
            {/* Avatar Circle with edit button */}
            <div style={{ position: 'relative', width: '84px', height: '84px' }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid var(--primary)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
                color: '#fff',
                fontSize: '2rem',
                fontWeight: 800,
              }}>
                {currentAvatar ? (
                  <img
                    src={currentAvatar}
                    alt={user?.username}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.username?.charAt(0).toUpperCase()
                )}
              </div>

              {/* Upload Trigger overlay icon */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Photo"
                style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  border: '2px solid #0f172a',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <Camera size={14} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* User Info & Photo Action Buttons */}
            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                </h2>
                <span className={`badge badge-${user?.role?.toLowerCase()}`}>
                  {user?.role}
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
                @{user?.username} • {user?.email}
              </p>

              {/* Photo Actions Row */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {selectedFile ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSavePhoto}
                      disabled={uploadingImage}
                      className="btn btn-primary btn-sm"
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 size={14} className="spinner-icon" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Save New Photo
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPhoto}
                      disabled={uploadingImage}
                      className="btn btn-secondary btn-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-outline btn-sm"
                    >
                      <Upload size={14} /> Upload Picture
                    </button>
                    {user?.profile_image && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploadingImage}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)' }}
                        title="Remove photo"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleProfileSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">First Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  placeholder="e.g. Jane"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Last Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="input-label">Phone Number</label>
              <input
                type="text"
                className="form-control"
                value={profileData.phone_number}
                onChange={(e) => setProfileData({ ...profileData, phone_number: e.target.value })}
                placeholder="+1 555-0199"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Street Address</label>
              <input
                type="text"
                className="form-control"
                value={profileData.address}
                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                placeholder="123 Market Street, Apt 4B"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="input-label">City</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.city}
                  onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  placeholder="San Francisco"
                />
              </div>

              <div className="form-group">
                <label className="input-label">Postal Code</label>
                <input
                  type="text"
                  className="form-control"
                  value={profileData.postal_code}
                  onChange={(e) => setProfileData({ ...profileData, postal_code: e.target.value })}
                  placeholder="94103"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
            Change Account Password
          </h2>

          <form onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label className="input-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                required
                placeholder="Enter current password"
              />
            </div>

            <div className="form-group">
              <label className="input-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                required
                minLength={6}
                placeholder="Enter new strong password"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
            >
              <KeyRound size={16} /> {changingPass ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
