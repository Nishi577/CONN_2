import React, { useState } from 'react';
import { ConnProfile } from '../types';
import { X, Copy, Check, QrCode, Share2, ExternalLink, Download } from 'lucide-react';

interface ShareModalProps {
  profile: ConnProfile;
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ profile, isOpen, onClose, onShowToast }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr'>('link');

  if (!isOpen) return null;

  const profileUrl = profile.customDomain
    ? `https://${profile.customDomain}`
    : `${window.location.origin}/#${profile.username}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}&margin=8`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    onShowToast('Profile URL copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out my Conn profile: ${profile.name}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(profileUrl)}`, '_blank');
  };

  const handleDownloadQr = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${profile.username}-conn-qr.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onShowToast('Downloaded QR Code image!');
    } catch (e) {
      window.open(qrImageUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-7 relative font-sans-ui"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/50 rounded-full transition-colors"
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleShareTwitter}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-medium text-[#1C1B18] hover:bg-[#E8E4D9]/30 transition-all"
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
          <div className="flex flex-col items-center justify-center py-2 text-center">
            {/* Scannable Real QR Code Image */}
            <div className="p-3 bg-white rounded-2xl border border-[#E8E4D9] shadow-sm mb-3">
              <img
                src={qrImageUrl}
                alt={`QR Code for @${profile.username}`}
                className="w-44 h-44 rounded-lg object-contain"
                loading="lazy"
              />
            </div>
            <p className="text-xs text-[#6B665E] max-w-xs mb-3">
              Scan with any camera or QR scanner to instantly open @{profile.username}&apos;s Conn profile.
            </p>
            <button
              onClick={handleDownloadQr}
              className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs hover:scale-102"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download High-Res QR (.png)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
