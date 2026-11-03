import React, { useState } from 'react';
import { ConnProfile } from '../../types';
import { generateBioEnhancements, generateStatusBadges } from '../../lib/geminiAssistant';
import { Sparkles, X, Check, RefreshCw, Wand2, Type, MessageSquare, ArrowRight } from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ConnProfile;
  onApplyBio: (newBio: string) => void;
  onApplyStatus: (newStatus: string) => void;
  onShowToast: (msg: string) => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  profile,
  onApplyBio,
  onApplyStatus,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'status'>('bio');
  const [loading, setLoading] = useState(false);
  const [bioSuggestions, setBioSuggestions] = useState<string[]>([]);
  const [statusSuggestions, setStatusSuggestions] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleGenerateBios = async () => {
    setLoading(true);
    try {
      const results = await generateBioEnhancements(
        profile.name,
        profile.role,
        profile.bio,
        profile.skills
      );
      setBioSuggestions(results);
    } catch (e) {
      onShowToast('Could not generate bios right now.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBadges = async () => {
    setLoading(true);
    try {
      const results = await generateStatusBadges(profile.role, profile.skills);
      setStatusSuggestions(results);
    } catch (e) {
      onShowToast('Could not generate status badges right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs font-sans-ui animate-in fade-in">
      <div
        className="w-full max-w-lg bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-7 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#E8E4D9]/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#1C1B18] text-[#FAF8F5] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[#D49A3E]" />
          </div>
          <div>
            <h3 className="font-serif-display text-2xl font-normal text-[#1C1B18]">
              Editorial AI Assistant
            </h3>
            <p className="text-xs text-[#6B665E]">
              Powered by Gemini — Refine your bio & generate restrained status badges
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-[#E8E4D9]/50 p-1 rounded-xl mb-6">
          <button
            onClick={() => {
              setActiveTab('bio');
              if (bioSuggestions.length === 0) handleGenerateBios();
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bio'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Type className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Bio Variations</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('status');
              if (statusSuggestions.length === 0) handleGenerateBadges();
            }}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === 'status'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D49A3E]" />
            <span>Status Badges</span>
          </button>
        </div>

        {/* Content Body */}
        {activeTab === 'bio' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code text-[#6B665E] uppercase tracking-wider">
                Current: &quot;{profile.bio.slice(0, 60)}...&quot;
              </span>
              <button
                onClick={handleGenerateBios}
                disabled={loading}
                className="text-xs font-medium text-[#C85A32] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#6B665E] space-y-2">
                <Wand2 className="w-6 h-6 mx-auto text-[#C85A32] animate-bounce" />
                <p>Composing editorial bio alternatives...</p>
              </div>
            ) : bioSuggestions.length === 0 ? (
              <div className="py-8 text-center">
                <button
                  onClick={handleGenerateBios}
                  className="px-5 py-2.5 bg-[#1C1B18] text-[#FAF8F5] rounded-xl text-xs font-medium hover:bg-[#33312B] transition-all"
                >
                  Generate 3 Editorial Bios
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {bioSuggestions.map((bio, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl transition-all flex flex-col justify-between gap-3 group"
                  >
                    <p className="text-xs text-[#1C1B18] leading-relaxed font-serif-editorial text-xs">
                      &quot;{bio}&quot;
                    </p>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => {
                          onApplyBio(bio);
                          onShowToast('Applied new bio to profile!');
                          onClose();
                        }}
                        className="px-3 py-1 bg-[#FAF8F5] hover:bg-[#1C1B18] text-[#1C1B18] hover:text-[#FAF8F5] border border-[#E8E4D9] rounded-lg text-xs font-medium transition-all flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Use This Bio</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code text-[#6B665E] uppercase tracking-wider">
                Pick a live status badge
              </span>
              <button
                onClick={handleGenerateBadges}
                disabled={loading}
                className="text-xs font-medium text-[#C85A32] hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#6B665E] space-y-2">
                <Sparkles className="w-6 h-6 mx-auto text-[#D49A3E] animate-pulse" />
                <p>Generating timely badges...</p>
              </div>
            ) : statusSuggestions.length === 0 ? (
              <div className="py-8 text-center">
                <button
                  onClick={handleGenerateBadges}
                  className="px-5 py-2.5 bg-[#1C1B18] text-[#FAF8F5] rounded-xl text-xs font-medium hover:bg-[#33312B] transition-all"
                >
                  Generate Status Badges
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {statusSuggestions.map((st, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onApplyStatus(st);
                      onShowToast(`Set status: ${st}`);
                      onClose();
                    }}
                    className="p-3 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] hover:bg-[#FAF8F5] rounded-xl text-left text-xs font-mono-code transition-all flex items-center justify-between group"
                  >
                    <span className="truncate">{st}</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#C85A32]" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
