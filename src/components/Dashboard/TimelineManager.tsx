import React, { useState } from 'react';
import { ConnProfile, TimelineItem, ProfileSectionConfig } from '../../types';
import {
  Clock,
  Plus,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Sparkles,
  Pencil,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  ArrowUpDown,
  Search,
  SlidersHorizontal,
  Eye,
  EyeOff,
  X,
  Building,
  Tag,
  Link as LinkIcon,
  Check,
} from 'lucide-react';

interface TimelineManagerProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
  onViewPublicProfile?: () => void;
}

const CATEGORY_CONFIG: Record<
  TimelineItem['category'],
  { label: string; icon: React.ElementType; color: string; bg: string; border: string }
> = {
  Career: {
    label: 'Work & Career',
    icon: Briefcase,
    color: 'text-amber-800',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
  },
  Project: {
    label: 'Key Project',
    icon: FolderGit2,
    color: 'text-blue-800',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  OpenSource: {
    label: 'Open Source',
    icon: Sparkles,
    color: 'text-purple-800',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  Education: {
    label: 'Education & Degree',
    icon: GraduationCap,
    color: 'text-emerald-800',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  },
  Achievement: {
    label: 'Award & Milestone',
    icon: Award,
    color: 'text-rose-800',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
  },
};

export const TimelineManager: React.FC<TimelineManagerProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
  onViewPublicProfile,
}) => {
  const timeline: TimelineItem[] = profile.timeline || [];

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [formData, setFormData] = useState<{
    year: string;
    category: TimelineItem['category'];
    title: string;
    organization: string;
    description: string;
    linkUrl: string;
    skillsString: string;
    current: boolean;
    verified: boolean;
  }>({
    year: '',
    category: 'Career',
    title: '',
    organization: '',
    description: '',
    linkUrl: '',
    skillsString: '',
    current: false,
    verified: true,
  });

  // Check if timeline section is visible on public profile
  const configuredSections = profile.layoutConfig?.sections || [];
  const timelineSection = configuredSections.find((s) => s.id === 'timeline');
  const isSectionVisible = timelineSection ? timelineSection.visible : true;

  // Toggle Timeline section visibility on the public profile
  const handleToggleSectionVisibility = () => {
    let updatedSections: ProfileSectionConfig[];
    if (configuredSections.length > 0) {
      const exists = configuredSections.some((s) => s.id === 'timeline');
      if (exists) {
        updatedSections = configuredSections.map((s) =>
          s.id === 'timeline' ? { ...s, visible: !s.visible } : s
        );
      } else {
        updatedSections = [
          ...configuredSections,
          { id: 'timeline', label: 'Identity Timeline', visible: true },
        ];
      }
    } else {
      updatedSections = [
        { id: 'header', label: 'header', visible: true },
        { id: 'projects', label: 'projects', visible: true },
        { id: 'timeline', label: 'Identity Timeline', visible: !isSectionVisible },
        { id: 'socials', label: 'socials', visible: true },
      ];
    }

    onChangeProfile({
      ...profile,
      layoutConfig: {
        ...(profile.layoutConfig || { themeFamily: 'editorial', sections: [] }),
        sections: updatedSections,
      },
    });

    onShowToast(
      !isSectionVisible
        ? 'Timeline section enabled on your public profile'
        : 'Timeline section hidden from public profile'
    );
  };

  // Change timeline layout style
  const handleChangeTimelineStyle = (style: 'roadmap' | 'cards' | 'minimal') => {
    onChangeProfile({
      ...profile,
      timelineStyle: style,
    });
    onShowToast(`Timeline layout updated to ${style}`);
  };

  // Open Add Modal
  const handleOpenAdd = (presetCategory?: TimelineItem['category']) => {
    setEditingId(null);
    setFormData({
      year: new Date().getFullYear().toString(),
      category: presetCategory || 'Career',
      title: '',
      organization: '',
      description: '',
      linkUrl: '',
      skillsString: '',
      current: false,
      verified: true,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (item: TimelineItem) => {
    setEditingId(item.id);
    setFormData({
      year: item.year,
      category: item.category,
      title: item.title,
      organization: item.organization || '',
      description: item.description,
      linkUrl: item.linkUrl || '',
      skillsString: (item.skillsOrTags || []).join(', '),
      current: item.current || false,
      verified: item.verified ?? true,
    });
    setIsModalOpen(true);
  };

  // Save Form
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      onShowToast('Please provide a title or role.');
      return;
    }

    const skillsOrTags = formData.skillsString
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    let updatedList: TimelineItem[];

    if (editingId) {
      updatedList = timeline.map((item) =>
        item.id === editingId
          ? {
              ...item,
              year: formData.year.trim() || new Date().getFullYear().toString(),
              category: formData.category,
              title: formData.title.trim(),
              organization: formData.organization.trim() || undefined,
              description: formData.description.trim(),
              linkUrl: formData.linkUrl.trim() || undefined,
              skillsOrTags: skillsOrTags.length > 0 ? skillsOrTags : undefined,
              current: formData.current,
              verified: formData.verified,
            }
          : item
      );
      onShowToast('Timeline milestone updated!');
    } else {
      const newItem: TimelineItem = {
        id: `tl_${Date.now()}`,
        year: formData.year.trim() || new Date().getFullYear().toString(),
        category: formData.category,
        title: formData.title.trim(),
        organization: formData.organization.trim() || undefined,
        description: formData.description.trim(),
        linkUrl: formData.linkUrl.trim() || undefined,
        skillsOrTags: skillsOrTags.length > 0 ? skillsOrTags : undefined,
        current: formData.current,
        verified: formData.verified,
      };
      updatedList = [newItem, ...timeline];
      onShowToast('New timeline milestone added!');
    }

    onChangeProfile({
      ...profile,
      timeline: updatedList,
    });
    setIsModalOpen(false);
  };

  // Delete item
  const handleDeleteItem = (id: string, title: string) => {
    const updated = timeline.filter((t) => t.id !== id);
    onChangeProfile({
      ...profile,
      timeline: updated,
    });
    onShowToast(`Deleted "${title}"`);
  };

  // Duplicate item
  const handleDuplicateItem = (item: TimelineItem) => {
    const copy: TimelineItem = {
      ...item,
      id: `tl_${Date.now()}`,
      title: `${item.title} (Copy)`,
    };
    const index = timeline.findIndex((t) => t.id === item.id);
    const updated = [...timeline];
    updated.splice(index + 1, 0, copy);
    onChangeProfile({
      ...profile,
      timeline: updated,
    });
    onShowToast(`Duplicated "${item.title}"`);
  };

  // Move item up / down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= timeline.length) return;
    const updated = [...timeline];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onChangeProfile({
      ...profile,
      timeline: updated,
    });
  };

  // Sort helper
  const handleSortByYear = (descending: boolean) => {
    const sorted = [...timeline].sort((a, b) => {
      const numA = parseInt(a.year.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.year.replace(/\D/g, '')) || 0;
      return descending ? numB - numA : numA - numB;
    });
    onChangeProfile({
      ...profile,
      timeline: sorted,
    });
    onShowToast(descending ? 'Sorted timeline by newest year first' : 'Sorted timeline by oldest year first');
  };

  // Quick Starter Templates
  const handleAddPresetWork = () => {
    const currentYear = new Date().getFullYear();
    const presetItem: TimelineItem = {
      id: `tl_${Date.now()}`,
      year: `${currentYear} — Present`,
      category: 'Career',
      title: 'Senior Software Engineer & Product Designer',
      organization: 'Innovate Labs',
      description: 'Directing user experience engineering, reactive frontend state, and design architecture.',
      skillsOrTags: ['TypeScript', 'React', 'Design Systems', 'Cloud'],
      current: true,
      verified: true,
    };
    onChangeProfile({
      ...profile,
      timeline: [presetItem, ...timeline],
    });
    onShowToast('Added starter career milestone!');
  };

  // Filtered timeline items
  const filteredItems = timeline.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      (item.organization && item.organization.toLowerCase().includes(query)) ||
      item.description.toLowerCase().includes(query) ||
      item.year.toLowerCase().includes(query) ||
      (item.skillsOrTags && item.skillsOrTags.some((t) => t.toLowerCase().includes(query)));
    return matchesCategory && matchesQuery;
  });

  const activeStyle = profile.timelineStyle || 'roadmap';

  return (
    <div className="space-y-6 font-sans-ui text-[#1C1B18]">
      {/* HEADER & CONTROLS */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-[#C85A32]/10 rounded-lg text-[#C85A32]">
                <Clock className="w-5 h-5" />
              </span>
              <h2 className="font-serif-display text-xl font-bold text-[#1C1B18]">
                Work & Milestones Timeline
              </h2>
            </div>
            <p className="text-xs text-[#6B665E] mt-1">
              Curate a living chronological roadmap of your career, roles, major projects, education, and achievements.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 bg-[#1C1B18] hover:bg-[#33312B] text-[#FAF8F5] rounded-xl text-xs font-mono-code font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-98"
            >
              <Plus className="w-4 h-4 text-[#D49A3E]" />
              <span>Add Milestone</span>
            </button>
          </div>
        </div>

        {/* Feature Output Explainer Card */}
        <div className="p-4 bg-white border border-[#E8E4D9] rounded-2xl flex items-start gap-3 shadow-2xs">
          <span className="p-2 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl text-[#C85A32] shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="space-y-1 text-xs">
            <span className="font-bold text-[#1C1B18] uppercase tracking-wider text-[10px] font-mono-code block">
              Public Profile Output & How It Works
            </span>
            <p className="text-[#6B665E] leading-relaxed">
              Your career milestones and projects render as an editorial chronological stream with company badges, date ranges, and achievement bullet points. Visitors can expand items to read detailed contributions.
            </p>
          </div>
        </div>

        {/* SECTION VISIBILITY & LAYOUT STYLE BAR */}
        <div className="pt-3 border-t border-[#E8E4D9] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Public Profile Visibility Toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleToggleSectionVisibility}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono-code transition-all ${
                isSectionVisible
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              }`}
            >
              {isSectionVisible ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Timeline: Visible on Profile</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                  <span>Timeline: Hidden from Profile</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-[#6B665E] hidden sm:inline">
              {timeline.length} {timeline.length === 1 ? 'milestone' : 'milestones'} recorded
            </span>
          </div>

          {/* Treatment & Layout Switcher */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-mono-code text-[#6B665E]">Layout:</span>
            {[
              { id: 'roadmap', label: 'Roadmap Line' },
              { id: 'cards', label: 'Modular Cards' },
              { id: 'minimal', label: 'Minimal Table' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleChangeTimelineStyle(st.id as any)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono-code transition-all ${
                  activeStyle === st.id
                    ? 'bg-[#1C1B18] text-white border-[#1C1B18] font-bold shadow-2xs'
                    : 'bg-[#FAF8F5] text-[#6B665E] border-[#E8E4D9] hover:border-[#1C1B18]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK PRESET TEMPLATE PILLS */}
      <div className="p-3 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#6B665E]">
          <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
          <span>Quick Add Category:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { cat: 'Career', label: '+ Work Role', icon: Briefcase },
            { cat: 'Project', label: '+ Key Project', icon: FolderGit2 },
            { cat: 'OpenSource', label: '+ Open Source', icon: Sparkles },
            { cat: 'Education', label: '+ Degree / Study', icon: GraduationCap },
            { cat: 'Achievement', label: '+ Award / Honor', icon: Award },
          ].map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.cat}
                type="button"
                onClick={() => handleOpenAdd(btn.cat as TimelineItem['category'])}
                className="px-2.5 py-1 bg-white hover:bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#C85A32] text-[#1C1B18] text-xs font-mono-code rounded-lg flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <Icon className="w-3 h-3 text-[#C85A32]" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER, SEARCH, & SORT TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'Career', label: 'Work' },
            { id: 'Project', label: 'Projects' },
            { id: 'OpenSource', label: 'OSS' },
            { id: 'Education', label: 'Education' },
            { id: 'Achievement', label: 'Awards' },
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-mono-code whitespace-nowrap transition-all ${
                selectedCategory === c.id
                  ? 'bg-[#1C1B18] text-white border-[#1C1B18] font-bold shadow-2xs'
                  : 'bg-white text-[#6B665E] border-[#E8E4D9] hover:border-[#1C1B18]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Actions */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-[#6B665E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E8E4D9] rounded-xl text-xs font-mono-code focus:outline-none focus:border-[#C85A32]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center border border-[#E8E4D9] rounded-xl bg-white p-0.5">
            <button
              type="button"
              onClick={() => handleSortByYear(true)}
              className="p-1.5 text-[#6B665E] hover:text-[#1C1B18] rounded-lg hover:bg-black/5"
              title="Sort Newest First"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* TIMELINE ENTRIES LIST */}
      {timeline.length === 0 ? (
        <div className="p-10 border border-dashed border-[#E8E4D9] rounded-2xl bg-white text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center mx-auto text-[#C85A32]">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-serif-display text-base font-bold text-[#1C1B18]">
            No Timeline Milestones Yet
          </h3>
          <p className="text-xs text-[#6B665E] max-w-sm mx-auto">
            Chronicle your journey by adding your current work position, historical roles, standout projects, or educational milestones.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleAddPresetWork}
              className="px-4 py-2 bg-[#1C1B18] hover:bg-black text-white text-xs font-mono-code rounded-xl font-bold shadow-xs transition-all"
            >
              Load Starter Career Milestone
            </button>
            <button
              type="button"
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 bg-white border border-[#E8E4D9] hover:border-[#C85A32] text-[#1C1B18] text-xs font-mono-code rounded-xl shadow-xs transition-all"
            >
              + Create Custom Entry
            </button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-8 border border-[#E8E4D9] rounded-2xl bg-white text-center space-y-2">
          <p className="text-xs text-[#6B665E]">No milestones matched your search query or filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-mono-code text-[#C85A32] underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item, index) => {
            const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.Career;
            const CategoryIcon = catConfig.icon;

            return (
              <div
                key={item.id}
                className="p-4 bg-white border border-[#E8E4D9] hover:border-[#C85A32]/40 rounded-2xl shadow-xs transition-all group relative space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left info column */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Year badge */}
                      <span className="px-2 py-0.5 bg-[#1C1B18] text-[#FAF8F5] text-[10px] font-mono-code font-bold rounded-md">
                        {item.year}
                      </span>

                      {/* Category tag */}
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono-code font-bold rounded-md border flex items-center gap-1 ${catConfig.bg} ${catConfig.color} ${catConfig.border}`}
                      >
                        <CategoryIcon className="w-3 h-3" />
                        <span>{catConfig.label}</span>
                      </span>

                      {/* Current role pill */}
                      {item.current && (
                        <span className="px-1.5 py-0.2 text-[9px] font-mono-code font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded">
                          CURRENT
                        </span>
                      )}

                      {/* Verified badge */}
                      {item.verified && (
                        <span className="text-[10px] font-mono-code text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>

                    {/* Title and Organization */}
                    <div>
                      <h4 className="text-sm font-bold text-[#1C1B18] flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {item.organization && (
                          <span className="text-xs font-normal text-[#6B665E]">
                            @ <strong className="font-semibold text-[#1C1B18]">{item.organization}</strong>
                          </span>
                        )}
                      </h4>
                    </div>

                    {/* Description */}
                    {item.description && (
                      <p className="text-xs text-[#6B665E] leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Tags & Skills */}
                    {item.skillsOrTags && item.skillsOrTags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        {item.skillsOrTags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-md text-[10px] font-mono-code text-[#1C1B18]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Link */}
                    {item.linkUrl && (
                      <div className="pt-1">
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-mono-code text-[#C85A32] hover:underline"
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>{item.linkUrl.replace(/^https?:\/\//, '')}</span>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E8E4D9] w-full sm:w-auto justify-end">
                    {/* Reorder Buttons */}
                    <div className="flex items-center bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-[#6B665E] hover:text-[#1C1B18] disabled:opacity-30 disabled:pointer-events-none rounded"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === timeline.length - 1}
                        className="p-1 text-[#6B665E] hover:text-[#1C1B18] disabled:opacity-30 disabled:pointer-events-none rounded"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Duplicate */}
                    <button
                      type="button"
                      onClick={() => handleDuplicateItem(item)}
                      className="p-1.5 text-[#6B665E] hover:text-[#1C1B18] bg-white border border-[#E8E4D9] hover:border-[#1C1B18] rounded-lg transition-colors shadow-2xs"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-1.5 text-[#C85A32] hover:text-white bg-white hover:bg-[#C85A32] border border-[#E8E4D9] hover:border-[#C85A32] rounded-lg transition-all shadow-2xs"
                      title="Edit Milestone"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id, item.title)}
                      className="p-1.5 text-gray-400 hover:text-red-600 bg-white border border-[#E8E4D9] hover:border-red-300 rounded-lg transition-colors shadow-2xs"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT MILESTONE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-[#E8E4D9] rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8E4D9] pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-[#C85A32]/10 rounded-lg text-[#C85A32]">
                  <Clock className="w-5 h-5" />
                </span>
                <h3 className="font-serif-display text-lg font-bold text-[#1C1B18]">
                  {editingId ? 'Edit Timeline Milestone' : 'Add Work or Timeline Milestone'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#6B665E] hover:text-[#1C1B18] rounded-lg hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Category Selector */}
              <div>
                <label className="text-xs font-mono-code font-bold text-[#1C1B18] block mb-1.5">
                  Milestone Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    ['Career', 'Project', 'OpenSource', 'Education', 'Achievement'] as const
                  ).map((cat) => {
                    const cfg = CATEGORY_CONFIG[cat];
                    const Icon = cfg.icon;
                    const active = formData.category === cat;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          active
                            ? 'bg-[#1C1B18] text-white border-[#1C1B18] font-bold shadow-xs'
                            : 'bg-white text-[#1C1B18] border-[#E8E4D9] hover:border-[#1C1B18]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#C85A32]' : 'text-[#6B665E]'}`} />
                        <span className="text-xs font-mono-code">{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title / Role & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18] block mb-1">
                    Role / Position Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E8E4D9] rounded-xl text-xs font-sans-ui focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18] block mb-1">
                    Company / Organization / Studio
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Independent, MIT"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#E8E4D9] rounded-xl text-xs font-sans-ui focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              {/* Year / Period and Suggestions */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Time Period / Year
                  </label>
                  <div className="flex items-center gap-1 text-[10px] font-mono-code text-[#6B665E]">
                    <span>Suggestions:</span>
                    {['Present', '2026', '2025', '2024', '2022 — 2024'].map((sug) => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            year: sug === 'Present' ? `${new Date().getFullYear()} — Present` : sug,
                            current: sug === 'Present',
                          })
                        }
                        className="px-1.5 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded hover:border-[#1C1B18]"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 2024 — Present, or 2023"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E8E4D9] rounded-xl text-xs font-mono-code focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-mono-code font-bold text-[#1C1B18] block mb-1">
                  Description & Impact
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your primary responsibilities, technologies deployed, key milestones achieved, or team leadership..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E8E4D9] rounded-xl text-xs font-sans-ui focus:outline-none focus:border-[#C85A32] leading-relaxed"
                />
              </div>

              {/* Skills & Technologies */}
              <div>
                <label className="text-xs font-mono-code font-bold text-[#1C1B18] block mb-1">
                  Skills & Tools Used (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, TypeScript, Tailwind, System Architecture"
                  value={formData.skillsString}
                  onChange={(e) => setFormData({ ...formData, skillsString: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E8E4D9] rounded-xl text-xs font-mono-code focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* URL / Link */}
              <div>
                <label className="text-xs font-mono-code font-bold text-[#1C1B18] block mb-1">
                  Project or Organization URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://company.com or https://github.com/project"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#E8E4D9] rounded-xl text-xs font-mono-code focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              {/* Checkboxes: Current & Verified */}
              <div className="pt-2 border-t border-[#E8E4D9] flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-code select-none">
                  <input
                    type="checkbox"
                    checked={formData.current}
                    onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                    className="rounded border-[#E8E4D9] accent-[#C85A32]"
                  />
                  <span>Currently active / working here</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-mono-code select-none">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded border-[#E8E4D9] accent-[#C85A32]"
                  />
                  <span>Verified milestone</span>
                </label>
              </div>

              {/* Submit / Cancel Footer */}
              <div className="pt-3 border-t border-[#E8E4D9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E4D9] hover:border-[#1C1B18] rounded-xl text-xs font-mono-code text-[#6B665E] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C85A32] hover:bg-[#B34D28] text-white rounded-xl text-xs font-mono-code font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-98"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingId ? 'Save Changes' : 'Add Milestone'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
