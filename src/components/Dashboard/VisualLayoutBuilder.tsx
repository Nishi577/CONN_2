import React, { useState, useEffect } from 'react';
import {
  ConnProfile,
  ThemeFamily,
  ProfileSectionConfig,
  ProfileSectionId,
  SectionSizeVariant,
  ProfileLayoutConfig,
  CustomDesignFamily,
} from '../../types';
import { EDITORIAL_THEMES } from '../../data/themes';
import { PublicProfile } from '../PublicProfile';
import {
  GripVertical,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Copy,
  RotateCcw,
  Undo2,
  Redo2,
  Layers,
  Layout,
  Type,
  Palette,
  Check,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Sliders,
  Monitor,
  Smartphone,
  Info,
  Edit3,
  X,
  Compass,
  Wand2,
  ShieldAlert,
} from 'lucide-react';

interface VisualLayoutBuilderProps {
  profile: ConnProfile;
  onUpdateProfile: (updatedProfile: ConnProfile) => void;
  onShowToast: (message: string) => void;
}

const ALL_SECTION_DEFINITIONS: { id: ProfileSectionId; label: string; defaultSize: SectionSizeVariant }[] = [
  { id: 'header', label: 'Identity Header (Avatar, Name, Bio)', defaultSize: 'full' },
  { id: 'socials', label: 'Social Networks & Profiles', defaultSize: 'medium' },
  { id: 'availability', label: 'Availability & Intent Router', defaultSize: 'medium' },
  { id: 'now', label: 'NOW Activity Section', defaultSize: 'medium' },
  { id: 'featured_project', label: 'Featured Project Spotlight', defaultSize: 'large' },
  { id: 'projects', label: 'Projects & Links Grid', defaultSize: 'full' },
  { id: 'timeline', label: 'Identity Timeline', defaultSize: 'medium' },
  { id: 'experience', label: 'Work Experience History', defaultSize: 'medium' },
  { id: 'skills', label: 'Skills & Tech Stack Badges', defaultSize: 'medium' },
  { id: 'opensource', label: 'Open Source GitHub Stats', defaultSize: 'medium' },
  { id: 'newsletter', label: 'Newsletter Field Notes Card', defaultSize: 'medium' },
  { id: 'contact', label: 'Smart Contact Router', defaultSize: 'small' },
];

const BUILTIN_THEME_FAMILIES: { id: ThemeFamily; name: string; icon: string; description: string; isCustom?: boolean }[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    icon: '📰',
    description: 'Magazine & monograph style with large serif headings, numbered sections & article flows.',
  },
  {
    id: 'studio',
    name: 'Studio',
    icon: '🎨',
    description: 'Creative portfolio grid with high-impact project cover cards & offset visual blocks.',
  },
  {
    id: 'terminal',
    name: 'Terminal CLI',
    icon: '💻',
    description: 'Developer hacker command interface with $ whoami metadata, monospace code structure & tabs.',
  },
  {
    id: 'paper',
    name: 'Tactile Paper',
    icon: '📜',
    description: 'Printed notebook feel with editorial margins, notes, stamps, paper texture & organic warmth.',
  },
  {
    id: 'modernist',
    name: 'Swiss Modernist',
    icon: '🏛️',
    description: 'International Typographic Style with strict grid alignment, stark typography & high contrast.',
  },
];

const PRESET_DESIGN_TEMPLATES: {
  id: string;
  name: string;
  icon: string;
  description: string;
  fontFamilyDisplay: 'serif-display' | 'serif-editorial' | 'mono-code' | 'sans-ui';
  borderStyle: 'sharp' | 'rounded' | 'brutalist' | 'paper' | 'double' | 'glass';
  cardStyle: 'flat' | 'elevated' | 'glass' | 'retro' | 'minimal' | 'bordered';
  accentHex: string;
  defaultSectionOrder: ProfileSectionId[];
}[] = [
  {
    id: 'preset_brutalist',
    name: 'Neo-Brutalist Grid',
    icon: '⚡',
    description: 'Thick raw borders, hard offset black box shadows, stark uppercase mono badges and grid rules.',
    fontFamilyDisplay: 'mono-code',
    borderStyle: 'brutalist',
    cardStyle: 'retro',
    accentHex: '#C85A32',
    defaultSectionOrder: ['header', 'projects', 'featured_project', 'skills', 'experience', 'availability', 'now', 'opensource', 'timeline', 'socials', 'newsletter', 'contact'],
  },
  {
    id: 'preset_cyberpunk',
    name: 'Cyberpunk HUD',
    icon: '👾',
    description: 'Developer console layout with sharp corners, terminal status logs, neon emerald highlights and code blocks.',
    fontFamilyDisplay: 'mono-code',
    borderStyle: 'sharp',
    cardStyle: 'bordered',
    accentHex: '#10B981',
    defaultSectionOrder: ['header', 'now', 'opensource', 'skills', 'projects', 'experience', 'timeline', 'socials', 'availability', 'newsletter', 'contact'],
  },
  {
    id: 'preset_glassmorphism',
    name: 'Glassmorphism Studio',
    icon: '💎',
    description: 'Translucent frosted glass panels, glowing subtle borders, sleek clean sans-serif typography.',
    fontFamilyDisplay: 'sans-ui',
    borderStyle: 'glass',
    cardStyle: 'glass',
    accentHex: '#6366F1',
    defaultSectionOrder: ['header', 'featured_project', 'projects', 'now', 'availability', 'skills', 'experience', 'timeline', 'socials', 'newsletter', 'contact'],
  },
  {
    id: 'preset_artdeco',
    name: 'Art Deco Monograph',
    icon: '📜',
    description: 'Press editorial typography, double border accent rules, warm parchment aesthetics and elegant history.',
    fontFamilyDisplay: 'serif-editorial',
    borderStyle: 'double',
    cardStyle: 'elevated',
    accentHex: '#B45309',
    defaultSectionOrder: ['header', 'timeline', 'featured_project', 'experience', 'projects', 'now', 'skills', 'newsletter', 'socials', 'contact'],
  },
];

export const VisualLayoutBuilder: React.FC<VisualLayoutBuilderProps> = ({
  profile,
  onUpdateProfile,
  onShowToast,
}) => {
  // Mode selection: 'content' vs 'layout' vs 'themes'
  const [activeTab, setActiveTab] = useState<'layout' | 'themes'>('layout');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Undo / Redo history stack
  const [history, setHistory] = useState<ProfileLayoutConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Dragging state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Modal states
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);
  const [editingFamilyId, setEditingFamilyId] = useState<string | null>(null);

  // Custom Family Form State
  const [familyForm, setFamilyForm] = useState<CustomDesignFamily>({
    id: '',
    name: '',
    icon: '🎨',
    description: '',
    fontFamilyDisplay: 'serif-display',
    borderStyle: 'rounded',
    cardStyle: 'bordered',
    accentHex: '#C85A32',
    defaultSectionOrder: ALL_SECTION_DEFINITIONS.map((s) => s.id),
    isUserCreated: true,
  });

  // Active theme object
  const currentTheme = EDITORIAL_THEMES.find((t) => t.id === profile.themeId) || EDITORIAL_THEMES[0];

  // Helper to ensure profile has a layoutConfig
  const getEffectiveLayout = (): ProfileLayoutConfig => {
    if (profile.layoutConfig && profile.layoutConfig.sections && profile.layoutConfig.sections.length > 0) {
      return profile.layoutConfig;
    }
    const defaultOrder = currentTheme.defaultSectionOrder || ALL_SECTION_DEFINITIONS.map((s) => s.id);
    const initialSections: ProfileSectionConfig[] = defaultOrder.map((id) => {
      const def = ALL_SECTION_DEFINITIONS.find((d) => d.id === id);
      return {
        id,
        label: def ? def.label : id,
        visible: true,
        sizeVariant: def ? def.defaultSize : 'medium',
      };
    });
    return {
      themeFamily: currentTheme.themeFamily || 'editorial',
      sections: initialSections,
      editingMode: 'layout',
      gridDensity: 'comfortable',
      contentWidth: 'medium',
    };
  };

  const layout = getEffectiveLayout();

  // Combine built-in theme families with user-created custom families
  const customFamiliesList = profile.customDesignFamilies || [];
  const allFamiliesList = [
    ...BUILTIN_THEME_FAMILIES,
    ...customFamiliesList.map((cf) => ({
      id: cf.id,
      name: cf.name,
      icon: cf.icon,
      description: cf.description,
      isCustom: true,
      data: cf,
    })),
  ];

  // Record initial history state
  useEffect(() => {
    if (history.length === 0) {
      setHistory([layout]);
      setHistoryIndex(0);
    }
  }, []);

  const pushLayoutChange = (newLayout: ProfileLayoutConfig, msg?: string) => {
    const updatedHistory = history.slice(0, historyIndex + 1);
    updatedHistory.push(newLayout);
    setHistory(updatedHistory);
    setHistoryIndex(updatedHistory.length - 1);

    onUpdateProfile({
      ...profile,
      layoutConfig: newLayout,
    });

    if (msg) onShowToast(msg);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      const prevLayout = history[prevIndex];
      onUpdateProfile({
        ...profile,
        layoutConfig: prevLayout,
      });
      onShowToast('Undo layout change');
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      const nextLayout = history[nextIndex];
      onUpdateProfile({
        ...profile,
        layoutConfig: nextLayout,
      });
      onShowToast('Redo layout change');
    }
  };

  // Keyboard shortcut listener for CMD+Z / CMD+SHIFT+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, history]);

  // Section reordering: Move Up / Down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layout.sections.length) return;

    const newSections = [...layout.sections];
    const [moved] = newSections.splice(index, 1);
    newSections.splice(targetIndex, 0, moved);

    pushLayoutChange({
      ...layout,
      sections: newSections,
    }, `Moved "${moved.label}" ${direction}`);
  };

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newSections = [...layout.sections];
    const [draggedItem] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, draggedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);

    pushLayoutChange({
      ...layout,
      sections: newSections,
    }, `Reordered "${draggedItem.label}"`);
  };

  // Toggle Visibility
  const handleToggleVisibility = (index: number) => {
    const newSections = [...layout.sections];
    newSections[index] = {
      ...newSections[index],
      visible: !newSections[index].visible,
    };
    const stateMsg = newSections[index].visible ? 'Visible' : 'Hidden';
    pushLayoutChange({ ...layout, sections: newSections }, `Set ${newSections[index].label} to ${stateMsg}`);
  };

  // Change Size Variant
  const handleChangeSize = (index: number, size: SectionSizeVariant) => {
    const newSections = [...layout.sections];
    newSections[index] = {
      ...newSections[index],
      sizeVariant: size,
    };
    pushLayoutChange({ ...layout, sections: newSections }, `Changed size of ${newSections[index].label} to ${size}`);
  };

  // Duplicate Section
  const handleDuplicateSection = (index: number) => {
    const original = layout.sections[index];
    const copy: ProfileSectionConfig = {
      ...original,
      instanceKey: `${original.id}-copy-${Date.now()}`,
      customTitle: original.customTitle ? `${original.customTitle} (Copy)` : `${original.label} (Secondary)`,
    };

    const newSections = [...layout.sections];
    newSections.splice(index + 1, 0, copy);
    pushLayoutChange({ ...layout, sections: newSections }, `Duplicated ${original.label}`);
  };

  // Remove Section
  const handleRemoveSection = (index: number) => {
    const newSections = layout.sections.filter((_, i) => i !== index);
    pushLayoutChange({ ...layout, sections: newSections }, 'Section removed');
  };

  // Switch Theme Family
  const handleSelectThemeFamily = (familyId: ThemeFamily) => {
    // Check if built-in or custom
    const customFam = customFamiliesList.find((f) => f.id === familyId);
    const builtinFam = BUILTIN_THEME_FAMILIES.find((f) => f.id === familyId);
    const familyTheme = EDITORIAL_THEMES.find((t) => t.themeFamily === familyId) || EDITORIAL_THEMES[0];

    const defaultOrder =
      customFam?.defaultSectionOrder ||
      familyTheme.defaultSectionOrder ||
      ALL_SECTION_DEFINITIONS.map((s) => s.id);

    const reorderedSections: ProfileSectionConfig[] = defaultOrder.map((id) => {
      const existing = layout.sections.find((s) => s.id === id);
      if (existing) return existing;
      const def = ALL_SECTION_DEFINITIONS.find((d) => d.id === id);
      return {
        id,
        label: def ? def.label : id,
        visible: true,
        sizeVariant: def ? def.defaultSize : 'medium',
      };
    });

    const newLayout: ProfileLayoutConfig = {
      ...layout,
      themeFamily: familyId,
      sections: reorderedSections,
    };

    onUpdateProfile({
      ...profile,
      themeId: familyTheme.id,
      layoutConfig: newLayout,
    });

    const famName = customFam ? customFam.name : builtinFam ? builtinFam.name : familyId;
    pushLayoutChange(newLayout, `Switched design family to ${famName}`);
  };

  // Open Create Modal
  const handleOpenCreateFamily = () => {
    setEditingFamilyId(null);
    setFamilyForm({
      id: `custom_fam_${Date.now()}`,
      name: '',
      icon: '✨',
      description: '',
      fontFamilyDisplay: 'serif-display',
      borderStyle: 'rounded',
      cardStyle: 'bordered',
      accentHex: '#C85A32',
      defaultSectionOrder: ALL_SECTION_DEFINITIONS.map((s) => s.id),
      isUserCreated: true,
    });
    setIsFamilyModalOpen(true);
  };

  // Open Edit Modal for Custom Family
  const handleOpenEditFamily = (fam: CustomDesignFamily, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFamilyId(fam.id);
    setFamilyForm({ ...fam });
    setIsFamilyModalOpen(true);
  };

  // Apply Preset Template to Family Form
  const handleApplyPresetTemplate = (presetId: string) => {
    const preset = PRESET_DESIGN_TEMPLATES.find((p) => p.id === presetId);
    if (!preset) return;
    setFamilyForm((prev) => ({
      ...prev,
      name: preset.name,
      icon: preset.icon,
      description: preset.description,
      fontFamilyDisplay: preset.fontFamilyDisplay,
      borderStyle: preset.borderStyle,
      cardStyle: preset.cardStyle,
      accentHex: preset.accentHex,
      defaultSectionOrder: [...preset.defaultSectionOrder],
    }));
    onShowToast(`Loaded "${preset.name}" preset template.`);
  };

  // Save Custom Design Family
  const handleSaveCustomFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.name.trim()) return;

    const existingCustoms = profile.customDesignFamilies || [];
    let updatedCustoms: CustomDesignFamily[];

    if (editingFamilyId) {
      updatedCustoms = existingCustoms.map((cf) => (cf.id === editingFamilyId ? familyForm : cf));
    } else {
      updatedCustoms = [...existingCustoms, familyForm];
    }

    const newLayout: ProfileLayoutConfig = {
      ...layout,
      themeFamily: familyForm.id,
      sections: familyForm.defaultSectionOrder
        ? familyForm.defaultSectionOrder.map((id) => {
            const existing = layout.sections.find((s) => s.id === id);
            if (existing) return existing;
            const def = ALL_SECTION_DEFINITIONS.find((d) => d.id === id);
            return {
              id,
              label: def ? def.label : id,
              visible: true,
              sizeVariant: def ? def.defaultSize : 'medium',
            };
          })
        : layout.sections,
    };

    onUpdateProfile({
      ...profile,
      customDesignFamilies: updatedCustoms,
      layoutConfig: newLayout,
    });

    setIsFamilyModalOpen(false);
    onShowToast(`Created & Activated "${familyForm.name}" Design Family!`);
  };

  // Delete Custom Design Family
  const handleDeleteCustomFamily = (famId: string, famName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedCustoms = (profile.customDesignFamilies || []).filter((f) => f.id !== famId);
    
    let newLayout = layout;
    if (layout.themeFamily === famId) {
      newLayout = { ...layout, themeFamily: 'editorial' };
    }

    onUpdateProfile({
      ...profile,
      customDesignFamilies: updatedCustoms,
      layoutConfig: newLayout,
    });

    onShowToast(`Deleted "${famName}" design family`);
  };

  // Duplicate Custom Design Family
  const handleDuplicateCustomFamily = (fam: CustomDesignFamily, e: React.MouseEvent) => {
    e.stopPropagation();
    const copy: CustomDesignFamily = {
      ...fam,
      id: `custom_fam_${Date.now()}`,
      name: `${fam.name} (Copy)`,
    };
    const updatedCustoms = [...(profile.customDesignFamilies || []), copy];
    onUpdateProfile({
      ...profile,
      customDesignFamilies: updatedCustoms,
    });
    onShowToast(`Duplicated "${fam.name}"`);
  };

  // Reset Layout to Theme Family Default
  const handleResetLayout = () => {
    const customFam = customFamiliesList.find((f) => f.id === layout.themeFamily);
    const familyTheme = EDITORIAL_THEMES.find((t) => t.id === profile.themeId) || EDITORIAL_THEMES[0];
    const defaultOrder =
      customFam?.defaultSectionOrder ||
      familyTheme.defaultSectionOrder ||
      ALL_SECTION_DEFINITIONS.map((s) => s.id);

    const defaultSections: ProfileSectionConfig[] = defaultOrder.map((id) => {
      const def = ALL_SECTION_DEFINITIONS.find((d) => d.id === id);
      return {
        id,
        label: def ? def.label : id,
        visible: true,
        sizeVariant: def ? def.defaultSize : 'medium',
      };
    });

    const resetConfig: ProfileLayoutConfig = {
      themeFamily: layout.themeFamily,
      sections: defaultSections,
      gridDensity: 'comfortable',
      contentWidth: 'medium',
    };

    pushLayoutChange(resetConfig, `Reset layout composition`);
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* TOP ARCHITECTURAL TOOLBAR */}
      <div className="p-4 bg-white border border-[#E8E4D9] rounded-2xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-serif-display text-lg font-bold text-[#1C1B18] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#C85A32]" />
              Visual Identity & Spatial Composition Builder
            </h2>
            <span className="text-[10px] font-mono-code uppercase font-bold px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#E8E4D9] text-[#6B665E]">
              {layout.themeFamily.toUpperCase()} FAMILY
            </span>
          </div>
          <p className="text-xs text-[#6B665E] mt-0.5">
            Rearrange major profile sections, toggle visibility, adjust sizes, and create or switch custom design families in real time.
          </p>
        </div>

        {/* CONTROLS: UNDO / REDO / RESET / PREVIEW TOGGLE */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={handleOpenCreateFamily}
            className="px-3.5 py-1.5 bg-[#1C1B18] text-[#FAF8F5] rounded-xl text-xs font-mono-code font-bold hover:bg-[#33312B] flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-[#C85A32]" />
            <span>+ Add Design Family</span>
          </button>

          <div className="flex items-center border border-[#E8E4D9] rounded-xl bg-[#FAF8F5] p-1 gap-1">
            <button
              type="button"
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-xs hover:bg-white disabled:opacity-30 text-[#1C1B18] transition-colors"
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-xs hover:bg-white disabled:opacity-30 text-[#1C1B18] transition-colors"
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-3 py-1.5 border border-[#E8E4D9] hover:border-red-300 rounded-xl text-xs font-mono-code font-bold text-[#6B665E] hover:text-red-700 flex items-center gap-1.5 bg-white transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Layout</span>
          </button>

          <div className="flex items-center border border-[#E8E4D9] rounded-xl bg-[#FAF8F5] p-1 gap-1">
            <button
              type="button"
              onClick={() => setPreviewDevice('desktop')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                previewDevice === 'desktop' ? 'bg-[#1C1B18] text-white font-bold' : 'text-[#6B665E]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('mobile')}
              className={`p-1.5 rounded-lg text-xs flex items-center gap-1 ${
                previewDevice === 'mobile' ? 'bg-[#1C1B18] text-white font-bold' : 'text-[#6B665E]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* TABS FOR BUILDER MODES */}
      <div className="flex items-center border-b border-[#E8E4D9] gap-4 text-xs font-mono-code font-bold">
        <button
          onClick={() => setActiveTab('layout')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'layout'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#6B665E] hover:text-[#1C1B18]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>1. Layout Composition Mode</span>
          <span className="text-[10px] bg-[#FAF8F5] border px-1.5 py-0.2 rounded font-normal">
            Drag & Drop
          </span>
        </button>

        <button
          onClick={() => setActiveTab('themes')}
          className={`pb-2.5 px-1 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'themes'
              ? 'border-[#C85A32] text-[#C85A32]'
              : 'border-transparent text-[#6B665E] hover:text-[#1C1B18]'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>2. Design Families ({allFamiliesList.length})</span>
          {customFamiliesList.length > 0 && (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded font-bold">
              {customFamiliesList.length} Custom
            </span>
          )}
        </button>
      </div>

      {/* TAB CONTENT: DESIGN FAMILY SELECTOR */}
      {activeTab === 'themes' && (
        <div className="space-y-5 p-5 bg-white border border-[#E8E4D9] rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E8E4D9]">
            <div>
              <h3 className="font-serif-display text-base font-bold text-[#1C1B18]">
                Select or Create a Design Philosophy Family
              </h3>
              <p className="text-xs text-[#6B665E] mt-0.5">
                Conn themes are NOT simple color changes. Each design family fundamentally transforms component composition, grid architecture, spacing, and typographic hierarchy.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateFamily}
              className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] rounded-xl text-xs font-mono-code font-bold hover:bg-[#33312B] flex items-center gap-2 shrink-0 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#C85A32]" />
              <span>+ Create Custom Design Family</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* ADD CUSTOM FAMILY CARD BUTTON */}
            <button
              onClick={handleOpenCreateFamily}
              className="p-5 rounded-xl border border-dashed border-[#C85A32] bg-[#FAF8F5] hover:bg-orange-50/50 text-left transition-all flex flex-col items-center justify-center text-center space-y-2 group min-h-[160px]"
            >
              <div className="w-10 h-10 rounded-full bg-white border border-[#E8E4D9] flex items-center justify-center text-[#C85A32] group-hover:scale-110 transition-transform shadow-2xs">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <div className="font-mono-code text-xs font-bold text-[#1C1B18] group-hover:text-[#C85A32]">
                  + Add Design Family
                </div>
                <p className="text-[11px] text-[#6B665E] leading-tight mt-1">
                  Build custom grid architectures, font pairings & card rules
                </p>
              </div>
            </button>

            {/* FAMILY CARDS */}
            {allFamiliesList.map((fam) => {
              const isSelected = layout.themeFamily === fam.id;
              const isCustom = fam.isCustom;
              const customData = fam.data;

              return (
                <div
                  key={fam.id}
                  onClick={() => handleSelectThemeFamily(fam.id)}
                  className={`p-4 rounded-xl border text-left transition-all relative cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#C85A32] bg-[#FAF8F5] ring-2 ring-[#C85A32]/30 shadow-sm'
                      : 'border-[#E8E4D9] bg-white hover:border-[#1C1B18]'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{fam.icon}</span>
                      {isCustom && (
                        <span className="text-[9px] font-mono-code font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 border border-emerald-300 text-emerald-800">
                          BESPOKE
                        </span>
                      )}
                    </div>

                    <div className="font-serif-display text-sm font-bold text-[#1C1B18] flex items-center justify-between">
                      <span>{fam.name}</span>
                    </div>

                    <p className="text-[11px] text-[#6B665E] leading-relaxed font-light line-clamp-3">
                      {fam.description}
                    </p>
                  </div>

                  {/* BOTTOM ACTIONS AND STATUS */}
                  <div className="pt-2 border-t border-[#E8E4D9] flex items-center justify-between text-[10px]">
                    {isSelected ? (
                      <span className="font-mono-code font-bold text-[#C85A32] flex items-center gap-1">
                        <Check className="w-3 h-3" /> ACTIVE FAMILY
                      </span>
                    ) : (
                      <span className="text-[#6B665E] font-mono-code hover:text-[#1C1B18]">
                        Click to activate
                      </span>
                    )}

                    {isCustom && customData && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditFamily(customData, e)}
                          className="p-1 rounded hover:bg-[#FAF8F5] text-[#6B665E] hover:text-[#1C1B18]"
                          title="Edit Custom Family"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDuplicateCustomFamily(customData, e)}
                          className="p-1 rounded hover:bg-[#FAF8F5] text-[#6B665E] hover:text-[#1C1B18]"
                          title="Duplicate Custom Family"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomFamily(customData.id, customData.name, e)}
                          className="p-1 rounded hover:bg-red-50 text-[#6B665E] hover:text-red-600"
                          title="Delete Custom Family"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SPLIT SCREEN CANVAS: LEFT BUILDER CONTROLS, RIGHT LIVE PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: DRAGGABLE SECTION LIST & CONTROLS */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 bg-white border border-[#E8E4D9] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D9]">
              <span className="text-xs font-mono-code uppercase font-bold text-[#1C1B18] flex items-center gap-1.5">
                <Layout className="w-4 h-4 text-[#C85A32]" /> Profile Section Sequence
              </span>
              <span className="text-[11px] font-mono-code text-[#6B665E]">
                {layout.sections.filter((s) => s.visible).length} of {layout.sections.length} Visible
              </span>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {layout.sections.map((section, idx) => {
                const isDragging = draggedIndex === idx;
                const isOver = dragOverIndex === idx;

                return (
                  <div
                    key={section.instanceKey || `${section.id}-${idx}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    className={`p-3 rounded-xl border transition-all space-y-2 ${
                      isDragging ? 'opacity-40 scale-98 border-dashed border-[#C85A32]' : ''
                    } ${isOver ? 'border-[#C85A32] bg-[#FAF8F5] border-2' : ''} ${
                      section.visible ? 'bg-white border-[#E8E4D9]' : 'bg-[#FAF8F5] border-[#E8E4D9] opacity-60'
                    }`}
                  >
                    {/* SECTION TITLE & DRAG HANDLE */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-[#9C978E] hover:text-[#1C1B18]" />
                        <span className="text-xs font-mono-code font-bold text-[#1C1B18]">
                          {idx + 1}. {section.customTitle || section.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* Quick Up/Down buttons */}
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-[#6B665E] hover:bg-[#FAF8F5] disabled:opacity-20"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSection(idx, 'down')}
                          disabled={idx === layout.sections.length - 1}
                          className="p-1 rounded text-[#6B665E] hover:bg-[#FAF8F5] disabled:opacity-20"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* Visibility Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleVisibility(idx)}
                          className={`p-1.5 rounded-lg text-xs transition-colors ${
                            section.visible
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                          title={section.visible ? 'Hide section' : 'Show section'}
                        >
                          {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* SIZING & CONTROLS TOOLBAR */}
                    {section.visible && (
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E8E4D9]/60 text-[11px]">
                        <div className="flex items-center gap-1">
                          <span className="text-[#6B665E] font-mono-code text-[10px] uppercase">Density:</span>
                          {(['small', 'medium', 'large', 'full'] as SectionSizeVariant[]).map((sz) => (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => handleChangeSize(idx, sz)}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-mono-code transition-all ${
                                section.sizeVariant === sz
                                  ? 'bg-[#1C1B18] text-white font-bold'
                                  : 'bg-[#FAF8F5] text-[#6B665E] hover:text-[#1C1B18]'
                              }`}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDuplicateSection(idx)}
                            className="p-1 rounded text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#FAF8F5]"
                            title="Duplicate section block"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {layout.sections.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSection(idx)}
                              className="p-1 rounded text-[#6B665E] hover:text-red-600 hover:bg-red-50"
                              title="Delete section instance"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PROFILE CANVAS PREVIEW */}
        <div className="lg:col-span-7 sticky top-6">
          <div className="bg-white border border-[#E8E4D9] rounded-2xl p-3 space-y-3 shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-2 pb-2 border-b border-[#E8E4D9]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-serif-display text-sm font-bold text-[#1C1B18]">
                  Live Identity Preview ({layout.themeFamily.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px] font-mono-code text-[#6B665E]">
                conn.bio/{profile.username}
              </span>
            </div>

            {/* Simulated Frame */}
            <div
              className={`mx-auto transition-all duration-300 border border-[#E8E4D9] rounded-xl overflow-hidden ${
                previewDevice === 'mobile' ? 'max-w-sm shadow-lg' : 'w-full'
              }`}
              style={{ backgroundColor: currentTheme.bgHex }}
            >
              <div className="max-h-[680px] overflow-y-auto">
                <PublicProfile
                  profile={profile}
                  onOpenShare={() => {}}
                  onShowToast={onShowToast}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT CUSTOM DESIGN FAMILY MODAL */}
      {isFamilyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-white border border-[#E8E4D9] rounded-2xl text-[#1C1B18] space-y-6 shadow-2xl">
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D9]">
              <div>
                <h3 className="font-serif-display text-lg font-bold flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-[#C85A32]" />
                  {editingFamilyId ? 'Edit Design Family' : 'Create Custom Design Philosophy Family'}
                </h3>
                <p className="text-xs text-[#6B665E] mt-0.5">
                  Define structural card boundaries, border styles, typography pairings, and layout defaults.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFamilyModalOpen(false)}
                className="p-1.5 rounded-xl border border-[#E8E4D9] text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#FAF8F5]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PRESET QUICK-START TEMPLATES */}
            {!editingFamilyId && (
              <div className="space-y-2 p-3 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl">
                <div className="flex items-center justify-between text-xs font-mono-code font-bold text-[#1C1B18]">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" /> Quick Start Preset Templates:
                  </span>
                  <span className="text-[10px] text-[#6B665E]">Click to load archetype</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {PRESET_DESIGN_TEMPLATES.map((preset) => (
                    <button
                      type="button"
                      key={preset.id}
                      onClick={() => handleApplyPresetTemplate(preset.id)}
                      className="p-2.5 rounded-lg border border-[#E8E4D9] bg-white hover:border-[#C85A32] text-left transition-all space-y-1 hover:shadow-xs group"
                    >
                      <div className="text-lg">{preset.icon}</div>
                      <div className="font-mono-code text-[11px] font-bold group-hover:text-[#C85A32] truncate">
                        {preset.name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* FORM FIELDS */}
            <form onSubmit={handleSaveCustomFamily} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                {/* NAME & ICON */}
                <div className="sm:col-span-9 space-y-1">
                  <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                    Family Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neo-Brutalist Grid, Cyberpunk HUD, Glassmorphism Studio"
                    value={familyForm.name}
                    onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })}
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl focus:border-[#C85A32] focus:outline-none bg-[#FAF8F5]"
                  />
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                    Emoji Icon
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={2}
                    value={familyForm.icon}
                    onChange={(e) => setFamilyForm({ ...familyForm, icon: e.target.value })}
                    className="w-full p-2.5 text-xs text-center border border-[#E8E4D9] rounded-xl focus:border-[#C85A32] focus:outline-none bg-[#FAF8F5] text-lg"
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-1">
                <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Aesthetic Description & Philosophy
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe typography, grid architecture, border weight, and structural feel..."
                  value={familyForm.description}
                  onChange={(e) => setFamilyForm({ ...familyForm, description: e.target.value })}
                  className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl focus:border-[#C85A32] focus:outline-none bg-[#FAF8F5]"
                />
              </div>

              {/* TYPOGRAPHY PAIRING */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Typographic Hierarchy
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'serif-display', label: 'Serif Display', preview: 'Aa Bb Cc', font: 'font-serif-display' },
                    { id: 'serif-editorial', label: 'Editorial Monograph', preview: 'Aa Bb Cc', font: 'font-serif-editorial' },
                    { id: 'mono-code', label: 'Monospace Terminal', preview: '0101 Code', font: 'font-mono-code' },
                    { id: 'sans-ui', label: 'Clean Sans-Serif', preview: 'Modern UI', font: 'font-sans-ui' },
                  ].map((f) => (
                    <button
                      type="button"
                      key={f.id}
                      onClick={() => setFamilyForm({ ...familyForm, fontFamilyDisplay: f.id as any })}
                      className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                        familyForm.fontFamilyDisplay === f.id
                          ? 'border-[#C85A32] bg-[#FAF8F5] font-bold ring-1 ring-[#C85A32]'
                          : 'border-[#E8E4D9] bg-white hover:border-[#1C1B18]'
                      }`}
                    >
                      <div className="text-xs text-[#1C1B18]">{f.label}</div>
                      <div className={`text-sm ${f.font} text-[#C85A32]`}>{f.preview}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* BORDER & FRAME ARCHETYPE */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Border & Component Edge Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'brutalist', label: 'Neo-Brutalist Hard Shadow', desc: 'Thick black 2px border with offset 3px hard drop shadow' },
                    { id: 'rounded', label: 'Smooth Rounded (Standard)', desc: 'Elegant 16px soft border with micro shadow' },
                    { id: 'sharp', label: 'Sharp Minimal Grid', desc: '0px border radius with stark boundary lines' },
                    { id: 'double', label: 'Double Line Framed', desc: 'Editorial double stroke outline frame' },
                    { id: 'glass', label: 'Translucent Glass', desc: 'Frosted blur panel with glowing white border' },
                    { id: 'paper', label: 'Tactile Parchment Paper', desc: 'Organic paper background texture with tape accents' },
                  ].map((b) => (
                    <button
                      type="button"
                      key={b.id}
                      onClick={() => setFamilyForm({ ...familyForm, borderStyle: b.id as any })}
                      className={`p-3 rounded-xl border text-left space-y-1 transition-all ${
                        familyForm.borderStyle === b.id
                          ? 'border-[#C85A32] bg-[#FAF8F5] font-bold ring-1 ring-[#C85A32]'
                          : 'border-[#E8E4D9] bg-white hover:border-[#1C1B18]'
                      }`}
                    >
                      <div className="text-xs text-[#1C1B18]">{b.label}</div>
                      <div className="text-[10px] text-[#6B665E] leading-snug">{b.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PRIMARY ACCENT SWATCH */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18]">
                  Design Family Accent Color
                </label>
                <div className="flex items-center gap-3">
                  {['#C85A32', '#10B981', '#6366F1', '#3B82F6', '#EC4899', '#B45309', '#1C1B18'].map((hex) => (
                    <button
                      type="button"
                      key={hex}
                      onClick={() => setFamilyForm({ ...familyForm, accentHex: hex })}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        familyForm.accentHex === hex ? 'scale-125 border-black shadow-md' : 'border-white'
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                  <input
                    type="color"
                    value={familyForm.accentHex || '#C85A32'}
                    onChange={(e) => setFamilyForm({ ...familyForm, accentHex: e.target.value })}
                    className="w-8 h-8 rounded border border-[#E8E4D9] cursor-pointer"
                  />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => setIsFamilyModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium border border-[#E8E4D9] rounded-xl hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-[#1C1B18] text-[#FAF8F5] rounded-xl hover:bg-[#33312B] flex items-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4 text-[#C85A32]" />
                  <span>{editingFamilyId ? 'Update Design Family' : 'Save & Activate Design Family'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 bg-white border border-[#E8E4D9] rounded-2xl text-[#1C1B18] space-y-4 shadow-xl">
            <h3 className="font-serif-display text-lg font-bold">Reset Profile Layout?</h3>
            <p className="text-xs text-[#6B665E] leading-relaxed">
              Your content (Name, Projects, Experience, Skills) will remain completely unchanged. Only the spatial arrangement will return to the default composition for <strong>{currentTheme.name}</strong>.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8E4D9]">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium border border-[#E8E4D9] rounded-xl hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetLayout}
                className="px-4 py-2 text-xs font-bold bg-red-600 text-white rounded-xl hover:bg-red-700"
              >
                Confirm Reset Layout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualLayoutBuilder;
