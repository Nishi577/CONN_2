import React, { useState, useEffect } from 'react';
import { ConnProfile, ElementPositionOverride, DecorativeObject } from '../../types';
import {
  Move,
  RotateCcw,
  Plus,
  Trash2,
  Layers,
  Sparkles,
  Grid,
  Check,
  Maximize2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowUp,
  ArrowDown,
  Compass,
  CheckCircle2,
  AlertCircle,
  Eye,
  RefreshCw,
  X,
  User,
  Type,
  FileText,
  Share2,
  CheckCircle,
  FolderGit2,
  Sparkle,
  Bookmark,
  Clock,
  Briefcase,
  Wrench,
  Code2,
  Mail,
  Send,
  SlidersHorizontal,
} from 'lucide-react';

interface ElementPositionStudioProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

export interface MovableElementDef {
  id: string;
  label: string;
  desc: string;
  category: 'identity' | 'content';
  icon: React.ElementType;
}

const MOVABLE_ELEMENTS: MovableElementDef[] = [
  { id: 'avatar', label: 'Profile Avatar', desc: 'Main photo badge or avatar thumbnail', category: 'identity', icon: User },
  { id: 'name', label: 'Name & Role', desc: 'Display name, role title & pronouns', category: 'identity', icon: Type },
  { id: 'bio', label: 'Biography Paragraph', desc: 'Profile summary & statement', category: 'identity', icon: FileText },
  { id: 'socials', label: 'Social Profile Bar', desc: 'Connected social icon row', category: 'identity', icon: Share2 },
  { id: 'availability', label: 'Availability Indicator', desc: 'Freelance & work status badge', category: 'identity', icon: CheckCircle },
  { id: 'header', label: 'Header Container', desc: 'Entire identity header section', category: 'identity', icon: Layers },
  { id: 'links', label: 'Links & Projects Stack', desc: 'Custom link cards collection', category: 'content', icon: Bookmark },
  { id: 'featured_project', label: 'Featured Project', desc: 'Hero project spotlight card', category: 'content', icon: Sparkle },
  { id: 'now', label: 'Real-Time "Now" Card', desc: 'Current building/reading status', category: 'content', icon: Clock },
  { id: 'timeline', label: 'Timeline & Milestones', desc: 'Career roadmap & history', category: 'content', icon: Clock },
  { id: 'experience', label: 'Career & Experience', desc: 'Work history & company roles', category: 'content', icon: Briefcase },
  { id: 'skills', label: 'Skills & Tech Stack', desc: 'Technical proficiencies & badges', category: 'content', icon: Wrench },
  { id: 'opensource', label: 'Open Source Repos', desc: 'GitHub stats & repository cards', category: 'content', icon: Code2 },
  { id: 'newsletter', label: 'Newsletter Signup', desc: 'Email subscription & inquiry block', category: 'content', icon: Mail },
  { id: 'contact', label: 'Contact Router', desc: 'Direct message & inquiry form', category: 'content', icon: Send },
];

const DEFAULT_OVERRIDE: ElementPositionOverride = {
  id: '',
  offsetX: 0,
  offsetY: 0,
  scale: 100,
  rotation: 0,
  alignment: 'center',
  zIndex: 1,
};

export const ElementPositionStudio: React.FC<ElementPositionStudioProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
}) => {
  const [selectedElementId, setSelectedElementId] = useState<string>('avatar');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'identity' | 'content'>('all');
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [liveSync, setLiveSync] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'elements' | 'floating'>('elements');

  const appliedOverrides: Record<string, ElementPositionOverride> = profile.elementOverrides || {};
  const decorObjects: DecorativeObject[] = profile.decorativeObjects || [];

  // Local draft state for staging adjustments
  const [draftOverrides, setDraftOverrides] = useState<Record<string, ElementPositionOverride>>(() => ({ ...appliedOverrides }));

  // Keep draft in sync if external profile changes and has overrides
  useEffect(() => {
    setDraftOverrides((prev) => {
      const merged = { ...prev };
      Object.keys(appliedOverrides).forEach((key) => {
        if (!merged[key]) {
          merged[key] = appliedOverrides[key];
        }
      });
      return merged;
    });
  }, [profile.elementOverrides]);

  const getActiveDraft = (id: string): ElementPositionOverride => {
    return (
      draftOverrides[id] ||
      appliedOverrides[id] || {
        ...DEFAULT_OVERRIDE,
        id,
      }
    );
  };

  const activeDraft = getActiveDraft(selectedElementId);
  const activeApplied = appliedOverrides[selectedElementId];
  const isApplied = !!activeApplied;

  // Check if draft has unapplied differences
  const hasUnappliedChanges =
    JSON.stringify(activeDraft) !== JSON.stringify(activeApplied || { ...DEFAULT_OVERRIDE, id: selectedElementId });

  // Update draft override locally and optionally sync live to workspace preview
  const updateDraft = (partial: Partial<ElementPositionOverride>) => {
    const updatedDraft = {
      ...activeDraft,
      ...partial,
      id: selectedElementId,
    };

    const newDrafts = {
      ...draftOverrides,
      [selectedElementId]: updatedDraft,
    };
    setDraftOverrides(newDrafts);

    if (liveSync) {
      onChangeProfile({
        ...profile,
        elementOverrides: {
          ...appliedOverrides,
          [selectedElementId]: updatedDraft,
        },
      });
    }
  };

  // CONFIRM / APPLY button: lock staged changes into profile.elementOverrides
  const handleApplyOverride = () => {
    const activeDef = MOVABLE_ELEMENTS.find((m) => m.id === selectedElementId);
    const updated = {
      ...appliedOverrides,
      [selectedElementId]: { ...activeDraft, id: selectedElementId },
    };

    onChangeProfile({
      ...profile,
      elementOverrides: updated,
    });
    onShowToast(`Applied position styling to ${activeDef?.label || selectedElementId}`);
  };

  // REMOVE button: only visible when override is active in profile!
  const handleRemoveOverride = () => {
    const activeDef = MOVABLE_ELEMENTS.find((m) => m.id === selectedElementId);
    const updated = { ...appliedOverrides };
    delete updated[selectedElementId];

    const resetDrafts = { ...draftOverrides };
    delete resetDrafts[selectedElementId];
    setDraftOverrides(resetDrafts);

    onChangeProfile({
      ...profile,
      elementOverrides: updated,
    });
    onShowToast(`Removed position override for ${activeDef?.label || selectedElementId}`);
  };

  // Nudge using D-Pad
  const handleNudge = (dx: number, dy: number) => {
    const step = snapToGrid ? 8 : 1;
    updateDraft({
      offsetX: (activeDraft.offsetX || 0) + dx * step,
      offsetY: (activeDraft.offsetY || 0) + dy * step,
    });
  };

  const handleResetCenter = () => {
    updateDraft({ offsetX: 0, offsetY: 0 });
  };

  // Presets
  const applyPreset = (preset: {
    label: string;
    offsetX: number;
    offsetY: number;
    scale: number;
    rotation: number;
    alignment: 'left' | 'center' | 'right';
    zIndex: number;
  }) => {
    updateDraft({
      offsetX: preset.offsetX,
      offsetY: preset.offsetY,
      scale: preset.scale,
      rotation: preset.rotation,
      alignment: preset.alignment,
      zIndex: preset.zIndex,
    });
  };

  const resetAllPositions = () => {
    setDraftOverrides({});
    onChangeProfile({
      ...profile,
      elementOverrides: {},
      decorativeObjects: [],
    });
    onShowToast('Reset all element positions to theme default');
  };

  // Floating objects management
  const handleAddDecorativeObject = (type: DecorativeObject['type']) => {
    const newObject: DecorativeObject = {
      id: `decor_${Date.now()}`,
      type,
      colorHex: profile.customTheme?.accentHex || '#C85A32',
      xPercent: 20 + Math.floor(Math.random() * 60),
      yPercent: 15 + Math.floor(Math.random() * 60),
      scale: 1,
      rotation: Math.floor(Math.random() * 30),
      opacity: 0.7,
      blurPx: type === 'gradient_blob' ? 24 : 0,
      zIndex: 0,
      animation: 'float',
      speed: 1,
      content: type === 'badge' ? 'Conn Verified' : type === 'text_label' ? '• ARCHIVE' : undefined,
    };
    const updated = [...decorObjects, newObject];
    onChangeProfile({
      ...profile,
      decorativeObjects: updated,
    });
    onShowToast(`Added decorative ${type.replace('_', ' ')} layer`);
  };

  const updateDecorObject = (id: string, partial: Partial<DecorativeObject>) => {
    const updated = decorObjects.map((d) => (d.id === id ? { ...d, ...partial } : d));
    onChangeProfile({
      ...profile,
      decorativeObjects: updated,
    });
  };

  const removeDecorObject = (id: string) => {
    const updated = decorObjects.filter((d) => d.id !== id);
    onChangeProfile({
      ...profile,
      decorativeObjects: updated,
    });
    onShowToast('Removed decorative layer');
  };

  const filteredElements = MOVABLE_ELEMENTS.filter(
    (item) => categoryFilter === 'all' || item.category === categoryFilter
  );

  const totalOverriddenCount = Object.keys(appliedOverrides).length;
  const currentElementDef = MOVABLE_ELEMENTS.find((e) => e.id === selectedElementId) || MOVABLE_ELEMENTS[0];

  return (
    <div className="space-y-6 font-sans-ui text-[#1C1B18]">
      {/* HEADER & GLOBAL CONTROLS */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif-display text-lg font-bold flex items-center gap-2">
            <Move className="w-5 h-5 text-[#C85A32]" /> Element Positioning & Layout Studio
          </h3>
          <p className="text-xs text-[#6B665E] mt-0.5">
            Offset, scale, rotate, align, and layer each individual profile section with precision controls and live visual coordinate feedback.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex bg-[#FAF8F5] p-1 border border-[#E8E4D9] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('elements')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all flex items-center gap-1.5 ${
                activeTab === 'elements'
                  ? 'bg-[#1C1B18] text-white shadow-xs'
                  : 'text-[#6B665E] hover:text-[#1C1B18]'
              }`}
            >
              <Move className="w-3.5 h-3.5" />
              <span>Elements ({totalOverriddenCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('floating')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all flex items-center gap-1.5 ${
                activeTab === 'floating'
                  ? 'bg-[#1C1B18] text-white shadow-xs'
                  : 'text-[#6B665E] hover:text-[#1C1B18]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D49A3E]" />
              <span>Canvas Layers ({decorObjects.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code flex items-center gap-1.5 transition-all ${
              snapToGrid ? 'bg-[#1C1B18] text-white border-[#1C1B18]' : 'bg-[#FAF8F5] text-[#6B665E] border-[#E8E4D9]'
            }`}
            title="Toggle 8px grid snapping"
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Snap: {snapToGrid ? '8px' : '1px'}</span>
          </button>

          {totalOverriddenCount > 0 && (
            <button
              type="button"
              onClick={resetAllPositions}
              className="px-3 py-1.5 border border-[#E8E4D9] hover:border-red-300 text-xs font-mono-code text-[#6B665E] hover:text-red-600 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'elements' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SIDEBAR: ELEMENT SELECTOR LIST */}
          <div className="lg:col-span-4 p-4 bg-white border border-[#E8E4D9] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18] block">
                Profile Elements
              </label>
              <span className="text-2xs font-mono-code text-[#6B665E]">
                {totalOverriddenCount} customized
              </span>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex gap-1 p-1 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl text-xs font-mono-code">
              {(['all', 'identity', 'content'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`flex-1 py-1 rounded-lg capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-white text-[#1C1B18] font-bold shadow-xs'
                      : 'text-[#6B665E] hover:text-[#1C1B18]'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>

            {/* Element List */}
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {filteredElements.map((item) => {
                const isSelected = selectedElementId === item.id;
                const hasAppliedOverride = !!appliedOverrides[item.id];
                const ItemIcon = item.icon;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedElementId(item.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#C85A32] bg-[#FAF8F5] ring-2 ring-[#C85A32]/20 font-bold'
                        : 'border-[#E8E4D9] bg-white hover:border-[#1C1B18]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg border ${
                          isSelected
                            ? 'bg-[#C85A32]/10 border-[#C85A32]/30 text-[#C85A32]'
                            : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#6B665E]'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1C1B18] flex items-center gap-1.5">
                          <span>{item.label}</span>
                          {hasAppliedOverride && (
                            <span className="px-1.5 py-0.2 rounded-full text-2xs font-mono-code bg-[#C85A32]/10 text-[#C85A32] border border-[#C85A32]/20 font-bold">
                              OVERRIDDEN
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-[#6B665E] font-light leading-tight mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <Move className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C85A32]' : 'text-gray-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* MAIN STAGE: CONTROLS & SANDBOX FOR SELECTED ELEMENT */}
          <div className="lg:col-span-8 space-y-5">
            {/* ACTIVE ELEMENT HUD & ACTION BAR */}
            <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4D9]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-mono-code uppercase font-bold text-[#C85A32] px-2 py-0.5 bg-[#C85A32]/10 rounded border border-[#C85A32]/20">
                      {isApplied ? 'Override Active' : 'Default Position'}
                    </span>
                    {hasUnappliedChanges && (
                      <span className="text-2xs font-mono-code text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        ● Staged edits pending
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif-display text-lg font-bold text-[#1C1B18] mt-1">
                    {currentElementDef.label}
                  </h4>
                </div>

                {/* THE CONFIRM / APPLY AND REMOVE BUTTONS */}
                <div className="flex items-center gap-2">
                  {/* REMOVE BUTTON: Shown ONLY when this element has an active applied override */}
                  {isApplied && (
                    <button
                      type="button"
                      onClick={handleRemoveOverride}
                      className="px-3 py-1.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-mono-code rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                      title="Remove this position override and restore theme default"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Override</span>
                    </button>
                  )}

                  {/* APPLY / CONFIRM BUTTON */}
                  <button
                    type="button"
                    onClick={handleApplyOverride}
                    className="px-4 py-1.5 bg-[#C85A32] hover:bg-[#B34D28] text-white text-xs font-mono-code rounded-xl flex items-center gap-1.5 transition-all shadow-sm font-bold active:scale-98"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Position</span>
                  </button>
                </div>
              </div>

              {/* INTERACTIVE COORDINATE SANDBOX & TELEMETRY */}
              <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="font-bold text-[#1C1B18] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#C85A32]" />
                    Coordinate Canvas & Live Sandbox
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs text-[#6B665E]">
                      <input
                        type="checkbox"
                        checked={liveSync}
                        onChange={(e) => setLiveSync(e.target.checked)}
                        className="rounded border-[#E8E4D9] accent-[#C85A32]"
                      />
                      <span>Sync Live Preview</span>
                    </label>
                  </div>
                </div>

                {/* VISUAL MINI-CANVAS */}
                <div className="h-44 w-full bg-white border border-[#E8E4D9] rounded-xl relative overflow-hidden flex items-center justify-center select-none">
                  {/* Subtle Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-40 pointer-events-none"
                    style={{
                      backgroundImage: 'radial-gradient(#1C1B18 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                    }}
                  />
                  {/* Center Crosshairs */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-black/10 pointer-events-none" />
                  <div className="absolute inset-y-0 left-1/2 w-px bg-black/10 pointer-events-none" />

                  {/* Transformed Target Element Preview */}
                  <div
                    className="transition-transform duration-150 ease-out z-10"
                    style={{
                      transform: `translate(${activeDraft.offsetX || 0}px, ${activeDraft.offsetY || 0}px) scale(${(activeDraft.scale || 100) / 100}) rotate(${activeDraft.rotation || 0}deg)`,
                      zIndex: activeDraft.zIndex || 1,
                    }}
                  >
                    <div
                      className={`px-4 py-2.5 rounded-xl border-2 shadow-md bg-white flex items-center gap-2 text-xs font-bold ${
                        isApplied ? 'border-[#C85A32] text-[#C85A32]' : 'border-[#1C1B18] text-[#1C1B18]'
                      }`}
                    >
                      <currentElementDef.icon className="w-4 h-4" />
                      <span>{currentElementDef.label}</span>
                    </div>
                  </div>

                  {/* Telemetry Badges HUD */}
                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-1 text-2xs font-mono-code text-[#6B665E] pointer-events-none">
                    <div className="flex gap-1.5 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-[#E8E4D9] shadow-2xs">
                      <span>X: <strong className="text-[#C85A32]">{activeDraft.offsetX || 0}px</strong></span>
                      <span>Y: <strong className="text-[#C85A32]">{activeDraft.offsetY || 0}px</strong></span>
                      <span>Scale: <strong className="text-[#C85A32]">{activeDraft.scale || 100}%</strong></span>
                      <span>Rot: <strong className="text-[#C85A32]">{activeDraft.rotation || 0}°</strong></span>
                    </div>
                    <div className="bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded border border-[#E8E4D9] shadow-2xs">
                      <span>Align: <strong className="text-[#C85A32] capitalize">{activeDraft.alignment || 'center'}</strong></span>
                      <span className="ml-2">Layer: <strong className="text-[#C85A32]">Z-{activeDraft.zIndex || 1}</strong></span>
                    </div>
                  </div>
                </div>

                {/* D-PAD NUDGE & PRESETS ROW */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  {/* D-Pad Buttons */}
                  <div className="flex items-center gap-1 font-mono-code text-xs">
                    <span className="text-2xs text-[#6B665E] mr-1">Nudge:</span>
                    <button
                      type="button"
                      onClick={() => handleNudge(-1, 0)}
                      className="px-2.5 py-1 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg shadow-2xs text-[#1C1B18]"
                      title="Nudge Left"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(0, -1)}
                      className="px-2.5 py-1 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg shadow-2xs text-[#1C1B18]"
                      title="Nudge Up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={handleResetCenter}
                      className="px-2.5 py-1 bg-white border border-[#E8E4D9] hover:border-[#C85A32] text-[#6B665E] hover:text-[#C85A32] rounded-lg shadow-2xs text-2xs"
                      title="Reset Offset to (0,0)"
                    >
                      (0,0)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(0, 1)}
                      className="px-2.5 py-1 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg shadow-2xs text-[#1C1B18]"
                      title="Nudge Down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNudge(1, 0)}
                      className="px-2.5 py-1 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg shadow-2xs text-[#1C1B18]"
                      title="Nudge Right"
                    >
                      →
                    </button>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-2xs font-mono-code text-[#6B665E]">Presets:</span>
                    {[
                      { label: 'Normal', offsetX: 0, offsetY: 0, scale: 100, rotation: 0, alignment: 'center', zIndex: 1 },
                      { label: 'Left Accent', offsetX: -24, offsetY: 0, scale: 100, rotation: -2, alignment: 'left', zIndex: 1 },
                      { label: 'Right Accent', offsetX: 24, offsetY: 0, scale: 100, rotation: 2, alignment: 'right', zIndex: 1 },
                      { label: 'Elevated Pop', offsetX: 0, offsetY: -8, scale: 110, rotation: 0, alignment: 'center', zIndex: 3 },
                      { label: 'Subordinate', offsetX: 0, offsetY: 0, scale: 85, rotation: 0, alignment: 'center', zIndex: 1 },
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => applyPreset(p as any)}
                        className="px-2 py-0.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-2xs font-mono-code text-[#1C1B18] rounded-md transition-colors"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* DUAL SLIDER & EXACT NUMERIC STEPPERS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* POSITION X */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                      Horizontal Offset (X)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={-150}
                        max={150}
                        step={snapToGrid ? 8 : 1}
                        value={activeDraft.offsetX || 0}
                        onChange={(e) => updateDraft({ offsetX: Number(e.target.value) })}
                        className="w-16 px-1.5 py-0.5 bg-white border border-[#E8E4D9] rounded text-xs font-mono-code text-right font-bold text-[#C85A32]"
                      />
                      <span className="text-xs font-mono-code text-[#6B665E]">px</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-150}
                    max={150}
                    step={snapToGrid ? 8 : 1}
                    value={activeDraft.offsetX || 0}
                    onChange={(e) => updateDraft({ offsetX: Number(e.target.value) })}
                    className="w-full accent-[#C85A32]"
                  />
                  <div className="flex justify-between text-2xs font-mono-code text-[#6B665E]">
                    <span>-150px (Left)</span>
                    <span>0</span>
                    <span>+150px (Right)</span>
                  </div>
                </div>

                {/* POSITION Y */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                      Vertical Offset (Y)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={-150}
                        max={150}
                        step={snapToGrid ? 8 : 1}
                        value={activeDraft.offsetY || 0}
                        onChange={(e) => updateDraft({ offsetY: Number(e.target.value) })}
                        className="w-16 px-1.5 py-0.5 bg-white border border-[#E8E4D9] rounded text-xs font-mono-code text-right font-bold text-[#C85A32]"
                      />
                      <span className="text-xs font-mono-code text-[#6B665E]">px</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-150}
                    max={150}
                    step={snapToGrid ? 8 : 1}
                    value={activeDraft.offsetY || 0}
                    onChange={(e) => updateDraft({ offsetY: Number(e.target.value) })}
                    className="w-full accent-[#C85A32]"
                  />
                  <div className="flex justify-between text-2xs font-mono-code text-[#6B665E]">
                    <span>-150px (Up)</span>
                    <span>0</span>
                    <span>+150px (Down)</span>
                  </div>
                </div>

                {/* SCALE FACTOR */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                      Scale Proportion
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={50}
                        max={180}
                        step={5}
                        value={activeDraft.scale || 100}
                        onChange={(e) => updateDraft({ scale: Number(e.target.value) })}
                        className="w-16 px-1.5 py-0.5 bg-white border border-[#E8E4D9] rounded text-xs font-mono-code text-right font-bold text-[#C85A32]"
                      />
                      <span className="text-xs font-mono-code text-[#6B665E]">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={180}
                    step={5}
                    value={activeDraft.scale || 100}
                    onChange={(e) => updateDraft({ scale: Number(e.target.value) })}
                    className="w-full accent-[#C85A32]"
                  />
                  <div className="flex justify-between text-2xs font-mono-code text-[#6B665E]">
                    <span>50% (Compact)</span>
                    <span>100% (Standard)</span>
                    <span>180% (Hero)</span>
                  </div>
                </div>

                {/* ROTATION ANGLE */}
                <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                      Rotational Tilt Angle
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min={-35}
                        max={35}
                        step={1}
                        value={activeDraft.rotation || 0}
                        onChange={(e) => updateDraft({ rotation: Number(e.target.value) })}
                        className="w-16 px-1.5 py-0.5 bg-white border border-[#E8E4D9] rounded text-xs font-mono-code text-right font-bold text-[#C85A32]"
                      />
                      <span className="text-xs font-mono-code text-[#6B665E]">°</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-35}
                    max={35}
                    step={1}
                    value={activeDraft.rotation || 0}
                    onChange={(e) => updateDraft({ rotation: Number(e.target.value) })}
                    className="w-full accent-[#C85A32]"
                  />
                  <div className="flex justify-between text-2xs font-mono-code text-[#6B665E]">
                    <span>-35° (Counter)</span>
                    <span>0°</span>
                    <span>+35° (Clockwise)</span>
                  </div>
                </div>
              </div>

              {/* ALIGNMENT & LAYER STACKING */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* Horizontal Alignment */}
                <div className="space-y-2">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18] block">
                    Horizontal Alignment
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'left', icon: AlignLeft, label: 'Left' },
                      { id: 'center', icon: AlignCenter, label: 'Center' },
                      { id: 'right', icon: AlignRight, label: 'Right' },
                    ].map((a) => {
                      const Icon = a.icon;
                      const active = (activeDraft.alignment || 'center') === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => updateDraft({ alignment: a.id as any })}
                          className={`flex-1 py-2 text-xs font-mono-code rounded-xl border flex items-center justify-center gap-1.5 transition-all ${
                            active
                              ? 'bg-[#1C1B18] text-white border-[#1C1B18] font-bold shadow-xs'
                              : 'bg-[#FAF8F5] text-[#6B665E] border-[#E8E4D9] hover:border-[#1C1B18]'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{a.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Layer Stacking (Z-Index) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono-code font-bold text-[#1C1B18] block">
                      Layer Depth (Z-Index)
                    </label>
                    <span className="text-xs font-mono-code text-[#C85A32] font-bold">
                      Z: {activeDraft.zIndex || 1}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => updateDraft({ zIndex: Math.max(0, (activeDraft.zIndex || 1) - 1) })}
                      className="flex-1 py-2 text-xs font-mono-code bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowDown className="w-3.5 h-3.5 text-[#6B665E]" /> Send Back
                    </button>
                    <button
                      type="button"
                      onClick={() => updateDraft({ zIndex: (activeDraft.zIndex || 1) + 1 })}
                      className="flex-1 py-2 text-xs font-mono-code bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl flex items-center justify-center gap-1 transition-all"
                    >
                      <ArrowUp className="w-3.5 h-3.5 text-[#C85A32]" /> Bring Forward
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING DECORATIVE OBJECTS & CANVAS ELEMENTS */}
      {activeTab === 'floating' && (
        <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4D9]">
            <div>
              <h4 className="font-serif-display text-base font-bold text-[#1C1B18] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#D49A3E]" /> Floating Canvas Layers & Ambient Objects
              </h4>
              <p className="text-xs text-[#6B665E] mt-0.5">
                Add radiant ambient orbs, stars, subtle shapes, or floating verification badges across the profile canvas.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'gradient_blob', label: 'Gradient Orb' },
                { id: 'star', label: 'Star Particle' },
                { id: 'shape', label: 'Geometric Card' },
                { id: 'badge', label: 'Floating Badge' },
                { id: 'dot', label: 'Accent Dot' },
                { id: 'text_label', label: 'Parchment Label' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => handleAddDecorativeObject(btn.id as any)}
                  className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#C85A32] text-xs font-mono-code rounded-xl flex items-center gap-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>+ {btn.label}</span>
                </button>
              ))}
            </div>
          </div>

          {decorObjects.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#E8E4D9] rounded-xl bg-[#FAF8F5] space-y-2">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="text-xs text-[#6B665E]">No floating decorative objects added yet. Click above to add radiant orbs, stars, or badge markers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {decorObjects.map((d) => (
                <div key={d.id} className="p-4 border border-[#E8E4D9] bg-[#FAF8F5] rounded-xl space-y-3 relative group shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: d.colorHex }} />
                      <span className="text-xs font-mono-code font-bold capitalize text-[#1C1B18]">
                        {d.type.replace('_', ' ')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDecorObject(d.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                      title="Remove layer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Content input for badges/labels */}
                  {(d.type === 'badge' || d.type === 'text_label') && (
                    <div>
                      <label className="text-2xs font-mono-code text-[#6B665E] block mb-1">Label Text</label>
                      <input
                        type="text"
                        value={d.content || ''}
                        onChange={(e) => updateDecorObject(d.id, { content: e.target.value })}
                        className="w-full px-2 py-1 bg-white border border-[#E8E4D9] rounded text-xs font-mono-code"
                        placeholder="e.g. Conn Verified"
                      />
                    </div>
                  )}

                  {/* Coordinates sliders */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
                    <div>
                      <div className="flex justify-between text-2xs text-[#6B665E]">
                        <span>X Pos</span>
                        <span>{d.xPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={d.xPercent}
                        onChange={(e) => updateDecorObject(d.id, { xPercent: Number(e.target.value) })}
                        className="w-full accent-[#C85A32]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-2xs text-[#6B665E]">
                        <span>Y Pos</span>
                        <span>{d.yPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={d.yPercent}
                        onChange={(e) => updateDecorObject(d.id, { yPercent: Number(e.target.value) })}
                        className="w-full accent-[#C85A32]"
                      />
                    </div>
                  </div>

                  {/* Scale & Opacity */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono-code">
                    <div>
                      <div className="flex justify-between text-2xs text-[#6B665E]">
                        <span>Scale</span>
                        <span>{Math.round((d.scale || 1) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.3}
                        max={2.5}
                        step={0.1}
                        value={d.scale || 1}
                        onChange={(e) => updateDecorObject(d.id, { scale: Number(e.target.value) })}
                        className="w-full accent-[#C85A32]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-2xs text-[#6B665E]">
                        <span>Opacity</span>
                        <span>{Math.round((d.opacity ?? 0.7) * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min={0.1}
                        max={1}
                        step={0.05}
                        value={d.opacity ?? 0.7}
                        onChange={(e) => updateDecorObject(d.id, { opacity: Number(e.target.value) })}
                        className="w-full accent-[#C85A32]"
                      />
                    </div>
                  </div>

                  {/* Color & Motion */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E4D9]">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={d.colorHex}
                        onChange={(e) => updateDecorObject(d.id, { colorHex: e.target.value })}
                        className="w-6 h-6 rounded border border-[#E8E4D9] cursor-pointer"
                      />
                      <span className="text-2xs font-mono-code text-[#6B665E]">{d.colorHex}</span>
                    </div>

                    <select
                      value={d.animation || 'float'}
                      onChange={(e) => updateDecorObject(d.id, { animation: e.target.value as any })}
                      className="p-1 text-2xs border border-[#E8E4D9] rounded bg-white font-mono-code"
                    >
                      <option value="none">Static</option>
                      <option value="float">Subtle Float</option>
                      <option value="pulse">Pulse Glow</option>
                      <option value="spin">Slow Spin</option>
                      <option value="drift">Horizontal Drift</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
