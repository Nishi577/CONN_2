import React, { useState } from 'react';
import { ConnProfile } from '../../types';
import { SAMPLE_PROFILES } from '../../data/mockData';
import { createBlankProfileForUser, loadCurrentUser } from '../../lib/storage';
import {
  Download,
  Upload,
  RotateCcw,
  Key,
  Globe,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
  onLogout,
}) => {
  const [isPublic, setIsPublic] = useState(profile.isPublic);
  const [passwordProtected, setPasswordProtected] = useState(profile.isPasswordProtected || false);
  const [passwordCode, setPasswordCode] = useState(profile.passwordCode || '');
  const [showPasscode, setShowPasscode] = useState(false);

  // SEO & Social Meta State
  const [seoTitle, setSeoTitle] = useState(profile.seoTitle || `${profile.name} (@${profile.username}) — Conn`);
  const [seoDescription, setSeoDescription] = useState(profile.seoDescription || profile.bio);
  const [seoImageUrl, setSeoImageUrl] = useState(profile.seoImageUrl || profile.avatarUrl);

  // Synchronize state when active profile updates
  React.useEffect(() => {
    setIsPublic(profile.isPublic);
    setPasswordProtected(profile.isPasswordProtected || false);
    setPasswordCode(profile.passwordCode || '');
    setSeoTitle(profile.seoTitle || `${profile.name} (@${profile.username}) — Conn`);
    setSeoDescription(profile.seoDescription || profile.bio);
    setSeoImageUrl(profile.seoImageUrl || profile.avatarUrl);
  }, [profile.id, profile.username, profile.isPublic, profile.isPasswordProtected]);

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordCode.trim()) {
      onShowToast('Please enter a valid passcode');
      return;
    }
    onChangeProfile({
      ...profile,
      isPasswordProtected: true,
      passwordCode: passwordCode.trim(),
    });
    onShowToast('Passcode saved and protection active');
  };

  const handleSaveSeo = (e: React.FormEvent) => {
    e.preventDefault();
    onChangeProfile({
      ...profile,
      seoTitle: seoTitle.trim(),
      seoDescription: seoDescription.trim(),
      seoImageUrl: seoImageUrl.trim(),
    });
    onShowToast('Updated SEO & Social Meta configuration');
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profile, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `conn-profile-${profile.username}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Exported profile backup JSON');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        const isValidProfile =
          imported &&
          typeof imported === 'object' &&
          typeof imported.username === 'string' &&
          typeof imported.name === 'string' &&
          Array.isArray(imported.links) &&
          Array.isArray(imported.socials);

        if (isValidProfile) {
          onChangeProfile(imported);
          setIsPublic(imported.isPublic ?? true);
          setPasswordProtected(imported.isPasswordProtected ?? false);
          setPasswordCode(imported.passwordCode ?? '');
          onShowToast(`Successfully imported profile @${imported.username}`);
        } else {
          onShowToast('Invalid profile JSON: missing required schema fields');
        }
      } catch (err) {
        onShowToast('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaults = () => {
    const currentUser = loadCurrentUser();
    if (confirm('Clear profile content and reset workspace? This cannot be undone.')) {
      if (currentUser && currentUser === profile.username) {
        const blank = createBlankProfileForUser({
          id: profile.id,
          email: profile.contactEmail || '',
          name: profile.name,
          username: profile.username,
          createdAt: new Date().toISOString().split('T')[0],
        });
        onChangeProfile(blank);
        setIsPublic(true);
        setPasswordProtected(false);
        setPasswordCode('');
        onShowToast('Profile cleared. Start fresh with a blank workspace!');
      } else {
        const resetProfile = SAMPLE_PROFILES[0];
        onChangeProfile(resetProfile);
        setIsPublic(resetProfile.isPublic);
        setPasswordProtected(resetProfile.isPasswordProtected || false);
        setPasswordCode(resetProfile.passwordCode || '');
        onShowToast('Reset to default sample profile');
      }
    }
  };

  return (
    <div className="space-y-8 font-sans-ui text-[#1C1B18]">
      <div className="pb-4 border-b border-[#E8E4D9]">
        <h2 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Workspace & Account Settings</h2>
        <p className="text-xs text-[#6B665E]">Manage profile visibility, security, SEO metadata, and data portability.</p>
      </div>

      {/* ACCOUNT & IDENTITY OVERVIEW */}
      <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
          Connected Account Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl">
            <span className="text-2xs font-mono-code uppercase text-[#6B665E] block">Creator Name</span>
            <span className="text-xs font-medium text-[#1C1B18] font-mono-code truncate block">{profile.name}</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl">
            <span className="text-2xs font-mono-code uppercase text-[#6B665E] block">Profile Handle</span>
            <span className="text-xs font-medium text-[#1C1B18] font-mono-code truncate block">@{profile.username}</span>
          </div>
          <div className="p-3 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl">
            <span className="text-2xs font-mono-code uppercase text-[#6B665E] block">Public URL</span>
            <span className="text-xs font-medium text-[#C85A32] font-mono-code truncate block">conn.bio/{profile.username}</span>
          </div>
        </div>
      </div>

      {/* VISIBILITY & PRIVACY */}
      <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
          Visibility & Indexing
        </h3>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-[#1C1B18]">Public Profile Visibility</span>
              <p className="text-xs text-[#6B665E]">
                When disabled, your Conn profile will show a private maintenance screen to visitors.
              </p>
            </div>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => {
                setIsPublic(e.target.checked);
                onChangeProfile({ ...profile, isPublic: e.target.checked });
                onShowToast(e.target.checked ? 'Profile published publicly' : 'Profile hidden from public');
              }}
              className="w-4 h-4 rounded text-[#1C1B18]"
            />
          </label>

          <div className="pt-3 border-t border-[#E8E4D9] space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-[#1C1B18]">Password Protection Mode</span>
                <p className="text-xs text-[#6B665E]">
                  Require a passcode before visitors can unlock and view your profile.
                </p>
              </div>
              <input
                type="checkbox"
                checked={passwordProtected}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setPasswordProtected(checked);
                  onChangeProfile({
                    ...profile,
                    isPasswordProtected: checked,
                    passwordCode: checked ? passwordCode || '1234' : profile.passwordCode,
                  });
                  if (checked && !passwordCode) {
                    setPasswordCode('1234');
                  }
                  onShowToast(checked ? 'Enabled passcode protection' : 'Disabled passcode protection');
                }}
                className="w-4 h-4 rounded text-[#1C1B18]"
              />
            </label>

            {passwordProtected && (
              <form onSubmit={handleSavePasscode} className="p-3.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <div className="relative flex-1">
                  <Key className="w-3.5 h-3.5 text-[#6B665E] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    value={passwordCode}
                    onChange={(e) => setPasswordCode(e.target.value)}
                    placeholder="Enter visitor unlock passcode..."
                    className="w-full pl-8 pr-9 py-2 bg-white border border-[#E8E4D9] rounded-lg text-xs focus:outline-none focus:border-[#1C1B18]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6B665E] hover:text-[#1C1B18]"
                  >
                    {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-lg hover:bg-[#33312B] transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Check className="w-3.5 h-3.5" /> Save Passcode
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* SEO & SOCIAL META PREVIEW */}
      <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> SEO & OpenGraph Social Card
            </h3>
            <p className="text-xs text-[#6B665E] mt-0.5">
              Customize how your link looks when shared on X/Twitter, LinkedIn, Slack, or iMessage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleSaveSeo} className="space-y-3">
            <div>
              <label className="text-xs font-mono-code uppercase block mb-1 text-[#6B665E]">Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                maxLength={70}
                placeholder="Profile Meta Title"
                className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="text-xs font-mono-code uppercase block mb-1 text-[#6B665E]">Meta Description</label>
              <textarea
                rows={3}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                maxLength={160}
                placeholder="Brief summary shown on search engines and social embeds..."
                className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="text-xs font-mono-code uppercase block mb-1 text-[#6B665E]">Social Preview Image URL</label>
              <input
                type="url"
                value={seoImageUrl}
                onChange={(e) => setSeoImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#1C1B18]"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Save SEO Metadata
            </button>
          </form>

          {/* LIVE OPENGRAPH CARD PREVIEW */}
          <div className="space-y-2">
            <span className="text-2xs font-mono-code uppercase text-[#6B665E] block">
              Live Social Embed Preview
            </span>
            <div className="border border-[#E8E4D9] rounded-2xl overflow-hidden bg-[#FAF8F5] shadow-xs">
              <div className="h-36 w-full bg-[#E8E4D9] overflow-hidden relative">
                {seoImageUrl ? (
                  <img
                    src={seoImageUrl}
                    alt="Social preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-[#6B665E]">
                    No Preview Image
                  </div>
                )}
              </div>
              <div className="p-3.5 space-y-1">
                <div className="text-2xs font-mono-code uppercase text-[#6B665E]">
                  {profile.customDomain || `conn.bio/${profile.username}`}
                </div>
                <div className="text-sm font-bold text-[#1C1B18] truncate">
                  {seoTitle || `${profile.name} (@${profile.username})`}
                </div>
                <p className="text-xs text-[#6B665E] line-clamp-2 leading-relaxed">
                  {seoDescription || profile.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DATA PORTABILITY (EXPORT & IMPORT) */}
      <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
          Data Portability & Backup
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl text-[#1C1B18] transition-all"
          >
            <Download className="w-4 h-4" /> Export Backup JSON
          </button>

          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl text-[#1C1B18] transition-all cursor-pointer">
            <Upload className="w-4 h-4" /> Import JSON Profile
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>

          <button
            onClick={handleResetDefaults}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl text-[#6B665E] hover:text-[#1C1B18] transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Reset Sample Data
          </button>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="p-6 border border-red-200 bg-red-50/40 rounded-2xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-700">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-[#1C1B18]">Sign Out of Session</span>
            <p className="text-xs text-[#6B665E]">Ends your active creator session on this device.</p>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-xl transition-colors shrink-0"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};