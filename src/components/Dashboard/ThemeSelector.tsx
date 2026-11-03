import React, { useState } from 'react';
import { ConnProfile, LinkShape, CustomDesignFamily } from '../../types';
import { EDITORIAL_THEMES } from '../../data/themes';
import { ThemeEditor } from './ThemeEditor';
import { BackgroundStudio } from './BackgroundStudio';
import { MotionStudio } from './MotionStudio';
import { ElementPositionStudio } from './ElementPositionStudio';
import { Check, Sparkles, Sliders, Palette, Sun, Zap, Move, Plus, Trash2, X, FolderPlus } from 'lucide-react';

interface ThemeSelectorProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

const SHAPE_OPTIONS: { id: LinkShape; label: string; desc: string }[] = [
  { id: 'sharp', label: 'Sharp Corner', desc: '0px radius, clean architectural grid' },
  { id: 'rounded', label: 'Soft Radius', desc: '12px subtle rounded corners' },
  { id: 'pill', label: 'Pill Shape', desc: 'Full stadium curve' },
  { id: 'underline', label: 'Editorial Line', desc: 'Minimal bottom border rule' },
];

const ACCENT_PRESETS = [
  { name: 'Terracotta', hex: '#C85A32' },
  { name: 'Ochre Gold', hex: '#D49A3E' },
  { name: 'Deep Moss', hex: '#385842' },
  { name: 'Cobalt Slate', hex: '#4E78E6' },
  { name: 'Charcoal Ink', hex: '#1C1B18' },
  { name: 'Rose Clay', hex: '#B85338' },
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ profile, onChangeProfile, onShowToast }) => {
  const [selectedThemeId, setSelectedThemeId] = useState(profile.themeId);
  const [customAccent, setCustomAccent] = useState(profile.customAccentColor || '');
  const [linkShape, setLinkShape] = useState<LinkShape>(profile.customLinkShape || 'sharp');
  const [activeSubSection, setActiveSubSection] = useState<'collection' | 'editor' | 'background' | 'motion' | 'elements'>('collection');

  // Sync with profile prop updates
  React.useEffect(() => {
    setSelectedThemeId(profile.themeId);
    setCustomAccent(profile.customAccentColor || '');
    setLinkShape(profile.customLinkShape || 'sharp');
  }, [profile.themeId, profile.customAccentColor, profile.customLinkShape]);

  // Design Family Filter and Creator State
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyDesc, setNewFamilyDesc] = useState('');
  const [newFamilyFont, setNewFamilyFont] = useState<'serif-display' | 'serif-editorial' | 'mono-code' | 'sans-ui'>('serif-display');
  const [newFamilyBorder, setNewFamilyBorder] = useState<'sharp' | 'rounded' | 'brutalist' | 'paper' | 'double' | 'glass'>('rounded');
  const [newFamilyAccent, setNewFamilyAccent] = useState('#C85A32');
  const [newFamilyBg, setNewFamilyBg] = useState('#FAF8F5');

  const customFamilies: CustomDesignFamily[] = profile.customDesignFamilies || [];

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
    onChangeProfile({
      ...profile,
      customAccentColor: hex,
    });
    onShowToast('Accent color updated');
  };

  return (
    <div className="space-y-8 font-sans-ui text-[#1C1B18]">
      {/* Header & Sub-section Switcher */}
      <div className="pb-4 border-b border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Appearance & Editorial Identity</h2>
          <p className="text-xs text-[#6B665E]">
            Select from our 12 curated themes or design bespoke colors using the Theme Studio.
          </p>
        </div>

        {/* Sub-section Switcher Tabs */}
        <div className="flex flex-wrap bg-[#E8E4D9]/50 p-1 rounded-xl shrink-0 gap-1">
          <button
            onClick={() => setActiveSubSection('collection')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubSection === 'collection'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Themes</span>
          </button>
          <button
            onClick={() => setActiveSubSection('editor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubSection === 'editor'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-[#D49A3E]" />
            <span>Colors & Fonts</span>
          </button>
          <button
            onClick={() => setActiveSubSection('background')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubSection === 'background'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#385842]" />
            <span>Background</span>
          </button>
          <button
            onClick={() => setActiveSubSection('motion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubSection === 'motion'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#4E78E6]" />
            <span>Motion & Hover</span>
          </button>
          <button
            onClick={() => setActiveSubSection('elements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeSubSection === 'elements'
                ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                : 'text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            <Move className="w-3.5 h-3.5 text-[#B85338]" />
            <span>Elements & Positioning</span>
          </button>
        </div>
      </div>

      {activeSubSection === 'collection' && (
        <>
          {/* CURATED EDITORIAL THEMES GRID & DESIGN FAMILY SELECTOR */}
          <div>
            {/* DESIGN FAMILY TABS & ADD BUTTON */}
            <div className="mb-6 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                    Design Families & Aesthetics
                  </label>
                  <p className="text-xs text-[#6B665E]">
                    Filter presets by typography and structural philosophy, or create your own bespoke family.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFamilyModalOpen(true)}
                    className="px-3 py-1.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all shadow-2xs shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D49A3E]" />
                    <span>Add Design Family</span>
                  </button>

                  <button
                    onClick={() => setActiveSubSection('editor')}
                    className="text-xs font-medium text-[#C85A32] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <Sliders className="w-3 h-3" />
                    <span>Theme Studio</span>
                  </button>
                </div>
              </div>

              {/* Family Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {[
                  { id: 'all', name: 'All Families' },
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
                      selectedFamily === fam.id
                        ? 'bg-[#1C1B18] text-[#FAF8F5] font-bold shadow-2xs'
                        : 'bg-[#FAF8F5] text-[#6B665E] hover:bg-[#E8E4D9] border border-[#E8E4D9]'
                    }`}
                  >
                    {fam.name}
                  </button>
                ))}

                {/* Custom Families */}
                {customFamilies.map((cf) => (
                  <div key={cf.id} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setSelectedFamily(cf.id)}
                      className={`px-3 py-1.5 rounded-l-lg text-xs font-mono-code transition-all flex items-center gap-1.5 border-y border-l ${
                        selectedFamily === cf.id
                          ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] font-bold shadow-2xs'
                          : 'bg-[#FAF8F5] text-[#6B665E] hover:bg-[#E8E4D9] border-[#E8E4D9]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#D49A3E]" />
                      <span>{cf.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteDesignFamily(cf.id, cf.name)}
                      className="px-1.5 py-1.5 bg-[#FAF8F5] text-red-600 hover:bg-red-50 border border-[#E8E4D9] rounded-r-lg text-xs transition-colors"
                      title={`Delete ${cf.name}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* If a custom family is selected, show its overview card */}
            {selectedFamily !== 'all' && customFamilies.find((cf) => cf.id === selectedFamily) && (
              (() => {
                const cf = customFamilies.find((f) => f.id === selectedFamily)!;
                return (
                  <div className="mb-6 p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase font-mono-code font-bold text-[#C85A32]">Custom Family</span>
                        <h4 className="font-serif-display text-lg font-bold text-[#1C1B18]">{cf.name}</h4>
                      </div>
                      <p className="text-xs text-[#6B665E] mt-0.5">{cf.description}</p>
                      <div className="flex items-center gap-3 text-xs font-mono-code text-[#6B665E] mt-2">
                        <span>Font: <strong>{cf.fontFamilyDisplay}</strong></span>
                        <span>•</span>
                        <span>Border: <strong>{cf.borderStyle}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          Accent: <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cf.accentHex }} />
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onChangeProfile({
                          ...profile,
                          customAccentColor: cf.accentHex,
                          customLinkShape: cf.borderStyle === 'sharp' ? 'sharp' : 'rounded',
                        });
                        onShowToast(`Applied ${cf.name} design family styling`);
                      }}
                      className="px-3.5 py-2 bg-[#1C1B18] text-white rounded-xl text-xs font-bold hover:bg-[#33312B] transition-colors shrink-0"
                    >
                      Apply Family Defaults
                    </button>
                  </div>
                );
              })()
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EDITORIAL_THEMES.filter((t) => {
                if (selectedFamily === 'all') return true;
                return t.themeFamily === selectedFamily;
              }).map((theme) => {
                const isSelected = selectedThemeId === theme.id && profile.themeId !== 'custom';
                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`group cursor-pointer p-5 border rounded-2xl transition-all duration-300 relative ${
                      isSelected
                        ? 'ring-2 ring-[#1C1B18] shadow-md border-transparent scale-[1.01]'
                        : 'border-[#E8E4D9] hover:border-[#1C1B18]'
                    }`}
                    style={{
                      backgroundColor: theme.bgHex,
                      color: theme.textHex,
                    }}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 p-1 rounded-full bg-[#1C1B18] text-[#FAF8F5]">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div className="mb-4">
                      <h3
                        className={`text-xl font-normal tracking-tight mb-1 ${
                          theme.fontFamilyDisplay === 'serif-editorial'
                            ? 'font-serif-editorial'
                            : theme.fontFamilyDisplay === 'mono-code'
                            ? 'font-mono-code'
                            : 'font-serif-display'
                        }`}
                      >
                        {theme.name}
                      </h3>
                      <p className="text-xs leading-relaxed opacity-80 max-w-xs">{theme.description}</p>
                    </div>

                    {/* Micro preview card */}
                    <div
                      className="p-3 border rounded-lg text-xs space-y-2 opacity-90"
                      style={{ backgroundColor: theme.cardBgHex, borderColor: theme.borderHex }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">On Digital Quietude</span>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.accentHex }} />
                      </div>
                      <div className="h-1.5 w-3/4 rounded opacity-20 bg-current" />
                    </div>

                    <div className="mt-4 flex items-center justify-between text-2xs font-mono-code opacity-60 pt-3 border-t border-current/10">
                      <span className="capitalize">{theme.linkShape} Links</span>
                      <span>{theme.fontFamilyDisplay}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LINK CARD SHAPES */}
          <div className="pt-6 border-t border-[#E8E4D9]">
            <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-3">
              Link Treatment & Geometry
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SHAPE_OPTIONS.map((shape) => {
                const active = (profile.customLinkShape || linkShape) === shape.id;
                return (
                  <button
                    type="button"
                    key={shape.id}
                    onClick={() => handleApplyShape(shape.id)}
                    className={`p-4 border rounded-xl text-left transition-all ${
                      active ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]' : 'bg-white border-[#E8E4D9] hover:border-[#1C1B18]'
                    }`}
                  >
                    <div className="text-xs font-medium mb-1">{shape.label}</div>
                    <div className={`text-2xs ${active ? 'text-[#FAF8F5]/70' : 'text-[#6B665E]'}`}>{shape.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RESTRAINED ACCENT COLOR */}
          <div className="pt-6 border-t border-[#E8E4D9]">
            <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-3">
              Restrained Accent Palette
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {ACCENT_PRESETS.map((acc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleApplyAccent(acc.hex)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-medium transition-all"
                >
                  <span className="w-3.5 h-3.5 rounded-full border border-black/10" style={{ backgroundColor: acc.hex }} />
                  <span>{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {activeSubSection === 'editor' && (
        <ThemeEditor profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

      {activeSubSection === 'background' && (
        <BackgroundStudio profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

      {activeSubSection === 'motion' && (
        <MotionStudio profile={profile} onChangeProfile={onChangeProfile} onShowToast={onShowToast} />
      )}

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
                <label className="block font-mono-code font-bold uppercase text-2xs text-[#1C1B18] mb-1">
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
                <label className="block font-mono-code font-bold uppercase text-2xs text-[#1C1B18] mb-1">
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
                  <label className="block font-mono-code font-bold uppercase text-2xs text-[#1C1B18] mb-1">
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
                  <label className="block font-mono-code font-bold uppercase text-2xs text-[#1C1B18] mb-1">
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
                  <label className="block font-mono-code font-bold uppercase text-2xs text-[#1C1B18] mb-1">
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
                  <label className="block font-mono-code font-bold uppercase text-2xs text-[#1C1B18] mb-1">
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
                <div className="flex items-center justify-between text-xs font-bold">
                  <span style={{ color: newFamilyAccent }}>Preview Component</span>
                  <span className="text-2xs font-mono-code opacity-70">Design Family Spec</span>
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
                  className="px-4 py-2 bg-[#1C1B18] text-white rounded-xl text-xs font-bold hover:bg-[#33312B] transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
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
