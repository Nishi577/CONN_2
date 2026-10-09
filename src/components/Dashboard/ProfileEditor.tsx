import React, { useState } from 'react';
import { ConnProfile, SocialProfile } from '../../types';
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
} from 'lucide-react';

interface ProfileEditorProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      onShowToast('Name and Username handle are required.');
      return;
    }

    const updatedProfile: ConnProfile = {
      ...profile,
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ''),
      bio: bio.trim(),
      avatarUrl: avatarUrl.trim(),
      location: location.trim() || undefined,
      pronouns: pronouns.trim() || undefined,
      statusBadge: statusBadge.trim() || undefined,
      socials,
      newsletterEnabled,
      newsletterHeadline: newsletterHeadline.trim() || undefined,
      newsletterSubtext: newsletterSubtext.trim() || undefined,
    };

    onChangeProfile(updatedProfile);
    onShowToast('Profile information saved!');
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

      {/* Feature Output Explainer Card */}
      <div className="p-4 bg-white border border-[#E8E4D9] rounded-2xl flex items-start gap-3 shadow-2xs">
        <span className="p-2 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl text-[#C85A32] shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="space-y-1 text-xs">
          <span className="font-bold text-[#1C1B18] uppercase tracking-wider text-[10px] font-mono-code block">
            Public Profile Output
          </span>
          <p className="text-[#6B665E] leading-relaxed">
            These details appear at the very top of your public profile (<strong>conn.bio/{profile.username}</strong>) as your header hero section: displaying your photo, bio, status badge, and clickable social network badges.
          </p>
        </div>
      </div>

      {/* Avatar Section */}
      <div className="space-y-3">
        <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider">
          Profile Avatar
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <img
            src={avatarUrl}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#E8E4D9] shadow-sm"
          />

          <div className="flex-1 space-y-2">
            <input
              type="text"
              placeholder="Avatar image URL..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
            />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6B665E]">Or select preset:</span>
              <div className="flex items-center gap-1.5">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setAvatarUrl(preset)}
                    className={`w-6 h-6 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === preset ? 'border-[#1C1B18] ring-1 ring-[#1C1B18]' : 'border-[#E8E4D9]'
                    }`}
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
          <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
            Username Handle *
          </label>
          <div className="flex items-center bg-white border border-[#E8E4D9] rounded-xl px-3 focus-within:border-[#1C1B18]">
            <span className="text-xs text-[#6B665E] font-mono-code">conn.bio/</span>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-2.5 pl-1 text-sm bg-transparent font-mono-code"
            />
          </div>
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
            className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
          />

          <button
            type="button"
            onClick={handleAddSocial}
            className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-colors shrink-0"
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
