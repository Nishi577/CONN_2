import React, { useState } from 'react';
import { ConnProfile, LinkShape, CustomDesignFamily, ThemeOption } from '../../types';
import { EDITORIAL_THEMES } from '../../data/themes';
import { ThemeEditor } from './ThemeEditor';
import { BackgroundStudio } from './BackgroundStudio';
import { MotionStudio } from './MotionStudio';
import { ElementPositionStudio } from './ElementPositionStudio';
import {
  Check,
  Sparkles,
  Sliders,
  Palette,
  Sun,
  Zap,
  Move,
  Plus,
  Trash2,
  X,
  FolderPlus,
  ArrowRight,
  Square,
  Maximize2,
  Circle,
  Minus,
  Pipette,
  CheckCircle2,
} from 'lucide-react';

interface ThemeSelectorProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

const SHAPE_OPTIONS: { id: LinkShape; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: 'sharp',
    label: 'Sharp Corner',
    desc: '0px radius, clean architectural grid',
    icon: <Square className="w-4 h-4" />,
  },
  {
    id: 'rounded',
    label: 'Soft Radius',
    desc: '12px subtle rounded corners',
    icon: <Maximize2 className="w-4 h-4 rounded" />,
  },
  {
    id: 'pill',
    label: 'Stadium Pill',
    desc: 'Full stadium pill curve',
    icon: <Circle className="w-4 h-4" />,
  },
  {
    id: 'underline',
    label: 'Editorial Line',
    desc: 'Minimal bottom border rule',
    icon: <Minus className="w-4 h-4" />,
  },
];

const ACCENT_PRESETS = [
  { name: 'Terracotta', hex: '#C85A32' },
  { name: 'Ochre Gold', hex: '#D49A3E' },
  { name: 'Deep Moss', hex: '#385842' },
  { name: 'Cobalt Slate', hex: '#4E78E6' },
  { name: 'Charcoal Ink', hex: '#1C1B18' },
  { name: 'Rose Clay', hex: '#B85338' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
}) => {
  const [selectedThemeId, setSelectedThemeId] = useState(profile.themeId);
  const [customAccent, setCustomAccent] = useState(profile.customAccentColor || '#C85A32');
  const [customHexInput, setCustomHexInput] = useState(profile.customAccentColor || '#C85A32');
  const [linkShape, setLinkShape] = useState<LinkShape>(profile.customLinkShape || 'rounded');
  const [activeSubSection, setActiveSubSection] = useState<
    'collection' | 'editor' | 'background' | 'motion' | 'elements'
  >('collection');

  // Design Family Filter and Creator State
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDesc, setNewFamilyDesc] = useState('');
  const [newFamilyFont, setNewFamilyFont] = useState<
    'serif-display' | 'serif-editorial' | 'mono-code' | 'sans-ui'
  >('serif-display');
  const [newFamilyBorder, setNewFamilyBorder] = useState<
    'sharp' | 'rounded' | 'brutalist' | 'paper' | 'double' | 'glass'
  >('rounded');
  const [newFamilyAccent, setNewFamilyAccent] = useState('#C85A32');
  const [newFamilyBg, setNewFamilyBg] = useState('#FAF8F5');

  const customFamilies: CustomDesignFamily[] = profile.customDesignFamilies || [];

  // Active theme helper
  const activeThemeObj: ThemeOption =
    profile.themeId === 'custom' && profile.customTheme
      ? profile.customTheme
      : EDITORIAL_THEMES.find((t) => t.id === profile.themeId) || EDITORIAL_THEMES[0];

  const handleCreateDesignFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) {
      onShowToast('Please enter a design family name');
      return;
    }

    const familyId = `family-${Date.now()}`;
    const newFamily: CustomDesignFamily = {
      id: familyId,
      name: newFamilyName.trim(),
      description: newFamilyDesc.trim() || 'User defined custom design family.',
      icon: 'sparkles',
      fontFamilyDisplay: newFamilyFont,
      borderStyle: newFamilyBorder,
      accentHex: newFamilyAccent,
      bgHex: newFamilyBg,
      cardStyle: 'bordered',
    };

    const updatedFamilies = [...customFamilies, newFamily];
    onChangeProfile({
      ...profile,
      customDesignFamilies: updatedFamilies,
    });

    setSelectedFamily(familyId);
    setIsAddFamilyModalOpen(false);
    setNewFamilyName('');
    setNewFamilyDesc('');
    onShowToast(`Created design family "${newFamily.name}"`);
  };

  const handleDeleteDesignFamily = (familyId: string, name: string) => {
    const updated = customFamilies.filter((f) => f.id !== familyId);
    onChangeProfile({
      ...profile,
      customDesignFamilies: updated,
    });
    if (selectedFamily === familyId) {
      setSelectedFamily('all');
    }
    onShowToast(`Removed design family "${name}"`);
  };

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    const themeObj = EDITORIAL_THEMES.find((t) => t.id === themeId);
    const updated: ConnProfile = {
      ...profile,
      themeId,
      customAccentColor: customAccent || themeObj?.accentHex,
      customLinkShape: linkShape,
    };
    onChangeProfile(updated);
    onShowToast(`Applied theme "${themeObj?.name || themeId}"`);
  };

  const handleApplyShape = (shape: LinkShape) => {
    setLinkShape(shape);
    onChangeProfile({
      ...profile,
      customLinkShape: shape,
    });
    onShowToast(`Updated link shape to ${shape}`);
  };

  const handleApplyAccent = (hex: string) => {
    setCustomAccent(hex);
    setCustomHexInput(hex);
    onChangeProfile({
      ...profile,
      customAccentColor: hex,
    });
    onShowToast(`Accent color updated to ${hex}`);
  };

  const handleCustomHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^#([0-9A-F]{3}){1,2}$/i.test(customHexInput)) {
      handleApplyAccent(customHexInput);
    } else {
      onShowToast('Please enter a valid hex color code (e.g. #C85A32)');
    }
  };

  const subSections = [
    { id: 'collection', label: 'Theme Presets', icon: Palette, color: 'text-[#C85A32]' },
    { id: 'editor', label: 'Colors & Typography', icon: Sliders, color: 'text-[#D49A3E]' },
    { id: 'background', label: 'Background Studio', icon: Sun, color: 'text-[#385842]' },
    { id: 'motion', label: 'Motion & Hover', icon: Zap, color: 'text-[#4E78E6]' },
    { id: 'elements', label: 'Elements & Layout', icon: Move, color: 'text-[#B85338]' },
  ] as const;

  return (
    <div className="space-y-8 font-sans-ui text-[#1C1B18]">
      {/* HEADER & SUB-STUDIO NAVIGATION */}
      <div className="space-y-4 pb-6 border-b border-[#E8E4D9]">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#1C1B18] text-[#FAF8F5] rounded-lg">
                <Palette className="w-4 h-4 text-[#D49A3E]" />
              </span>
              <h2 className="font-serif-display text-2xl font-normal text-[#1C1B18]">
                Appearance & Visual Design
              </h2>
            </div>
            <p className="text-xs text-[#6B665E] mt-1">
              Curate your page with bespoke editorial palettes, typography treatments, canvas backgrounds, and motion.
            </p>
          </div>

          {/* Current Active Theme Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E4D9] rounded-xl text-xs shadow-2xs shrink-0">
            <span
              className="w-3 h-3 rounded-full border border-black/10 shrink-0"
              style={{ backgroundColor: activeThemeObj.accentHex || activeThemeObj.bgHex }}
            />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono-code text-[#6B665E] leading-none">
                Active Theme
              </span>
              <span className="font-medium text-[#1C1B18] leading-tight">
                {profile.themeId === 'custom' ? 'Custom Studio' : activeThemeObj.name}
              </span>
            </div>
          </div>
        </div>

        {/* Studio Sub-Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-[#E8E4D9]/40 border border-[#E8E4D9] rounded-2xl scrollbar-none">
          {subSections.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSubSection(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-xs font-semibold'
                    : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FAF8F5]' : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW: CURATED PRESETS & THEMES COLLECTION */}
      {activeSubSection === 'collection' && (
        <div className="space-y-8">
          {/* ACTION TOOLBAR: FILTER PILLS & ACTION BUTTONS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Curated Editorial Palettes
                </label>
                <p className="text-[11px] text-[#6B665E]">
                  Select a theme preset designed around editorial typography and restrained aesthetics.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(true)}
                  className="px-3.5 py-2 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-[#1C1B18] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs hover:bg-[#FAF8F5]"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C85A32]" />
                  <span>Add Family</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubSection('editor')}
                  className="px-3.5 py-2 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#D49A3E]" />
                  <span>Custom Studio</span>
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {[
                { id: 'all', name: 'All Families', count: EDITORIAL_THEMES.length },
                { id: 'editorial', name: 'Editorial' },
                { id: 'studio', name: 'Studio' },
                { id: 'terminal', name: 'Terminal' },
                { id: 'paper', name: 'Paper' },
                { id: 'modernist', name: 'Modernist' },
              ].map((fam) => (
                <button
                  key={fam.id}
                  type="button"
                  onClick={() => setSelectedFamily(fam.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono-code transition-all ${
                    selectedFamily === fam.id
                      ? 'bg-[#1C1B18] text-[#FAF8F5] font-bold shadow-2xs'
                      : 'bg-white text-[#6B665E] hover:text-[#1C1B18] hover:border-[#1C1B18] border border-[#E8E4D9]'
                  }`}
                >
                  <span>{fam.name}</span>
                  {fam.count && <span className="ml-1.5 opacity-60">({fam.count})</span>}
                </button>
              ))}

              {/* Custom User Families */}
              {customFamilies.map((cf) => (
                <div key={cf.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setSelectedFamily(cf.id)}
                    className={`px-3 py-1.5 rounded-l-xl text-xs font-mono-code transition-all flex items-center gap-1.5 border-y border-l ${
                      selectedFamily === cf.id
                        ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] font-bold shadow-2xs'
                        : 'bg-white text-[#6B665E] hover:text-[#1C1B18] border-[#E8E4D9]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-[#D49A3E]" />
                    <span>{cf.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteDesignFamily(cf.id, cf.name)}
                    className="px-2 py-1.5 bg-white text-[#6B665E] hover:text-red-600 hover:bg-red-50 border border-[#E8E4D9] rounded-r-xl text-xs transition-colors"
                    title={`Delete ${cf.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* CUSTOM DESIGN FAMILY OVERVIEW CARD */}
          {selectedFamily !== 'all' && customFamilies.find((cf) => cf.id === selectedFamily) && (
            (() => {
              const cf = customFamilies.find((f) => f.id === selectedFamily)!;
              return (
                <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono-code font-bold text-[#C85A32] px-2 py-0.5 bg-[#C85A32]/10 rounded-md">
                        Custom Design Family
                      </span>
                      <h4 className="font-serif-display text-lg font-bold text-[#1C1B18]">{cf.name}</h4>
                    </div>
                    <p className="text-xs text-[#6B665E]">{cf.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono-code text-[#6B665E] pt-1">
                      <span>Typography: <strong className="text-[#1C1B18]">{cf.fontFamilyDisplay}</strong></span>
                      <span>•</span>
                      <span>Geometry: <strong className="text-[#1C1B18]">{cf.borderStyle}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Accent: <span className="w-2.5 h-2.5 rounded-full inline-block border border-black/10" style={{ backgroundColor: cf.accentHex }} />
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onChangeProfile({
                          ...profile,
                          customAccentColor: cf.accentHex,
                          customLinkShape: cf.borderStyle === 'sharp' ? 'sharp' : 'rounded',
                        });
                        onShowToast(`Applied ${cf.name} styling defaults`);
                      }}
                      className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-medium transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-[#D49A3E]" />
                      <span>Apply Family Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDesignFamily(cf.id, cf.name)}
                      className="p-2 border border-[#E8E4D9] hover:border-red-300 text-[#6B665E] hover:text-red-600 rounded-xl text-xs transition-colors"
                      title="Delete Family"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()
          )}

          {/* THEMES CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
            {EDITORIAL_THEMES.filter((t) => {
              if (selectedFamily === 'all') return true;
              return t.themeFamily === selectedFamily;
            }).map((theme) => {
              const isSelected = selectedThemeId === theme.id && profile.themeId !== 'custom';
              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`group cursor-pointer p-5 border rounded-2xl transition-all duration-300 relative flex flex-col justify-between ${
                    isSelected
                      ? 'ring-2 ring-[#1C1B18] shadow-md border-transparent scale-[1.01]'
                      : 'border-[#E8E4D9] hover:border-[#1C1B18] hover:shadow-xs'
                  }`}
                  style={{
                    backgroundColor: theme.bgHex,
                    color: theme.textHex,
                  }}
                >
                  {/* Top Bar inside Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span
                          className="text-[9px] uppercase font-mono-code tracking-wider px-2 py-0.5 rounded-full border opacity-75 inline-block mb-1.5"
                          style={{ borderColor: theme.borderHex, color: theme.mutedHex }}
                        >
                          {theme.themeFamily}
                        </span>
                        <h3
                          className={`text-xl font-normal tracking-tight ${
                            theme.fontFamilyDisplay === 'serif-editorial'
                              ? 'font-serif-editorial'
                              : theme.fontFamilyDisplay === 'mono-code'
                              ? 'font-mono-code'
                              : 'font-serif-display'
                          }`}
                        >
                          {theme.name}
                        </h3>
                      </div>

                      {isSelected ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#1C1B18] text-[#FAF8F5] text-[10px] font-mono-code font-bold flex items-center gap-1 shrink-0 shadow-2xs">
                          <Check className="w-3 h-3 text-[#D49A3E]" /> Active
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectTheme(theme.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity px-2.5 py-1 rounded-lg border text-[10px] font-medium shrink-0 bg-white/80 hover:bg-white text-[#1C1B18]"
                          style={{ borderColor: theme.borderHex }}
                        >
                          Apply
                        </button>
                      )}
                    </div>

                    <p className="text-xs leading-relaxed opacity-75 mb-4 line-clamp-2">
                      {theme.description}
                    </p>

                    {/* Micro Preview Card */}
                    <div
                      className="p-3 border rounded-xl text-xs space-y-1.5 opacity-95 transition-transform group-hover:scale-[1.01]"
                      style={{
                        backgroundColor: theme.cardBgHex,
                        borderColor: theme.borderHex,
                        borderRadius: theme.linkShape === 'sharp' ? '4px' : theme.linkShape === 'pill' ? '9999px' : '10px',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[11px] truncate">On Digital Quietude Essay</span>
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: theme.accentHex }}
                        />
                      </div>
                      <div className="h-1 w-2/3 rounded opacity-25 bg-current" />
                    </div>
                  </div>

                  {/* Bottom Metadata & Color Swatches */}
                  <div
                    className="mt-4 pt-3.5 border-t flex items-center justify-between text-[10px] font-mono-code opacity-70"
                    style={{ borderColor: theme.borderHex }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{theme.linkShape}</span>
                      <span>&bull;</span>
                      <span className="truncate max-w-[90px]">{theme.fontFamilyDisplay}</span>
                    </div>

                    {/* 4 Swatches */}
                    <div className="flex items-center gap-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        title="Canvas Background"
                        style={{ backgroundColor: theme.bgHex }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        title="Card Background"
                        style={{ backgroundColor: theme.cardBgHex }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        title="Accent Color"
                        style={{ backgroundColor: theme.accentHex }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/10"
                        title="Text Color"
                        style={{ backgroundColor: theme.textHex }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LINK GEOMETRY & CARD TREATMENT SECTION */}
          <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Link Treatment & Card Geometry
                </label>
                <p className="text-[11px] text-[#6B665E]">
                  Control corner radii and structural silhouettes for all link blocks across your space.
                </p>
              </div>
              <span className="text-[10px] font-mono-code text-[#6B665E] uppercase px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-md shrink-0">
                Active: {(profile.customLinkShape || linkShape).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {SHAPE_OPTIONS.map((shape) => {
                const active = (profile.customLinkShape || linkShape) === shape.id;
                return (
                  <button
                    type="button"
                    key={shape.id}
                    onClick={() => handleApplyShape(shape.id)}
                    className={`p-4 border rounded-xl text-left transition-all relative flex flex-col justify-between ${
                      active
                        ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] shadow-xs'
                        : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#1C1B18] hover:border-[#1C1B18] hover:bg-white'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`p-1 rounded ${active ? 'text-[#D49A3E]' : 'text-[#6B665E]'}`}>
                          {shape.icon}
                        </span>
                        {active && <Check className="w-3.5 h-3.5 text-[#D49A3E]" />}
                      </div>
                      <div className="text-xs font-medium mb-1">{shape.label}</div>
                    </div>
                    <div className={`text-[10px] ${active ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>
                      {shape.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESTRAINED ACCENT PALETTE SECTION */}
          <div className="p-6 bg-white border border-[#E8E4D9] rounded-2xl space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Restrained Accent Palette
                </label>
                <p className="text-[11px] text-[#6B665E]">
                  Select an editorial accent hue or configure a custom hex color.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: customAccent }}
                />
                <span className="text-[10px] font-mono-code text-[#6B665E] uppercase">
                  {customAccent}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {ACCENT_PRESETS.map((acc, idx) => {
                const isActive = customAccent.toLowerCase() === acc.hex.toLowerCase();
                return (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleApplyAccent(acc.hex)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all border ${
                      isActive
                        ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#1C1B18] border-[#E8E4D9] hover:border-[#1C1B18] hover:bg-white'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: acc.hex }}
                    />
                    <span>{acc.name}</span>
                    {isActive && <Check className="w-3 h-3 text-[#D49A3E] ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Hex Input Form */}
            <form onSubmit={handleCustomHexSubmit} className="pt-3 border-t border-[#E8E4D9] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <div className="relative flex items-center">
                  <input
                    type="color"
                    value={customHexInput}
                    onChange={(e) => {
                      setCustomHexInput(e.target.value);
                      handleApplyAccent(e.target.value);
                    }}
                    className="w-9 h-9 rounded-xl border border-[#E8E4D9] cursor-pointer p-0.5 bg-white shrink-0"
                    title="Pick custom color"
                  />
                </div>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customHexInput}
                    onChange={(e) => setCustomHexInput(e.target.value)}
                    placeholder="#C85A32"
                    className="w-full px-3 py-2 border border-[#E8E4D9] rounded-xl text-xs font-mono-code text-[#1C1B18] bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1C1B18]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-medium transition-all shadow-2xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <Pipette className="w-3.5 h-3.5 text-[#D49A3E]" />
                <span>Apply Custom Hex</span>
              </button>
            </form>
          </div>

          {/* ADVANCED DESIGN STUDIOS JUMP SECTION */}
          <div className="pt-2">
            <label className="block text-xs font-mono-code uppercase font-bold text-[#6B665E] mb-3">
              Deep Customization Studios
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setActiveSubSection('editor')}
                className="p-4 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-2xl text-left transition-all group shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center text-[#D49A3E] group-hover:bg-[#1C1B18] group-hover:text-white transition-colors">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1C1B18]">Colors & Typography Studio</div>
                    <div className="text-[10px] text-[#6B665E]">Contrast score, fonts, and custom palettes</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B665E] group-hover:text-[#1C1B18] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubSection('background')}
                className="p-4 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-2xl text-left transition-all group shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center text-[#385842] group-hover:bg-[#1C1B18] group-hover:text-white transition-colors">
                    <Sun className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1C1B18]">Background Studio</div>
                    <div className="text-[10px] text-[#6B665E]">Paper grain, ambient mesh, and gradients</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B665E] group-hover:text-[#1C1B18] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubSection('motion')}
                className="p-4 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-2xl text-left transition-all group shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center text-[#4E78E6] group-hover:bg-[#1C1B18] group-hover:text-white transition-colors">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1C1B18]">Motion & Hover Studio</div>
                    <div className="text-[10px] text-[#6B665E]">Micro-interactions, float, and hover lifts</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B665E] group-hover:text-[#1C1B18] group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => setActiveSubSection('elements')}
                className="p-4 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-2xl text-left transition-all group shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center text-[#B85338] group-hover:bg-[#1C1B18] group-hover:text-white transition-colors">
                    <Move className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-[#1C1B18]">Elements & Positioning Studio</div>
                    <div className="text-[10px] text-[#6B665E]">Alignment, decorative objects, and spacing</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#6B665E] group-hover:text-[#1C1B18] group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: THEME CUSTOMIZATION BUILDER */}
      {activeSubSection === 'editor' && (
        <ThemeEditor profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

      {/* VIEW: BACKGROUND STUDIO */}
      {activeSubSection === 'background' && (
        <BackgroundStudio profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

      {/* VIEW: MOTION & HOVER STUDIO */}
      {activeSubSection === 'motion' && (
        <MotionStudio profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

      {/* VIEW: ELEMENTS & POSITIONING STUDIO */}
      {activeSubSection === 'elements' && (
        <ElementPositionStudio profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

      {/* ADD DESIGN FAMILY MODAL */}
      {isAddFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E4D9] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-[#C85A32]" />
                <h3 className="font-serif-display text-lg font-bold text-[#1C1B18]">
                  Add Custom Design Family
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFamilyModalOpen(false)}
                className="p-1 text-[#6B665E] hover:text-[#1C1B18] rounded-lg hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDesignFamily} className="space-y-4 text-xs font-sans-ui">
              <div>
                <label className="block font-mono-code font-bold uppercase text-[10px] text-[#1C1B18] mb-1">
                  Family Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nordic Architecture, Cyber Monospace, Swiss Minimal"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full p-2.5 border border-[#E8E4D9] rounded-xl text-xs bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1C1B18]"
                />
              </div>

              <div>
                <label className="block font-mono-code font-bold uppercase text-[10px] text-[#1C1B18] mb-1">
                  Aesthetic Philosophy & Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe the typography rules, spacing geometry, and tone..."
                  value={newFamilyDesc}
                  onChange={(e) => setNewFamilyDesc(e.target.value)}
                  className="w-full p-2.5 border border-[#E8E4D9] rounded-xl text-xs bg-[#FAF8F5] focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#1C1B18]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-code font-bold uppercase text-[10px] text-[#1C1B18] mb-1">
                    Display Typography
                  </label>
                  <select
                    value={newFamilyFont}
                    onChange={(e) => setNewFamilyFont(e.target.value as any)}
                    className="w-full p-2 border border-[#E8E4D9] rounded-xl text-xs bg-white"
                  >
                    <option value="serif-display">Editorial Serif (Newsreader)</option>
                    <option value="serif-editorial">Literary Serif (Playfair)</option>
                    <option value="mono-code">Technical Monospace (JetBrains)</option>
                    <option value="sans-ui">Modern Clean Sans (Plus Jakarta)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-mono-code font-bold uppercase text-[10px] text-[#1C1B18] mb-1">
                    Geometry & Corners
                  </label>
                  <select
                    value={newFamilyBorder}
                    onChange={(e) => setNewFamilyBorder(e.target.value as any)}
                    className="w-full p-2 border border-[#E8E4D9] rounded-xl text-xs bg-white"
                  >
                    <option value="rounded">Soft Radius (12px)</option>
                    <option value="sharp">Sharp Architectural (0px)</option>
                    <option value="brutalist">Thick Brutalist Outline</option>
                    <option value="paper">Fine Paper Edge</option>
                    <option value="glass">Subtle Frosted Glass</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono-code font-bold uppercase text-[10px] text-[#1C1B18] mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFamilyAccent}
                      onChange={(e) => setNewFamilyAccent(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#E8E4D9] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={newFamilyAccent}
                      onChange={(e) => setNewFamilyAccent(e.target.value)}
                      className="w-full p-2 border border-[#E8E4D9] rounded-xl font-mono-code text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono-code font-bold uppercase text-[10px] text-[#1C1B18] mb-1">
                    Canvas Background
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newFamilyBg}
                      onChange={(e) => setNewFamilyBg(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-[#E8E4D9] cursor-pointer p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={newFamilyBg}
                      onChange={(e) => setNewFamilyBg(e.target.value)}
                      className="w-full p-2 border border-[#E8E4D9] rounded-xl font-mono-code text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Family Style Preview Box */}
              <div
                className="p-3.5 border rounded-xl space-y-1.5 transition-all"
                style={{
                  backgroundColor: newFamilyBg,
                  borderColor: newFamilyAccent,
                  borderRadius: newFamilyBorder === 'sharp' ? '0px' : newFamilyBorder === 'brutalist' ? '2px' : '12px',
                }}
              >
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span style={{ color: newFamilyAccent }}>Preview Component</span>
                  <span className="text-[10px] font-mono-code opacity-70">Design Family Spec</span>
                </div>
                <div className="text-xs text-black/80 font-serif-display">
                  {newFamilyName || 'Sample Title for This Design Family'}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] rounded-xl hover:bg-black/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] rounded-xl text-xs font-bold hover:bg-[#33312B] transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#D49A3E]" />
                  <span>Create Design Family</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
