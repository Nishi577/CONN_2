import React, { useState } from 'react';
import { ConnProfile, ThemeOption, LinkShape } from '../../types';
import {
  Palette,
  Eye,
  Check,
  Sparkles,
  Sliders,
  Type,
  Layout,
  Info,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Trash2,
  Bookmark,
  Sun,
  Moon,
  Zap,
} from 'lucide-react';

interface ThemeEditorProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

// Swatch Palettes
const SWATCH_BG = [
  { name: 'Warm Stone', hex: '#FAF8F5' },
  { name: 'Studio Obsidian', hex: '#121110' },
  { name: 'Sage Organic', hex: '#F2F4F0' },
  { name: 'Matcha Tea', hex: '#F3F5ED' },
  { name: 'Lavender Mist', hex: '#F5F3F8' },
  { name: 'Espresso Coffee', hex: '#181412' },
  { name: 'Solar Amber', hex: '#FAF5EA' },
  { name: 'Slate Midnight', hex: '#171C24' },
  { name: 'Terracotta Sand', hex: '#F8F4EE' },
  { name: 'Crisp White', hex: '#FFFFFF' },
];

const SWATCH_TEXT = [
  { name: 'Charcoal Ink', hex: '#1C1B18' },
  { name: 'Warm Ivory', hex: '#F2EFE9' },
  { name: 'Forest Pine', hex: '#1A2920' },
  { name: 'Olive Dark', hex: '#1E281A' },
  { name: 'Plum Twilight', hex: '#231C2E' },
  { name: 'Arctic Ice', hex: '#E2E8F0' },
  { name: 'Pure Black', hex: '#000000' },
];

const SWATCH_ACCENT = [
  { name: 'Terracotta Rust', hex: '#C85A32' },
  { name: 'Amber Ochre', hex: '#D49A3E' },
  { name: 'Deep Moss', hex: '#385842' },
  { name: 'Matcha Olive', hex: '#556B2F' },
  { name: 'Twilight Violet', hex: '#7B52AB' },
  { name: 'Warm Mahogany', hex: '#C87D53' },
  { name: 'Slate Cobalt', hex: '#4E78E6' },
  { name: 'Electric Blue', hex: '#2563EB' },
  { name: 'Emerald', hex: '#059669' },
  { name: 'Rose Clay', hex: '#B85338' },
];

function hexToRgb(hex: string) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 255, g: 255, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(r: number, g: number, b: number) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(l1, l2);
  const darkest = Math.min(l1, l2);
  return (brightest + 0.05) / (darkest + 0.05);
}

export const ThemeEditor: React.FC<ThemeEditorProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
}) => {
  const savedThemes: ThemeOption[] = profile.savedCustomThemes || [];

  const initialTheme: ThemeOption = profile.customTheme || {
    id: 'custom-1',
    name: 'Atelier Gold Custom',
    description: 'Bespoke custom theme.',
    bgClass: '',
    bgHex: '#FAF8F5',
    textHex: '#1C1B18',
    mutedHex: '#6B665E',
    borderHex: '#E8E4D9',
    accentHex: '#C85A32',
    cardBgHex: '#FFFFFF',
    fontFamilyDisplay: 'serif-display',
    fontFamilyBody: 'sans-ui',
    linkShape: 'rounded',
    showNoiseGrain: true,
    fontSize: 'md',
    buttonStyle: 'solid',
    cardStyle: 'bordered',
    borderRadius: 12,
    shadowIntensity: 'soft',
    animationsEnabled: true,
    profileLayout: 'centered',
    mode: 'light',
    useGradientBg: false,
    gradientBgHex: '#E8E4D9',
  };

  const [selectedSavedId, setSelectedSavedId] = useState<string>('');
  const [themeName, setThemeName] = useState(initialTheme.name || 'My Bespoke Theme');
  const [bgHex, setBgHex] = useState(initialTheme.bgHex || '#FAF8F5');
  const [textHex, setTextHex] = useState(initialTheme.textHex || '#1C1B18');
  const [mutedHex, setMutedHex] = useState(initialTheme.mutedHex || '#6B665E');
  const [accentHex, setAccentHex] = useState(initialTheme.accentHex || '#C85A32');
  const [cardBgHex, setCardBgHex] = useState(initialTheme.cardBgHex || '#FFFFFF');
  const [borderHex, setBorderHex] = useState(initialTheme.borderHex || '#E8E4D9');
  
  // Extended state
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(initialTheme.fontSize || 'md');
  const [buttonStyle, setButtonStyle] = useState<'solid' | 'outline' | 'soft' | 'ghost'>(
    initialTheme.buttonStyle || 'solid'
  );
  const [cardStyle, setCardStyle] = useState<'flat' | 'bordered' | 'elevated' | 'glass'>(
    initialTheme.cardStyle || 'bordered'
  );
  const [borderRadius, setBorderRadius] = useState<number>(initialTheme.borderRadius ?? 12);
  const [shadowIntensity, setShadowIntensity] = useState<'none' | 'soft' | 'crisp' | 'heavy'>(
    initialTheme.shadowIntensity || 'soft'
  );
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(
    initialTheme.animationsEnabled ?? true
  );
  const [profileLayout, setProfileLayout] = useState<'centered' | 'left' | 'compact'>(
    initialTheme.profileLayout || 'centered'
  );
  const [mode, setMode] = useState<'light' | 'dark'>(initialTheme.mode || 'light');
  const [useGradientBg, setUseGradientBg] = useState<boolean>(initialTheme.useGradientBg ?? false);
  const [gradientBgHex, setGradientBgHex] = useState<string>(
    initialTheme.gradientBgHex || '#E8E4D9'
  );
  const [displayFont, setDisplayFont] = useState<ThemeOption['fontFamilyDisplay']>(
    initialTheme.fontFamilyDisplay || 'serif-display'
  );
  const [linkShape, setLinkShape] = useState<LinkShape>(
    profile.customLinkShape || initialTheme.linkShape || 'rounded'
  );
  const [showNoiseGrain, setShowNoiseGrain] = useState(initialTheme.showNoiseGrain ?? true);

  const [isPreviewHovered, setIsPreviewHovered] = useState(false);

  // Auto calculate contrast ratio
  const contrastRatio = getContrastRatio(bgHex, textHex);

  const getContrastStatus = (ratio: number) => {
    if (ratio >= 7) return { label: 'AAA Pass (Optimal)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (ratio >= 4.5) return { label: 'AA Pass (Good)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    return { label: 'Low Contrast Warning', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  };

  const contrastStatus = getContrastStatus(contrastRatio);

  const handleModeSwitch = (newMode: 'light' | 'dark') => {
    setMode(newMode);
    if (newMode === 'dark') {
      setBgHex('#121110');
      setTextHex('#FAF8F5');
      setMutedHex('#9C978E');
      setBorderHex('#2B2824');
      setCardBgHex('#1A1917');
      setGradientBgHex('#1E1C1A');
    } else {
      setBgHex('#FAF8F5');
      setTextHex('#1C1B18');
      setMutedHex('#6B665E');
      setBorderHex('#E8E4D9');
      setCardBgHex('#FFFFFF');
      setGradientBgHex('#E8E4D9');
    }
  };

  const buildCurrentThemeObj = (): ThemeOption => ({
    id: selectedSavedId || `custom-${Date.now()}`,
    name: themeName || 'Bespoke Theme',
    description: 'Custom palette created with Theme Builder Studio.',
    themeFamily: 'editorial',
    bgClass: '',
    bgHex,
    textHex,
    mutedHex,
    borderHex,
    accentHex,
    cardBgHex,
    fontFamilyDisplay: displayFont,
    fontFamilyBody: 'sans-ui',
    linkShape,
    showNoiseGrain,
    primaryColor: textHex,
    secondaryColor: mutedHex,
    fontSize,
    buttonStyle,
    cardStyle,
    borderRadius,
    shadowIntensity,
    animationsEnabled,
    profileLayout,
    mode,
    useGradientBg,
    gradientBgHex,
  });

  const handleApplyCustomTheme = () => {
    const customThemeObj = buildCurrentThemeObj();

    const updatedProfile: ConnProfile = {
      ...profile,
      themeId: 'custom',
      customTheme: customThemeObj,
      customAccentColor: accentHex,
      customLinkShape: linkShape,
    };

    onChangeProfile(updatedProfile);
    onShowToast(`Applied theme "${customThemeObj.name}" to public profile!`);
  };

  const handleSaveToSavedThemes = () => {
    const currentObj = buildCurrentThemeObj();
    const existingIndex = savedThemes.findIndex((t) => t.id === currentObj.id || t.name === currentObj.name);

    let updatedSaved: ThemeOption[];
    if (existingIndex >= 0) {
      updatedSaved = [...savedThemes];
      updatedSaved[existingIndex] = currentObj;
    } else {
      updatedSaved = [currentObj, ...savedThemes];
    }

    const updatedProfile: ConnProfile = {
      ...profile,
      themeId: 'custom',
      customTheme: currentObj,
      customAccentColor: accentHex,
      customLinkShape: linkShape,
      savedCustomThemes: updatedSaved,
    };

    setSelectedSavedId(currentObj.id);
    onChangeProfile(updatedProfile);
    onShowToast(`Saved "${currentObj.name}" to custom theme library!`);
  };

  const handleLoadSavedTheme = (theme: ThemeOption) => {
    setSelectedSavedId(theme.id);
    setThemeName(theme.name);
    setBgHex(theme.bgHex);
    setTextHex(theme.textHex);
    setMutedHex(theme.mutedHex);
    setAccentHex(theme.accentHex);
    setCardBgHex(theme.cardBgHex);
    setBorderHex(theme.borderHex);
    setDisplayFont(theme.fontFamilyDisplay);
    setLinkShape(theme.linkShape);
    setShowNoiseGrain(theme.showNoiseGrain ?? true);
    setFontSize(theme.fontSize || 'md');
    setButtonStyle(theme.buttonStyle || 'solid');
    setCardStyle(theme.cardStyle || 'bordered');
    setBorderRadius(theme.borderRadius ?? 12);
    setShadowIntensity(theme.shadowIntensity || 'soft');
    setAnimationsEnabled(theme.animationsEnabled ?? true);
    setProfileLayout(theme.profileLayout || 'centered');
    setMode(theme.mode || 'light');
    setUseGradientBg(theme.useGradientBg ?? false);
    setGradientBgHex(theme.gradientBgHex || '#E8E4D9');

    onShowToast(`Loaded custom theme "${theme.name}"`);
  };

  const handleDeleteSavedTheme = (id: string, name: string) => {
    const updatedSaved = savedThemes.filter((t) => t.id !== id);
    onChangeProfile({
      ...profile,
      savedCustomThemes: updatedSaved,
    });
    if (selectedSavedId === id) {
      setSelectedSavedId('');
    }
    onShowToast(`Deleted custom theme "${name}"`);
  };

  const displayFontClass =
    displayFont === 'serif-editorial'
      ? 'font-serif-editorial'
      : displayFont === 'mono-code'
      ? 'font-mono-code'
      : 'font-serif-display';

  return (
    <div className="bg-white border border-[#E8E4D9] rounded-2xl p-6 sm:p-8 space-y-8 text-[#1C1B18] shadow-xs font-sans-ui">
      {/* Editor Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#1C1B18] text-[#FAF8F5] rounded-lg">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="font-serif-display text-2xl font-normal">Theme Customization Builder</h3>
          </div>
          <p className="text-xs text-[#6B665E]">
            Configure custom colors, typography, card shapes, shadows, and layout. Real-time preview & saved library included.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSaveToSavedThemes}
            className="px-4 py-2.5 bg-[#FAF8F5] hover:bg-[#E8E4D9] border border-[#E8E4D9] text-[#1C1B18] text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Save Theme</span>
          </button>

          <button
            type="button"
            onClick={handleApplyCustomTheme}
            className="px-5 py-2.5 bg-[#1C1B18] hover:bg-[#33312B] text-[#FAF8F5] text-xs font-medium rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D49A3E]" />
            <span>Apply to Profile</span>
          </button>
        </div>
      </div>

      {/* SAVED CUSTOM THEMES LIBRARY BAR */}
      {savedThemes.length > 0 && (
        <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Your Saved Custom Themes ({savedThemes.length})</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {savedThemes.map((st) => (
              <div
                key={st.id}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs transition-all ${
                  selectedSavedId === st.id
                    ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18] font-medium'
                    : 'bg-white border-[#E8E4D9] text-[#1C1B18] hover:border-[#1C1B18]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleLoadSavedTheme(st)}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: st.bgHex }}
                  />
                  <span>{st.name}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSavedTheme(st.id, st.name);
                  }}
                  className="opacity-50 hover:opacity-100 p-0.5 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CONTRAST WARNING BANNER IF LOW CONTRAST */}
      {contrastRatio < 4.5 && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Accessibility Notice (Low Contrast: {contrastRatio.toFixed(1)}:1)</span>
            <p className="text-amber-800 leading-relaxed">
              Primary text color has low contrast against the background canvas. You can still save and apply this theme, but visitors may find it difficult to read.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Theme Title & Mode Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                Theme Name
              </label>
              <input
                type="text"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
                placeholder="e.g. Kyoto Sunset, Obsidian Gold"
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18] font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                Base Atmosphere
              </label>
              <div className="flex bg-[#FAF8F5] border border-[#E8E4D9] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('light')}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all ${
                    mode === 'light' ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold' : 'text-[#6B665E]'
                  }`}
                >
                  <Sun className="w-3 h-3 text-[#D49A3E]" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeSwitch('dark')}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg flex items-center justify-center gap-1 transition-all ${
                    mode === 'dark' ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-2xs font-semibold' : 'text-[#6B665E]'
                  }`}
                >
                  <Moon className="w-3 h-3 text-[#7B52AB]" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          {/* COLOR PALETTE CONTROLS */}
          <div className="space-y-4 pt-4 border-t border-[#E8E4D9]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18] flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Color Palette & Gradient Canvas</span>
            </h4>

            {/* Background Canvas & Gradient Toggle */}
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 border border-[#E8E4D9] rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#1C1B18]">Background Gradient</span>
                <button
                  type="button"
                  onClick={() => setUseGradientBg(!useGradientBg)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                    useGradientBg ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]' : 'bg-white border-[#E8E4D9] text-[#6B665E]'
                  }`}
                >
                  {useGradientBg ? 'Gradient Active' : 'Solid Color'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-[10px] font-mono-code uppercase text-[#6B665E] block mb-1">
                    Primary Canvas Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={bgHex}
                      onChange={(e) => setBgHex(e.target.value)}
                      className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgHex}
                      onChange={(e) => setBgHex(e.target.value)}
                      className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-white border border-[#E8E4D9] rounded-lg"
                    />
                  </div>
                </div>

                {useGradientBg && (
                  <div>
                    <label className="text-[10px] font-mono-code uppercase text-[#6B665E] block mb-1">
                      Secondary Gradient Color
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={gradientBgHex}
                        onChange={(e) => setGradientBgHex(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={gradientBgHex}
                        onChange={(e) => setGradientBgHex(e.target.value)}
                        className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-white border border-[#E8E4D9] rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Background Swatches */}
              <div className="flex flex-wrap gap-1 pt-1">
                {SWATCH_BG.map((swatch, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setBgHex(swatch.hex)}
                    className="w-5 h-5 rounded-full border border-black/20 transition-transform hover:scale-110"
                    style={{ backgroundColor: swatch.hex }}
                    title={swatch.name}
                  />
                ))}
              </div>
            </div>

            {/* Primary & Secondary Text / Accent Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase tracking-wider block mb-1">
                  Primary Text / Headings
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={textHex}
                    onChange={(e) => setTextHex(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={textHex}
                    onChange={(e) => setTextHex(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase tracking-wider block mb-1">
                  Secondary / Muted Text
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={mutedHex}
                    onChange={(e) => setMutedHex(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={mutedHex}
                    onChange={(e) => setMutedHex(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase tracking-wider block mb-1">
                  Accent Highlight Hue
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentHex}
                    onChange={(e) => setAccentHex(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Card Bg & Border Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase tracking-wider block mb-1">
                  Card Background Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={cardBgHex}
                    onChange={(e) => setCardBgHex(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={cardBgHex}
                    onChange={(e) => setCardBgHex(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase tracking-wider block mb-1">
                  Border Rule Color
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={borderHex}
                    onChange={(e) => setBorderHex(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={borderHex}
                    onChange={(e) => setBorderHex(e.target.value)}
                    className="w-full px-2 py-1 text-[11px] font-mono-code uppercase bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TYPOGRAPHY & SIZE */}
          <div className="space-y-3 pt-4 border-t border-[#E8E4D9]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18] flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#1C1B18]" />
              <span>Typography & Type Scale</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                  Display Heading Font
                </label>
                <select
                  value={displayFont}
                  onChange={(e) => setDisplayFont(e.target.value as ThemeOption['fontFamilyDisplay'])}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl font-medium outline-none"
                >
                  <option value="serif-display">Editorial Serif (Playfair Display)</option>
                  <option value="serif-editorial">Monograph Serif (Newsreader)</option>
                  <option value="sans-ui">Modern Sans (Plus Jakarta Sans)</option>
                  <option value="mono-code">Technical Mono (Space Mono)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                  Base Font Scale
                </label>
                <div className="flex bg-[#FAF8F5] border border-[#E8E4D9] p-1 rounded-xl">
                  {(['sm', 'md', 'lg'] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      className={`flex-1 py-1 text-xs font-medium uppercase rounded-lg transition-all ${
                        fontSize === sz ? 'bg-[#1C1B18] text-[#FAF8F5] font-bold shadow-2xs' : 'text-[#6B665E]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SHAPE, BUTTON & CARD STYLING */}
          <div className="space-y-3 pt-4 border-t border-[#E8E4D9]">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#D49A3E]" />
              <span>Card & Button Geometry</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                  Border Radius ({borderRadius}px)
                </label>
                <input
                  type="range"
                  min={0}
                  max={24}
                  step={4}
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(parseInt(e.target.value, 10))}
                  className="w-full accent-[#1C1B18]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                  Card Style Treatment
                </label>
                <select
                  value={cardStyle}
                  onChange={(e) => setCardStyle(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl font-medium"
                >
                  <option value="bordered">Bordered Outline</option>
                  <option value="flat">Flat Minimal</option>
                  <option value="elevated">Soft Elevated Shadow</option>
                  <option value="glass">Glassmorphism Translucent</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                  Shadow Intensity
                </label>
                <select
                  value={shadowIntensity}
                  onChange={(e) => setShadowIntensity(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl font-medium"
                >
                  <option value="none">None (Flat)</option>
                  <option value="soft">Soft Ambient</option>
                  <option value="crisp">Crisp Drop Shadow</option>
                  <option value="heavy">Heavy Architectural Shadow</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                  Profile Layout Structure
                </label>
                <select
                  value={profileLayout}
                  onChange={(e) => setProfileLayout(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl font-medium"
                >
                  <option value="centered">Centered Editorial</option>
                  <option value="left">Left-Aligned Studio</option>
                  <option value="compact">Compact Grid</option>
                </select>
              </div>
            </div>
          </div>

          {/* MOTION & GRAIN TOGGLES */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#E8E4D9]">
            <button
              type="button"
              onClick={() => setAnimationsEnabled(!animationsEnabled)}
              className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                animationsEnabled ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]' : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#6B665E]'
              }`}
            >
              <span>Hover Animations</span>
              <Zap className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setShowNoiseGrain(!showNoiseGrain)}
              className={`p-3 rounded-xl border text-xs font-medium text-left transition-all flex items-center justify-between ${
                showNoiseGrain ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]' : 'bg-[#FAF8F5] border-[#E8E4D9] text-[#6B665E]'
              }`}
            >
              <span>Paper Grain Texture</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Interactive Preview & WCAG Score (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* WCAG Score */}
          <div className="p-4 border rounded-xl bg-[#FAF8F5] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase font-mono-code text-[#6B665E] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Accessibility Score
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${contrastStatus.color}`}>
                {contrastStatus.label}
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-2xl font-mono-code font-bold text-[#1C1B18]">
                {contrastRatio.toFixed(1)}:1
              </span>
              <span className="text-xs text-[#6B665E]">Contrast Ratio</span>
            </div>

            <div className="w-full bg-[#E8E4D9] h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1C1B18] transition-all duration-300"
                style={{ width: `${Math.min(100, (contrastRatio / 15) * 100)}%` }}
              />
            </div>
          </div>

          {/* Interactive Live Profile Preview Card */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase font-mono-code text-[#6B665E] font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-[#C85A32]" /> Live Real-Time Profile Preview
            </label>

            <div
              className={`p-5 border transition-all duration-300 relative shadow-xs overflow-hidden ${
                showNoiseGrain ? 'paper-grain' : ''
              }`}
              style={{
                background: useGradientBg
                  ? `linear-gradient(135deg, ${bgHex} 0%, ${gradientBgHex} 100%)`
                  : bgHex,
                color: textHex,
                borderColor: borderHex,
                borderRadius: `${borderRadius}px`,
              }}
            >
              {/* Profile Header */}
              <div
                className={`flex items-center gap-3.5 mb-4 ${
                  profileLayout === 'centered'
                    ? 'flex-col text-center'
                    : profileLayout === 'compact'
                    ? 'flex-row text-left gap-2'
                    : 'flex-row text-left'
                }`}
              >
                <img
                  src={profile.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover border"
                  style={{ borderColor: borderHex }}
                />
                <div className="min-w-0">
                  <h4 className={`text-base font-medium tracking-tight truncate ${displayFontClass}`}>
                    {profile.name}
                  </h4>
                  <p className="text-[11px] truncate opacity-80" style={{ color: mutedHex }}>
                    @{profile.username}
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="text-center mb-4">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px]"
                  style={{ borderColor: borderHex, backgroundColor: cardBgHex }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentHex }} />
                  <span>Reading & Writing</span>
                </span>
              </div>

              {/* Sample Card */}
              <div
                onMouseEnter={() => setIsPreviewHovered(true)}
                onMouseLeave={() => setIsPreviewHovered(false)}
                className={`p-3.5 border transition-all cursor-pointer ${
                  animationsEnabled && isPreviewHovered ? '-translate-y-0.5' : ''
                }`}
                style={{
                  backgroundColor: cardBgHex,
                  borderColor: borderHex,
                  borderRadius: `${borderRadius}px`,
                  boxShadow:
                    shadowIntensity === 'soft'
                      ? '0 2px 8px rgba(0,0,0,0.04)'
                      : shadowIntensity === 'crisp'
                      ? '3px 3px 0px rgba(0,0,0,0.1)'
                      : shadowIntensity === 'heavy'
                      ? '0 8px 20px rgba(0,0,0,0.15)'
                      : 'none',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium flex items-center gap-1.5">
                      <span>On Digital Quietude Essay</span>
                      <span
                        className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase"
                        style={{ backgroundColor: accentHex, color: '#FFFFFF' }}
                      >
                        NEW
                      </span>
                    </div>
                    <p className="text-[10px] opacity-75" style={{ color: mutedHex }}>
                      Sample link card rendered with your theme parameters.
                    </p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t text-[9px] font-mono-code text-center opacity-60" style={{ borderColor: borderHex }}>
                {themeName} &bull; {displayFont} &bull; {mode}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
