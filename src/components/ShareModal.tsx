import React, { useState, useEffect } from 'react';
import { ConnProfile } from '../types';
import { X, Copy, Check, QrCode, Share2, ExternalLink, Send } from 'lucide-react';

interface ShareModalProps {
  profile: ConnProfile;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ profile, isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const profileUrl = `${window.location.origin}/#${profile.username}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(profileUrl);
      } else {
        const el = document.createElement('textarea');
        el.value = profileUrl;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      onShowToast('Profile URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('Failed to copy to clipboard', 'error');
    }
  };

  const handleNativeShare = async () => {
    if (canNativeShare) {
      try {
        await navigator.share({
          title: `${profile.name} on Conn`,
          text: `Check out ${profile.name}'s editorial profile:`,
          url: profileUrl,
        });
        onShowToast('Shared successfully!');
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          handleCopy();
        }
      }
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out my Conn profile: ${profile.name}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-md bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-7 relative font-sans-ui"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/50 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#1C1B18] text-[#FAF8F5] flex items-center justify-center font-serif-display text-xl">
            C
          </div>
          <div>
            <h3 className="font-serif-display text-2xl font-normal tracking-tight text-[#1C1B18]">Share Profile</h3>
            <p className="text-xs text-[#6B665E]">conn.bio/{profile.username}</p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#E8E4D9]/50 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === 'link' ? 'bg-[#FAF8F5] text-[#1C1B18] shadow-xs' : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Link
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === 'qr' ? 'bg-[#FAF8F5] text-[#1C1B18] shadow-xs' : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            QR Code
          </button>
        </div>

        {activeTab === 'link' ? (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-2">
                Public Link
              </label>
              <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl p-1.5 focus-within:border-[#1C1B18] transition-colors">
                <input
                  type="text"
                  readOnly
                  value={profileUrl}
                  className="w-full bg-transparent px-3 py-2 text-sm text-[#1C1B18] font-mono-code selection:bg-[#E8E4D9]"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
                    copied
                      ? 'bg-emerald-700 text-white'
                      : 'bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B]'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-3">
                Quick Share
              </label>
              {canNativeShare && (
                <button
                  onClick={handleNativeShare}
                  className="w-full mb-2.5 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-medium transition-all shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share via Device Sheet...
                </button>
              )}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-medium text-[#1C1B18] hover:bg-[#E8E4D9]/30 transition-all cursor-pointer"
                >
                  <span className="font-bold">X</span> Share on Twitter
                </button>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-medium text-[#1C1B18] hover:bg-[#E8E4D9]/30 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            {/* SVG QR Code */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8E4D9] shadow-sm mb-4">
              <svg className="w-48 h-48" viewBox="0 0 100 100" fill="currentColor">
                <path d="M0,0 h35 v35 h-35 z M5,5 v25 h25 v-25 z M10,10 h15 v15 h-15 z" />
                <path d="M65,0 h35 v35 h-35 z M70,5 v25 h25 v-25 z M75,10 h15 v15 h-15 z" />
                <path d="M0,65 h35 v35 h-35 z M5,70 v25 h25 v-25 z M10,75 h15 v15 h-15 z" />
                <rect x="45" y="10" width="10" height="10" />
                <rect x="45" y="25" width="10" height="20" />
                <rect x="10" y="45" width="20" height="10" />
                <rect x="35" y="45" width="10" height="10" />
                <rect x="55" y="45" width="20" height="10" />
                <rect x="80" y="45" width="10" height="10" />
                <rect x="45" y="65" width="10" height="15" />
                <rect x="65" y="65" width="15" height="10" />
                <rect x="85" y="65" width="10" height="25" />
                <rect x="65" y="85" width="15" height="10" />
                <rect x="45" y="85" width="15" height="10" />
              </svg>
            </div>
            <p className="text-xs text-[#6B665E] max-w-xs">
              Scan this code with any phone camera to instantly open @{profile.username}&apos;s Conn profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
