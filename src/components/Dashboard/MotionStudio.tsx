import React, { useState, useEffect } from 'react';
import { ConnProfile, MotionConfig, ElementAnimationSetting } from '../../types';
import {
  Zap,
  RotateCcw,
  Sliders,
  Play,
  Layers,
  Sparkles,
  MousePointer,
  Check,
  Clock,
  Gauge,
  EyeOff,
  Trash2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { getMicroHoverClass } from '../../lib/customStyleUtils';

interface MotionStudioProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_MOTION: MotionConfig = {
  globalIntensity: 'balanced',
  globalSpeed: 1,
  reduceMotion: false,
  sequenceStaggerMs: 120,
  microInteractions: {
    linkHoverEffect: 'lift',
    avatarHoverEffect: 'scale',
    cardHoverEffect: 'lift',
    socialsHoverEffect: 'scale',
    hoverIntensity: 80,
    hoverSpeedMs: 200,
  },
  elementAnimations: {
    avatar: { type: 'float', durationMs: 800, delayMs: 0, direction: 'up', distancePx: 16 },
    header: { type: 'slide', durationMs: 700, delayMs: 100, direction: 'up', distancePx: 20 },
    socials: { type: 'fade', durationMs: 600, delayMs: 250, direction: 'up', distancePx: 12 },
    links: { type: 'slide', durationMs: 700, delayMs: 350, direction: 'up', distancePx: 24, staggerMs: 80 },
    projects: { type: 'reveal', durationMs: 800, delayMs: 500, direction: 'up', distancePx: 28 },
    sections: { type: 'fade', durationMs: 600, delayMs: 600, direction: 'up', distancePx: 16 },
  },
};

const HOVER_OPTIONS = {
  linkHoverEffect: [
    { value: 'lift', label: 'Lift Up (-4px)' },
    { value: 'scale', label: 'Scale Expand (1.03x)' },
    { value: 'glow', label: 'Glow Ring Accent' },
    { value: 'underline', label: 'Underline Slide' },
    { value: 'bg_shift', label: 'Background Tint Shift' },
    { value: 'border_shift', label: 'Border Color Shift' },
    { value: 'shadow', label: 'Crisp Shadow Drop' },
    { value: 'tilt', label: 'Subtle 3D Tilt' },
    { value: 'none', label: 'None (No Hover Effect)' },
  ],
  avatarHoverEffect: [
    { value: 'scale', label: 'Gentle Scale Pulse' },
    { value: 'rotate', label: 'Subtle Rotation (-3deg)' },
    { value: 'glow', label: 'Radiant Glow Ring' },
    { value: 'border_pulse', label: 'Animated Border Pulse' },
    { value: 'none', label: 'None (No Hover Effect)' },
  ],
  cardHoverEffect: [
    { value: 'zoom', label: 'Thumbnail Image Zoom' },
    { value: 'lift', label: 'Card Elevation Lift' },
    { value: 'tilt', label: 'Perspective 3D Tilt' },
    { value: 'border_glow', label: 'Accent Border Highlight' },
    { value: 'none', label: 'None (No Hover Effect)' },
  ],
  socialsHoverEffect: [
    { value: 'scale', label: 'Scale Pop (1.15x)' },
    { value: 'rotate', label: '360 Spin / Tilt' },
    { value: 'color_shift', label: 'Brand Color Highlight' },
    { value: 'underline', label: 'Minimal Underline' },
    { value: 'none', label: 'None (No Hover Effect)' },
  ],
};

const ELEMENT_LABELS: Record<string, string> = {
  avatar: 'Avatar Profile Picture',
  header: 'Name, Role & Bio Header',
  socials: 'Social Profiles Bar',
  links: 'Links Collection Cards',
  projects: 'Featured Projects & Repos',
  sections: 'Timeline & Experience Blocks',
};

export const MotionStudio: React.FC<MotionStudioProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
}) => {
  const appliedMotion: MotionConfig = profile.motionConfig || DEFAULT_MOTION;

  // Local draft state for fine-grained staging before applying
  const [draftMotion, setDraftMotion] = useState<MotionConfig>(appliedMotion);
  const [previewKey, setPreviewKey] = useState<number>(0);

  // Sync draft when profile.motionConfig updates externally
  useEffect(() => {
    if (profile.motionConfig) {
      setDraftMotion(profile.motionConfig);
    }
  }, [profile.motionConfig]);

  // Check if anything has unapplied changes
  const hasPendingChanges = JSON.stringify(draftMotion) !== JSON.stringify(appliedMotion);

  // Count active applied effects
  const activeHoverCount = [
    appliedMotion.microInteractions?.linkHoverEffect,
    appliedMotion.microInteractions?.avatarHoverEffect,
    appliedMotion.microInteractions?.cardHoverEffect,
    appliedMotion.microInteractions?.socialsHoverEffect,
  ].filter((eff) => eff && eff !== 'none').length;

  const activeElemAnimCount = Object.values(appliedMotion.elementAnimations || {}).filter(
    (anim) => anim && anim.type && anim.type !== 'none'
  ).length;

  // Commit updated motion config to profile
  const commitMotion = (newConfig: MotionConfig, msg?: string) => {
    onChangeProfile({
      ...profile,
      motionConfig: newConfig,
    });
    setDraftMotion(newConfig);
    if (msg) onShowToast(msg);
  };

  /* ----------------------------------------------------
   * HOVER MICRO-INTERACTIONS: APPLY & REMOVE HANDLERS
   * ---------------------------------------------------- */
  const handleSelectHoverDraft = (
    key: 'linkHoverEffect' | 'avatarHoverEffect' | 'cardHoverEffect' | 'socialsHoverEffect',
    val: string
  ) => {
    setDraftMotion((prev) => ({
      ...prev,
      microInteractions: {
        ...prev.microInteractions,
        [key]: val as any,
      },
    }));
  };

  const handleApplyHover = (
    key: 'linkHoverEffect' | 'avatarHoverEffect' | 'cardHoverEffect' | 'socialsHoverEffect',
    title: string
  ) => {
    const selectedVal = draftMotion.microInteractions?.[key] || 'none';
    const newMotion: MotionConfig = {
      ...appliedMotion,
      microInteractions: {
        ...appliedMotion.microInteractions,
        [key]: selectedVal,
      },
    };
    commitMotion(
      newMotion,
      selectedVal === 'none'
        ? `Removed ${title} effect`
        : `Applied ${title} effect: "${selectedVal.toUpperCase()}"`
    );
  };

  const handleRemoveHover = (
    key: 'linkHoverEffect' | 'avatarHoverEffect' | 'cardHoverEffect' | 'socialsHoverEffect',
    title: string
  ) => {
    const newMotion: MotionConfig = {
      ...appliedMotion,
      microInteractions: {
        ...appliedMotion.microInteractions,
        [key]: 'none',
      },
    };
    commitMotion(newMotion, `Removed ${title} effect`);
  };

  /* ----------------------------------------------------
   * ELEMENT ENTRANCE MOTION: APPLY & REMOVE HANDLERS
   * ---------------------------------------------------- */
  const handleSelectElementAnimDraft = (
    elemId: string,
    partial: Partial<ElementAnimationSetting>
  ) => {
    const existing = draftMotion.elementAnimations?.[elemId] || {
      type: 'slide',
      durationMs: 600,
      delayMs: 0,
      direction: 'up',
    };
    setDraftMotion((prev) => ({
      ...prev,
      elementAnimations: {
        ...prev.elementAnimations,
        [elemId]: {
          ...existing,
          ...partial,
        },
      },
    }));
  };

  const handleApplyElementAnim = (elemId: string) => {
    const draftAnim = draftMotion.elementAnimations?.[elemId] || { type: 'none' };
    const newMotion: MotionConfig = {
      ...appliedMotion,
      elementAnimations: {
        ...appliedMotion.elementAnimations,
        [elemId]: draftAnim,
      },
    };
    const label = ELEMENT_LABELS[elemId] || elemId;
    commitMotion(
      newMotion,
      draftAnim.type === 'none'
        ? `Removed motion animation on ${label}`
        : `Applied "${draftAnim.type.toUpperCase()}" animation to ${label}`
    );
  };

  const handleRemoveElementAnim = (elemId: string) => {
    const existing = appliedMotion.elementAnimations?.[elemId] || { type: 'none' };
    const newMotion: MotionConfig = {
      ...appliedMotion,
      elementAnimations: {
        ...appliedMotion.elementAnimations,
        [elemId]: {
          ...existing,
          type: 'none',
        },
      },
    };
    const label = ELEMENT_LABELS[elemId] || elemId;
    commitMotion(newMotion, `Removed motion animation on ${label}`);
  };

  /* ----------------------------------------------------
   * GLOBAL DYNAMICS: APPLY & REMOVE HANDLERS
   * ---------------------------------------------------- */
  const handleApplyGlobalDynamics = () => {
    const newMotion: MotionConfig = {
      ...appliedMotion,
      globalIntensity: draftMotion.globalIntensity,
      globalSpeed: draftMotion.globalSpeed,
      reduceMotion: draftMotion.reduceMotion,
      sequenceStaggerMs: draftMotion.sequenceStaggerMs,
    };
    commitMotion(newMotion, 'Applied global motion dynamics');
  };

  const handleRemoveGlobalDynamics = () => {
    const newMotion: MotionConfig = {
      ...appliedMotion,
      globalIntensity: 'none',
    };
    commitMotion(newMotion, 'Disabled / removed global motion dynamics');
  };

  /* ----------------------------------------------------
   * BATCH ACTIONS: APPLY ALL & REMOVE ALL
   * ---------------------------------------------------- */
  const handleApplyAllChanges = () => {
    commitMotion(draftMotion, 'Applied all staged motion & hover changes');
  };

  const handleDiscardChanges = () => {
    setDraftMotion(appliedMotion);
    onShowToast('Reverted unsaved draft changes');
  };

  const handleRemoveAllEffects = () => {
    const cleared: MotionConfig = {
      ...appliedMotion,
      globalIntensity: 'none',
      microInteractions: {
        ...appliedMotion.microInteractions,
        linkHoverEffect: 'none',
        avatarHoverEffect: 'none',
        cardHoverEffect: 'none',
        socialsHoverEffect: 'none',
      },
      elementAnimations: Object.keys(appliedMotion.elementAnimations || {}).reduce((acc, key) => {
        acc[key] = {
          ...(appliedMotion.elementAnimations?.[key] || {}),
          type: 'none',
        };
        return acc;
      }, {} as Record<string, ElementAnimationSetting>),
    };
    commitMotion(cleared, 'Removed all hover effects and motion animations');
  };

  const handleReplayEntrance = () => {
    setPreviewKey((k) => k + 1);
    onShowToast('Replaying entrance sequence cascade');
  };

  return (
    <div className="space-y-6 font-sans-ui text-[#1C1B18]">
      {/* HEADER & GLOBAL ACTIONS CONFIRMATION BAR */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif-display text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#D49A3E]" /> Motion & Hover Confirmation Studio
            </h3>
            <p className="text-xs text-[#6B665E] mt-0.5">
              Select desired physics and click <strong className="text-[#1C1B18]">Apply</strong> to confirm.
              Effects currently active show a dedicated <strong className="text-red-700">Remove</strong> button.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleReplayEntrance}
              className="px-3 py-1.5 bg-[#FAF8F5] text-[#1C1B18] hover:bg-[#E8E4D9] border border-[#E8E4D9] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs"
              title="Test & replay entrance animations"
            >
              <Play className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Test Motion</span>
            </button>

            {(activeHoverCount > 0 || activeElemAnimCount > 0) && (
              <button
                type="button"
                onClick={handleRemoveAllEffects}
                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                title="Remove all active motion and hover effects"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All Effects</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => commitMotion(DEFAULT_MOTION, 'Reset motion to defaults')}
              className="p-2 text-[#6B665E] hover:text-[#C85A32] border border-[#E8E4D9] rounded-xl hover:bg-[#FAF8F5]"
              title="Reset to default motion template"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ACTIVE STATUS BAR & PENDING CHANGES CALLOUT */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8E4D9]/80 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-medium text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Active: {activeHoverCount} hover effects • {activeElemAnimCount} entrance motions
              </span>
            </span>
            <span className="text-xs font-mono-code text-[#6B665E]">
              Intensity: <strong className="text-[#1C1B18] uppercase">{appliedMotion.globalIntensity}</strong>
            </span>
          </div>

          {hasPendingChanges && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-xs font-medium">You have unapplied selections.</span>
              <button
                type="button"
                onClick={handleApplyAllChanges}
                className="px-2 py-0.5 bg-[#1C1B18] text-white rounded-md text-2xs font-bold hover:bg-[#33312B] transition-colors"
              >
                Apply All
              </button>
              <button
                type="button"
                onClick={handleDiscardChanges}
                className="text-2xs text-zinc-600 hover:text-black underline ml-1"
              >
                Discard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INTERACTIVE MOTION & HOVER PLAYGROUND SANDBOX */}
      <div className="p-5 bg-linear-to-br from-[#FAF8F5] to-[#F2EFE9] border border-[#E8E4D9] rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C85A32]" />
            <h4 className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
              Live Interactive Playground (Hover & Motion Preview)
            </h4>
          </div>
          <button
            type="button"
            onClick={handleReplayEntrance}
            className="text-xs font-mono-code text-[#C85A32] hover:underline flex items-center gap-1 font-bold"
          >
            <RefreshCw className="w-3 h-3" /> Replay Entrance
          </button>
        </div>
        <p className="text-xs text-[#6B665E]">
          Hover your cursor over the components below to test the active or draft micro-interactions.
        </p>

        <div key={previewKey} className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Mock Link */}
          <div
            className={`p-3.5 bg-white border border-[#E8E4D9] rounded-xl cursor-pointer text-center select-none ${getMicroHoverClass(
              draftMotion.microInteractions?.linkHoverEffect
            )}`}
          >
            <div className="text-2xs uppercase font-mono-code text-[#6B665E] mb-1">Link Component</div>
            <div className="text-xs font-bold text-[#1C1B18]">Read Essay →</div>
            <div className="text-2xs text-emerald-600 mt-1 font-mono-code font-bold">
              Hover: {draftMotion.microInteractions?.linkHoverEffect || 'none'}
            </div>
          </div>

          {/* Mock Avatar */}
          <div
            className={`p-3.5 bg-white border border-[#E8E4D9] rounded-xl cursor-pointer flex flex-col items-center justify-center select-none ${getMicroHoverClass(
              draftMotion.microInteractions?.avatarHoverEffect
            )}`}
          >
            <div className="w-8 h-8 rounded-full bg-[#1C1B18] text-white flex items-center justify-center text-xs font-bold mb-1">
              CP
            </div>
            <div className="text-2xs font-mono-code font-bold text-[#1C1B18]">Avatar Pulse</div>
            <div className="text-2xs text-emerald-600 font-mono-code font-bold">
              Hover: {draftMotion.microInteractions?.avatarHoverEffect || 'none'}
            </div>
          </div>

          {/* Mock Project Card */}
          <div
            className={`p-3.5 bg-white border border-[#E8E4D9] rounded-xl cursor-pointer select-none ${getMicroHoverClass(
              draftMotion.microInteractions?.cardHoverEffect
            )}`}
          >
            <div className="text-2xs uppercase font-mono-code text-[#6B665E] mb-0.5">Project Card</div>
            <div className="text-xs font-bold text-[#1C1B18] truncate">Studio Architecture</div>
            <div className="text-2xs text-emerald-600 mt-1 font-mono-code font-bold">
              Hover: {draftMotion.microInteractions?.cardHoverEffect || 'none'}
            </div>
          </div>

          {/* Mock Social Icon */}
          <div
            className={`p-3.5 bg-white border border-[#E8E4D9] rounded-xl cursor-pointer flex flex-col items-center justify-center select-none ${getMicroHoverClass(
              draftMotion.microInteractions?.socialsHoverEffect
            )}`}
          >
            <div className="px-3 py-1 bg-black text-white rounded-full text-2xs font-mono-code font-bold">
              @handle
            </div>
            <div className="text-2xs text-emerald-600 mt-1 font-mono-code font-bold">
              Hover: {draftMotion.microInteractions?.socialsHoverEffect || 'none'}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: HOVER MICRO-INTERACTIONS WITH CONFIRM (APPLY) & REMOVE */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl space-y-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18] flex items-center gap-1.5">
            <MousePointer className="w-4 h-4 text-[#C85A32]" /> 1. Hover Micro-Interactions (Apply & Remove)
          </label>
          <span className="text-2xs text-[#6B665E]">
            {activeHoverCount} of 4 hover effects active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. LINK HOVER EFFECT */}
          {(() => {
            const appliedVal = appliedMotion.microInteractions?.linkHoverEffect || 'lift';
            const draftVal = draftMotion.microInteractions?.linkHoverEffect || 'lift';
            const isApplied = appliedVal !== 'none';
            const hasDraftChange = draftVal !== appliedVal;

            return (
              <div className="p-4 border border-[#E8E4D9] rounded-xl space-y-3 bg-[#FAF8F5] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-[#1C1B18]">Link Hover</span>
                    {isApplied ? (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Applied
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-mono-code bg-zinc-200 text-zinc-600">
                        None
                      </span>
                    )}
                  </div>

                  <select
                    value={draftVal}
                    onChange={(e) => handleSelectHoverDraft('linkHoverEffect', e.target.value)}
                    className="w-full p-2 text-xs border border-[#E8E4D9] rounded-lg bg-white font-medium"
                  >
                    {HOVER_OPTIONS.linkHoverEffect.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-2xs text-[#6B665E] font-mono-code">
                    Active: <strong className="text-[#1C1B18]">{appliedVal}</strong>
                  </div>
                </div>

                {/* Confirm (Apply) and Remove Button Group */}
                <div className="pt-2 border-t border-[#E8E4D9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyHover('linkHoverEffect', 'Link Hover')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      hasDraftChange
                        ? 'bg-[#C85A32] text-white hover:bg-[#A84522] shadow-xs animate-pulse'
                        : 'bg-[#1C1B18] text-white hover:bg-[#33312B]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply</span>
                  </button>

                  {/* Remove button only visible if that respective effect is applied */}
                  {isApplied && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHover('linkHoverEffect', 'Link Hover')}
                      className="py-1.5 px-2.5 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Remove link hover effect"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 2. AVATAR HOVER EFFECT */}
          {(() => {
            const appliedVal = appliedMotion.microInteractions?.avatarHoverEffect || 'scale';
            const draftVal = draftMotion.microInteractions?.avatarHoverEffect || 'scale';
            const isApplied = appliedVal !== 'none';
            const hasDraftChange = draftVal !== appliedVal;

            return (
              <div className="p-4 border border-[#E8E4D9] rounded-xl space-y-3 bg-[#FAF8F5] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-[#1C1B18]">Avatar Physics</span>
                    {isApplied ? (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Applied
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-mono-code bg-zinc-200 text-zinc-600">
                        None
                      </span>
                    )}
                  </div>

                  <select
                    value={draftVal}
                    onChange={(e) => handleSelectHoverDraft('avatarHoverEffect', e.target.value)}
                    className="w-full p-2 text-xs border border-[#E8E4D9] rounded-lg bg-white font-medium"
                  >
                    {HOVER_OPTIONS.avatarHoverEffect.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-2xs text-[#6B665E] font-mono-code">
                    Active: <strong className="text-[#1C1B18]">{appliedVal}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E4D9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyHover('avatarHoverEffect', 'Avatar Hover')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      hasDraftChange
                        ? 'bg-[#C85A32] text-white hover:bg-[#A84522] shadow-xs animate-pulse'
                        : 'bg-[#1C1B18] text-white hover:bg-[#33312B]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply</span>
                  </button>

                  {isApplied && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHover('avatarHoverEffect', 'Avatar Hover')}
                      className="py-1.5 px-2.5 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Remove avatar hover effect"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 3. PROJECT CARD HOVER */}
          {(() => {
            const appliedVal = appliedMotion.microInteractions?.cardHoverEffect || 'lift';
            const draftVal = draftMotion.microInteractions?.cardHoverEffect || 'lift';
            const isApplied = appliedVal !== 'none';
            const hasDraftChange = draftVal !== appliedVal;

            return (
              <div className="p-4 border border-[#E8E4D9] rounded-xl space-y-3 bg-[#FAF8F5] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-[#1C1B18]">Project Card</span>
                    {isApplied ? (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Applied
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-mono-code bg-zinc-200 text-zinc-600">
                        None
                      </span>
                    )}
                  </div>

                  <select
                    value={draftVal}
                    onChange={(e) => handleSelectHoverDraft('cardHoverEffect', e.target.value)}
                    className="w-full p-2 text-xs border border-[#E8E4D9] rounded-lg bg-white font-medium"
                  >
                    {HOVER_OPTIONS.cardHoverEffect.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-2xs text-[#6B665E] font-mono-code">
                    Active: <strong className="text-[#1C1B18]">{appliedVal}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E4D9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyHover('cardHoverEffect', 'Project Card Hover')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      hasDraftChange
                        ? 'bg-[#C85A32] text-white hover:bg-[#A84522] shadow-xs animate-pulse'
                        : 'bg-[#1C1B18] text-white hover:bg-[#33312B]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply</span>
                  </button>

                  {isApplied && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHover('cardHoverEffect', 'Project Card Hover')}
                      className="py-1.5 px-2.5 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Remove card hover effect"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}

          {/* 4. SOCIAL ICONS HOVER */}
          {(() => {
            const appliedVal = appliedMotion.microInteractions?.socialsHoverEffect || 'scale';
            const draftVal = draftMotion.microInteractions?.socialsHoverEffect || 'scale';
            const isApplied = appliedVal !== 'none';
            const hasDraftChange = draftVal !== appliedVal;

            return (
              <div className="p-4 border border-[#E8E4D9] rounded-xl space-y-3 bg-[#FAF8F5] flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-[#1C1B18]">Social Icons</span>
                    {isApplied ? (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Applied
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-mono-code bg-zinc-200 text-zinc-600">
                        None
                      </span>
                    )}
                  </div>

                  <select
                    value={draftVal}
                    onChange={(e) => handleSelectHoverDraft('socialsHoverEffect', e.target.value)}
                    className="w-full p-2 text-xs border border-[#E8E4D9] rounded-lg bg-white font-medium"
                  >
                    {HOVER_OPTIONS.socialsHoverEffect.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  <div className="text-2xs text-[#6B665E] font-mono-code">
                    Active: <strong className="text-[#1C1B18]">{appliedVal}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E4D9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyHover('socialsHoverEffect', 'Social Icons Hover')}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      hasDraftChange
                        ? 'bg-[#C85A32] text-white hover:bg-[#A84522] shadow-xs animate-pulse'
                        : 'bg-[#1C1B18] text-white hover:bg-[#33312B]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply</span>
                  </button>

                  {isApplied && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHover('socialsHoverEffect', 'Social Icons Hover')}
                      className="py-1.5 px-2.5 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Remove social icons hover effect"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* SECTION 2: ELEMENT SEQUENCE ENTRANCE MOTION (APPLY & REMOVE) */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#C85A32]" /> 2. Element Entrance Motion & Cascade (Apply & Remove)
          </label>
          <span className="text-2xs text-[#6B665E]">
            {activeElemAnimCount} of 6 element entrance animations active
          </span>
        </div>

        {/* SEQUENCE TIMELINE STEPPER */}
        <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono-code font-bold text-[#1C1B18]">
              Cascade Stagger Order (+{appliedMotion.sequenceStaggerMs || 120}ms per block)
            </span>
            <button
              type="button"
              onClick={handleReplayEntrance}
              className="text-2xs font-mono-code text-[#C85A32] font-bold hover:underline flex items-center gap-1"
            >
              <Play className="w-3 h-3" /> Test Cascade
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-center text-xs font-mono-code">
            {[
              { id: 'avatar', label: '1. Avatar', delay: 0 },
              { id: 'header', label: '2. Name & Bio', delay: (appliedMotion.sequenceStaggerMs || 120) * 1 },
              { id: 'socials', label: '3. Socials', delay: (appliedMotion.sequenceStaggerMs || 120) * 2 },
              { id: 'links', label: '4. Links', delay: (appliedMotion.sequenceStaggerMs || 120) * 3 },
              { id: 'projects', label: '5. Projects', delay: (appliedMotion.sequenceStaggerMs || 120) * 4 },
              { id: 'sections', label: '6. Sections', delay: (appliedMotion.sequenceStaggerMs || 120) * 5 },
            ].map((step) => {
              const anim = appliedMotion.elementAnimations?.[step.id];
              const isAnimApplied = anim?.type && anim.type !== 'none';
              return (
                <div
                  key={step.id}
                  className={`px-3 py-1.5 border rounded-lg flex items-center gap-2 shadow-2xs ${
                    isAnimApplied
                      ? 'bg-white border-[#1C1B18] text-[#1C1B18]'
                      : 'bg-zinc-100 border-[#E8E4D9] text-zinc-500 opacity-60'
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-2xs font-bold flex items-center justify-center ${
                      isAnimApplied ? 'bg-[#1C1B18] text-white' : 'bg-zinc-300 text-zinc-700'
                    }`}
                  >
                    {step.delay > 0 ? '+' : '0'}
                  </span>
                  <span className="font-bold">{step.label}</span>
                  <span className="text-2xs text-[#C85A32] font-bold">
                    {isAnimApplied ? anim?.type : 'none'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* INDIVIDUAL ELEMENT MOTION CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[
            { id: 'avatar', label: 'Avatar Profile Picture' },
            { id: 'header', label: 'Name, Role & Bio Header' },
            { id: 'socials', label: 'Social Profiles Bar' },
            { id: 'links', label: 'Links Collection Cards' },
            { id: 'projects', label: 'Featured Projects & Repos' },
            { id: 'sections', label: 'Timeline & Experience Blocks' },
          ].map((item) => {
            const appliedAnim = appliedMotion.elementAnimations?.[item.id] || {
              type: 'none',
              durationMs: 600,
              delayMs: 0,
              direction: 'up',
            };
            const draftAnim = draftMotion.elementAnimations?.[item.id] || appliedAnim;

            const isApplied = appliedAnim.type && appliedAnim.type !== 'none';
            const hasDraftChange =
              draftAnim.type !== appliedAnim.type || draftAnim.direction !== appliedAnim.direction;

            return (
              <div
                key={item.id}
                className="p-3.5 border border-[#E8E4D9] rounded-xl space-y-3 bg-[#FAF8F5] flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold text-[#1C1B18] truncate pr-1">
                      {item.label}
                    </span>
                    {isApplied ? (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800 shrink-0 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> Applied
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-2xs font-mono-code bg-zinc-200 text-zinc-600 shrink-0">
                        None
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-2xs uppercase font-mono-code text-[#6B665E] block mb-0.5">
                        Animation Type
                      </label>
                      <select
                        value={draftAnim.type || 'none'}
                        onChange={(e) =>
                          handleSelectElementAnimDraft(item.id, { type: e.target.value as any })
                        }
                        className="w-full p-1.5 text-xs border border-[#E8E4D9] rounded-lg bg-white font-mono-code"
                      >
                        <option value="none">None (Static)</option>
                        <option value="fade">Fade In</option>
                        <option value="slide">Slide In</option>
                        <option value="scale">Scale Up</option>
                        <option value="float">Float Gentle</option>
                        <option value="reveal">Blur Reveal</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-2xs uppercase font-mono-code text-[#6B665E] block mb-0.5">
                        Direction
                      </label>
                      <select
                        value={draftAnim.direction || 'up'}
                        onChange={(e) =>
                          handleSelectElementAnimDraft(item.id, { direction: e.target.value as any })
                        }
                        className="w-full p-1.5 text-xs border border-[#E8E4D9] rounded-lg bg-white font-mono-code"
                      >
                        <option value="up">Up ↑</option>
                        <option value="down">Down ↓</option>
                        <option value="left">Left ←</option>
                        <option value="right">Right →</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-2xs text-[#6B665E] font-mono-code flex items-center justify-between">
                    <span>
                      Active: <strong className="text-[#1C1B18]">{appliedAnim.type}</strong> ({appliedAnim.direction || 'up'})
                    </span>
                  </div>
                </div>

                {/* Confirm Apply & Remove Button Group */}
                <div className="pt-2 border-t border-[#E8E4D9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyElementAnim(item.id)}
                    className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      hasDraftChange
                        ? 'bg-[#C85A32] text-white hover:bg-[#A84522] shadow-xs animate-pulse'
                        : 'bg-[#1C1B18] text-white hover:bg-[#33312B]'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    <span>Apply</span>
                  </button>

                  {/* Remove button: only visible if motion is applied */}
                  {isApplied && (
                    <button
                      type="button"
                      onClick={() => handleRemoveElementAnim(item.id)}
                      className="py-1.5 px-2.5 bg-white text-red-600 hover:bg-red-50 hover:text-red-700 border border-red-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                      title="Remove motion effect on this element"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: GLOBAL MOTION DYNAMICS & SPEED MULTIPLIER */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18] block flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#C85A32]" /> 3. Global Motion Dynamics & Physics
          </label>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8E4D9]">
              <input
                type="checkbox"
                checked={draftMotion.reduceMotion}
                onChange={(e) =>
                  setDraftMotion((prev) => ({ ...prev, reduceMotion: e.target.checked }))
                }
                className="rounded accent-[#C85A32]"
              />
              <EyeOff className="w-3.5 h-3.5 text-[#6B665E]" />
              <span className="text-xs font-mono-code font-bold">Reduce Motion</span>
            </label>

            {/* Remove button if global motion intensity is not 'none' */}
            {appliedMotion.globalIntensity !== 'none' && (
              <button
                type="button"
                onClick={handleRemoveGlobalDynamics}
                className="px-3 py-1.5 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                title="Disable all global motion dynamics"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Dynamics</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleApplyGlobalDynamics}
              className="px-3 py-1.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Dynamics</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* INTENSITY PRESET SELECTOR */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono-code font-bold">
              <span>Preset Intensity:</span>
              <span className="text-[#C85A32] uppercase">{draftMotion.globalIntensity}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'None', desc: 'Static' },
                { id: 'subtle', label: 'Subtle', desc: 'Minimal' },
                { id: 'balanced', label: 'Balanced', desc: 'Natural' },
                { id: 'expressive', label: 'Expressive', desc: 'Vibrant' },
              ].map((opt) => {
                const active = draftMotion.globalIntensity === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      setDraftMotion((prev) => ({
                        ...prev,
                        globalIntensity: opt.id as any,
                      }))
                    }
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      active
                        ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] text-[#6B665E] border-[#E8E4D9] hover:border-[#1C1B18]'
                    }`}
                  >
                    <div className="text-xs font-bold">{opt.label}</div>
                    <div className="text-2xs opacity-70 font-mono-code">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* GLOBAL SPEED MULTIPLIER & CASCADE STAGGER */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono-code font-bold">
                <span>Speed Multiplier:</span>
                <span className="text-[#C85A32]">{draftMotion.globalSpeed || 1}x</span>
              </div>
              <div className="flex gap-2">
                {[0.5, 1.0, 1.5, 2.0].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setDraftMotion((prev) => ({ ...prev, globalSpeed: s }))}
                    className={`flex-1 py-1.5 text-xs font-mono-code rounded-lg border ${
                      draftMotion.globalSpeed === s
                        ? 'bg-[#C85A32] text-white border-[#C85A32] font-bold'
                        : 'bg-[#FAF8F5] text-[#6B665E] border-[#E8E4D9]'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono-code font-bold">
                <span>Entrance Cascade Stagger:</span>
                <span className="text-[#C85A32]">{draftMotion.sequenceStaggerMs || 120}ms</span>
              </div>
              <input
                type="range"
                min={40}
                max={300}
                step={20}
                value={draftMotion.sequenceStaggerMs || 120}
                onChange={(e) =>
                  setDraftMotion((prev) => ({
                    ...prev,
                    sequenceStaggerMs: Number(e.target.value),
                  }))
                }
                className="w-full accent-[#C85A32]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
