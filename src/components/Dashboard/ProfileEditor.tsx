import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ConnProfile, SocialProfile } from '../../types';
import { checkUsernameAvailability } from '../../lib/supabase';
import {
  User,
  MapPin,
  Sparkles,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Mail,
  Twitter,
  Github,
  Instagram,
  Linkedin,
  Globe,
  Radio,
  Upload,
  Camera,
  AlertCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
  Share2,
  Eye,
  Lock,
} from 'lucide-react';

interface ProfileEditorProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const ProfileEditor: React.FC<ProfileEditorProps> = ({ profile, onChangeProfile, onShowToast }) => {
  const [name, setName] = useState(profile.name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl);
  const [location, setLocation] = useState(profile.location || '');
  const [pronouns, setPronouns] = useState(profile.pronouns || '');
  const [statusBadge, setStatusBadge] = useState(profile.statusBadge || '');
  const [newsletterEnabled, setNewsletterEnabled] = useState(profile.newsletterEnabled || false);
  const [newsletterHeadline, setNewsletterHeadline] = useState(profile.newsletterHeadline || '');
  const [newsletterSubtext, setNewsletterSubtext] = useState(profile.newsletterSubtext || '');
  const [isPublic, setIsPublic] = useState(profile.isPublic ?? true);

  // Custom URL & Username Availability State
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<{
    isChecking: boolean;
    isAvailable: boolean | null;
    reason?: string;
  }>({
    isChecking: false,
    isAvailable: true,
  });

  // Upload UI state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Sync state if active profile changes externally
  useEffect(() => {
    setName(profile.name);
    setUsername(profile.username);
    setBio(profile.bio);
    setAvatarUrl(profile.avatarUrl);
    setLocation(profile.location || '');
    setPronouns(profile.pronouns || '');
    setStatusBadge(profile.statusBadge || '');
    setSocials(profile.socials || []);
    setNewsletterEnabled(profile.newsletterEnabled || false);
    setNewsletterHeadline(profile.newsletterHeadline || '');
    setNewsletterSubtext(profile.newsletterSubtext || '');
    setIsPublic(profile.isPublic ?? true);
    setAvatarError(null);
  }, [profile.id, profile.isPublic]);

  // Check username availability with 350ms debounce
  useEffect(() => {
    const clean = username.trim().toLowerCase();

    // If unchanged from current profile's username, it's valid and belongs to user
    if (clean === profile.username.toLowerCase()) {
      setUsernameStatus({ isChecking: false, isAvailable: true });
      return;
    }

    if (!clean || clean.length < 3) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        reason: 'Username must be at least 3 characters.',
      });
      return;
    }

    if (!/^[a-z0-9_-]+$/.test(clean)) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        reason: 'Only lowercase letters, numbers, hyphens, and underscores are allowed.',
      });
      return;
    }

    setUsernameStatus({ isChecking: true, isAvailable: null });

    const timer = setTimeout(async () => {
      try {
        const res = await checkUsernameAvailability(clean, profile.id);
        setUsernameStatus({
          isChecking: false,
          isAvailable: res.available,
          reason: res.reason,
        });
      } catch {
        setUsernameStatus({ isChecking: false, isAvailable: true });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, profile.username, profile.id]);

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${username.trim() || profile.username}`
    : `https://conn.bio/${username.trim() || profile.username}`;

  const handleCopyUrl = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = publicUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopiedUrl(true);
      onShowToast(`Public profile URL copied: ${publicUrl}`);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      onShowToast('Failed to copy URL to clipboard', 'error');
    }
  };

  const handleTogglePublish = (publishState: boolean) => {
    setIsPublic(publishState);
    const updated = {
      ...profile,
      isPublic: publishState,
    };
    onChangeProfile(updated);
    onShowToast(
      publishState
        ? `Profile published! It is now live at ${publicUrl}`
        : 'Profile unpublished. It is now private and hidden from public visitors.'
    );
  };

  // Social profiles state
  const [socials, setSocials] = useState<SocialProfile[]>(profile.socials || []);
  const [newPlatform, setNewPlatform] = useState<SocialProfile['platform']>('twitter');
  const [newSocialUrl, setNewSocialUrl] = useState('');

  const handleAddSocial = () => {
    if (!newSocialUrl.trim()) return;
    let url = newSocialUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:')) {
      url = `https://${url}`;
    }

    const updated = [...socials, { platform: newPlatform, url, label: newPlatform }];
    setSocials(updated);
    setNewSocialUrl('');
  };

  const handleRemoveSocial = (index: number) => {
    const updated = socials.filter((_, i) => i !== index);
    setSocials(updated);
  };

  const processFile = (file: File) => {
    setAvatarError(null);

    // Validate mime type or extension
    const isMimeValid = ALLOWED_TYPES.includes(file.type.toLowerCase());
    const isExtensionValid = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isMimeValid && !isExtensionValid) {
      setAvatarError('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }

    // Validate size limit
    if (file.size > MAX_FILE_SIZE) {
      setAvatarError('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    // Read as Data URL & optimize for local storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        setAvatarError('Unable to read selected image file.');
        return;
      }

      // Optimize image dimensions for smooth local persistence
      const img = new Image();
      img.onload = () => {
        try {
          const MAX_DIM = 800;
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
              const optimizedData = canvas.toDataURL(outputMime, 0.92);
              setAvatarUrl(optimizedData);
              return;
            }
          }
          setAvatarUrl(rawDataUrl);
        } catch {
          setAvatarUrl(rawDataUrl);
        }
      };

      img.onerror = () => {
        setAvatarUrl(rawDataUrl);
      };

      img.src = rawDataUrl;
    };

    reader.onerror = () => {
      setAvatarError('Failed to read image file. Please try again.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input value to allow selecting same file again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      onShowToast('Name and Username handle are required.');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');

    if (cleanUsername !== profile.username && usernameStatus.isAvailable === false) {
      onShowToast(usernameStatus.reason || 'Username is already taken or unavailable.', 'error');
      return;
    }

    const updatedProfile: ConnProfile = {
      ...profile,
      name: name.trim(),
      username: cleanUsername,
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      location: location.trim() || undefined,
      pronouns: pronouns.trim() || undefined,
      statusBadge: statusBadge.trim() || undefined,
      socials,
      isPublic,
      newsletterEnabled,
      newsletterHeadline: newsletterHeadline.trim() || undefined,
      newsletterSubtext: newsletterSubtext.trim() || undefined,
    };

    onChangeProfile(updatedProfile);
    onShowToast('Profile information saved and synchronized!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 font-sans-ui text-[#1C1B18]">
      {/* Header & Explainer */}
      <div className="pb-4 border-b border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1C1B18] text-[#FAF8F5] rounded-lg">
              <User className="w-4 h-4 text-[#D49A3E]" />
            </span>
            <h2 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Profile Identity & Header</h2>
          </div>
          <p className="text-xs text-[#6B665E] mt-1">
            Configure your avatar, bio summary, handle, location, and social media handles.
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-[#D49A3E]" />
          <span>Save Profile</span>
        </button>
      </div>

      {/* PUBLISH PROFILE & LIVE STATUS CARD */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isPublic
            ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
            : 'bg-amber-50/40 border-amber-200/80 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-bold uppercase tracking-wider ${
                  isPublic
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isPublic ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isPublic ? 'Public Profile Live' : 'Unpublished (Draft / Private)'}
              </span>
            </div>

            <p className="text-xs text-[#6B665E]">
              {isPublic
                ? 'Your Conn profile is live on the internet. Anyone with your link can view it without logging in.'
                : 'Your profile is currently private. Visitors navigating to your URL will see an unpublished notice.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs font-mono-code text-[#1C1B18] font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-[#E8E4D9]">
                {publicUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyUrl}
                className="p-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg text-[#1C1B18] transition-colors cursor-pointer flex items-center gap-1 text-xs"
                title="Copy full public URL"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy Link</span>
                  </>
                )}
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-white hover:bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg text-[#1C1B18] transition-colors flex items-center gap-1 text-xs"
                title="Open public profile in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-[11px]">Open Link</span>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isPublic ? (
              <button
                type="button"
                onClick={() => handleTogglePublish(false)}
                className="px-4 py-2 border border-amber-300 bg-white hover:bg-amber-50 text-amber-900 text-xs font-medium rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Unpublish Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleTogglePublish(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-medium rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish Profile Live</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider">
          Profile Avatar
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-white border border-[#E8E4D9] rounded-2xl shadow-2xs">
          {/* Avatar Preview Circle with Change overlay */}
          <div className="relative group shrink-0">
            <img
              src={avatarUrl}
              alt={name}
              className="w-20 h-20 rounded-full object-cover border-2 border-[#E8E4D9] shadow-xs bg-[#FAF8F5]"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer"
              title="Upload new profile photo"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium uppercase tracking-wider">Change</span>
            </button>
          </div>

          <div className="flex-1 w-full space-y-3">
            {/* Upload Button & Dropzone Control */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#1C1B18] bg-[#FAF8F5] ring-2 ring-[#1C1B18]/10'
                  : 'border-[#D5D0C5] hover:border-[#1C1B18] bg-[#FAF8F5]/70 hover:bg-[#FAF8F5]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileInputChange}
                className="hidden"
                aria-label="Upload profile photo"
              />

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E8E4D9] flex items-center justify-center text-[#1C1B18] shrink-0 shadow-2xs">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-medium text-[#1C1B18] flex items-center gap-1.5">
                    <span>{AVATAR_PRESETS.includes(avatarUrl) ? 'Upload Photo' : 'Change Photo'}</span>
                    <span className="text-[10px] text-[#6B665E] font-normal hidden sm:inline">
                      or drag & drop
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B665E]">JPG, PNG, or WEBP (max 5MB)</p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-3.5 py-1.5 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#33312B] transition-colors shrink-0 shadow-2xs cursor-pointer"
              >
                {AVATAR_PRESETS.includes(avatarUrl) ? 'Upload Photo' : 'Upload New'}
              </button>
            </div>

            {/* Inline Error Display */}
            {avatarError && (
              <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{avatarError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarError(null)}
                  className="text-red-500 hover:text-red-800 text-xs font-bold px-1"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Presets Selection */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <span className="text-[11px] text-[#6B665E]">Or select preset:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => {
                      setAvatarUrl(preset);
                      setAvatarError(null);
                    }}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 cursor-pointer ${
                      avatarUrl === preset ? 'border-[#1C1B18] ring-2 ring-[#1C1B18]/20 scale-105' : 'border-[#E8E4D9]'
                    }`}
                    title={`Preset avatar ${idx + 1}`}
                  >
                    <img src={preset} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider">
              Profile URL & Username *
            </label>
            {usernameStatus.isChecking ? (
              <span className="text-[10px] text-[#6B665E] flex items-center gap-1 font-mono-code">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Checking...
              </span>
            ) : usernameStatus.isAvailable ? (
              <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono-code font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Available
              </span>
            ) : (
              <span className="text-[10px] text-rose-700 flex items-center gap-1 font-mono-code font-bold">
                <AlertCircle className="w-3 h-3 text-rose-600" /> Unavailable
              </span>
            )}
          </div>
          <div className="flex items-center bg-white border border-[#E8E4D9] rounded-xl px-3 focus-within:border-[#1C1B18] transition-colors">
            <span className="text-xs text-[#6B665E] font-mono-code shrink-0">conn.bio/</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
              placeholder="username-slug"
              className="w-full py-2.5 pl-1 text-sm bg-transparent font-mono-code focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleCopyUrl}
              className="p-1 text-[#6B665E] hover:text-[#1C1B18] transition-colors"
              title="Copy complete URL"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          {usernameStatus.reason && !usernameStatus.isAvailable && (
            <p className="text-[11px] text-rose-600 mt-1 font-mono-code flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>{usernameStatus.reason}</span>
            </p>
          )}
          <p className="text-[10px] text-[#6B665E] mt-1 font-mono-code">
            Direct public link: {publicUrl}
          </p>
        </div>
      </div>

      {/* Bio */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider">
            Short Editorial Bio
          </label>
          <span className="text-[11px] font-mono-code text-[#6B665E]">
            {bio.length} / 220 chars
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={220}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A brief intro about your craft, thoughts, or location..."
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
        />
      </div>

      {/* Secondary Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Brooklyn, NY"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
            Pronouns
          </label>
          <input
            type="text"
            placeholder="e.g. she/her"
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
            Status Pill / Now
          </label>
          <input
            type="text"
            placeholder="e.g. ● Writing On Quietude"
            value={statusBadge}
            onChange={(e) => setStatusBadge(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
          />
        </div>
      </div>

      {/* Social Profiles Manager */}
      <div className="space-y-3 pt-4 border-t border-[#E8E4D9]">
        <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider">
          Social Links Grid
        </label>

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {socials.map((soc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E4D9] rounded-lg text-xs font-medium text-[#1C1B18]"
              >
                <span className="capitalize">{soc.platform}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSocial(idx)}
                  className="text-[#6B665E] hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <select
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value as SocialProfile['platform'])}
            className="px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl font-medium"
          >
            <option value="twitter">X / Twitter</option>
            <option value="github">GitHub</option>
            <option value="substack">Substack</option>
            <option value="spotify">Spotify</option>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="email">Email</option>
            <option value="website">Website</option>
          </select>

          <input
            type="text"
            placeholder="URL or handle..."
            value={newSocialUrl}
            onChange={(e) => setNewSocialUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSocial();
              }
            }}
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
          />

          <button
            type="button"
            onClick={handleAddSocial}
            className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-colors shrink-0 cursor-pointer"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Newsletter Block Toggle */}
      <div className="p-5 border border-[#E8E4D9] bg-white rounded-2xl space-y-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Newsletter Capture Widget
            </span>
            <p className="text-[11px] text-[#6B665E]">
              Allow readers to subscribe to your field notes directly on your profile.
            </p>
          </div>
          <input
            type="checkbox"
            checked={newsletterEnabled}
            onChange={(e) => setNewsletterEnabled(e.target.checked)}
            className="w-4 h-4 rounded text-[#1C1B18]"
          />
        </label>

        {newsletterEnabled && (
          <div className="space-y-3 pt-3 border-t border-[#E8E4D9]">
            <div>
              <label className="block text-[11px] text-[#6B665E] uppercase mb-1">Headline</label>
              <input
                type="text"
                placeholder="Receive my field notes directly."
                value={newsletterHeadline}
                onChange={(e) => setNewsletterHeadline(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#6B665E] uppercase mb-1">Subtext</label>
              <input
                type="text"
                placeholder="A periodic letter on visual culture and code."
                value={newsletterSubtext}
                onChange={(e) => setNewsletterSubtext(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-[#E8E4D9] flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs"
        >
          Save Profile Details
        </button>
      </div>
    </form>
  );
};
