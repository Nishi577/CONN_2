import React, { useState } from 'react';
import { ConnProfile, LinkItem, LinkCategory, CategoryMeta } from '../../types';
import {
  Plus,
  GripVertical,
  Star,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Link as LinkIcon,
  X,
  Check,
  Tag,
  BarChart2,
  FolderPlus,
  Folder,
  Layers,
  ChevronRight,
  Move,
  Settings,
} from 'lucide-react';

interface LinksManagerProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_CATEGORIES: string[] = [
  'Featured',
  'Writing & Essays',
  'Projects & Work',
  'Social & Media',
  'Podcasts & Audio',
  'Resources',
  'General',
];

export const LinksManager: React.FC<LinksManagerProps> = ({ profile, onChangeProfile, onShowToast }) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Category Collapsed states in Workspace
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Link Form state
  const [formTitle, setFormTitle] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<LinkCategory>('Writing & Essays');
  const [formBadge, setFormBadge] = useState('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formLinkType, setFormLinkType] = useState<'link' | 'project'>('link');
  const [formTechStack, setFormTechStack] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formLiveDemoUrl, setFormLiveDemoUrl] = useState('');

  // New Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editCatInputValue, setEditCatInputValue] = useState('');

  // Drag and Drop state
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);

  // Available categories list
  const customCatNames = profile.categoriesMeta?.map((c) => c.name) || [];
  const allCategories: string[] = Array.from(new Set([...DEFAULT_CATEGORIES, ...customCatNames]));

  const resetForm = () => {
    setFormTitle('');
    setFormUrl('');
    setFormDescription('');
    setFormCategory('Writing & Essays');
    setFormBadge('');
    setFormThumbnailUrl('');
    setFormIsFeatured(false);
    setFormLinkType('link');
    setFormTechStack('');
    setFormGithubUrl('');
    setFormLiveDemoUrl('');
    setEditingLinkId(null);
  };

  const openAddModal = (defaultCat?: string) => {
    resetForm();
    if (defaultCat) {
      setFormCategory(defaultCat);
    }
    setIsAddModalOpen(true);
  };

  const openEditModal = (link: LinkItem) => {
    setEditingLinkId(link.id);
    setFormTitle(link.title);
    setFormUrl(link.url);
    setFormDescription(link.description || '');
    setFormCategory(link.category);
    setFormBadge(link.badge || '');
    setFormThumbnailUrl(link.thumbnailUrl || '');
    setFormIsFeatured(!!link.isFeatured);
    setFormLinkType(link.linkType || 'link');
    setFormTechStack(link.techStack ? link.techStack.join(', ') : '');
    setFormGithubUrl(link.githubUrl || '');
    setFormLiveDemoUrl(link.liveDemoUrl || '');
    setIsAddModalOpen(true);
  };

  const handleSaveLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formUrl.trim()) {
      onShowToast('Please provide a title and valid URL');
      return;
    }

    let finalUrl = formUrl.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`;
    }

    let finalGithub = formGithubUrl.trim();
    if (finalGithub && !finalGithub.startsWith('http://') && !finalGithub.startsWith('https://')) {
      finalGithub = `https://${finalGithub}`;
    }

    let finalLiveDemo = formLiveDemoUrl.trim();
    if (finalLiveDemo && !finalLiveDemo.startsWith('http://') && !finalLiveDemo.startsWith('https://')) {
      finalLiveDemo = `https://${finalLiveDemo}`;
    }

    const parsedTechStack = formTechStack
      ? formTechStack.split(',').map((s) => s.trim()).filter(Boolean)
      : undefined;

    if (editingLinkId) {
      const updatedLinks = profile.links.map((l) => {
        if (l.id === editingLinkId) {
          return {
            ...l,
            title: formTitle.trim(),
            url: finalUrl,
            description: formDescription.trim() || undefined,
            category: formCategory,
            badge: formBadge.trim() || undefined,
            thumbnailUrl: formThumbnailUrl.trim() || undefined,
            isFeatured: formIsFeatured,
            linkType: formLinkType,
            techStack: parsedTechStack,
            githubUrl: finalGithub || undefined,
            liveDemoUrl: finalLiveDemo || undefined,
          };
        }
        return formIsFeatured ? { ...l, isFeatured: false } : l;
      });
      onChangeProfile({ ...profile, links: updatedLinks });
      onShowToast(`Updated "${formTitle}"`);
    } else {
      const newLink: LinkItem = {
        id: `link-${Date.now()}`,
        title: formTitle.trim(),
        url: finalUrl,
        description: formDescription.trim() || undefined,
        category: formCategory,
        badge: formBadge.trim() || undefined,
        thumbnailUrl: formThumbnailUrl.trim() || undefined,
        isFeatured: formIsFeatured,
        isActive: true,
        clicks: 0,
        order: profile.links.length + 1,
        iconName: formLinkType === 'project' ? 'Folder' : 'ArrowUpRight',
        linkType: formLinkType,
        techStack: parsedTechStack,
        githubUrl: finalGithub || undefined,
        liveDemoUrl: finalLiveDemo || undefined,
      };

      const updatedLinks = formIsFeatured
        ? profile.links.map((l) => ({ ...l, isFeatured: false })).concat(newLink)
        : [...profile.links, newLink];

      onChangeProfile({ ...profile, links: updatedLinks });
      onShowToast(`Added "${formTitle}" to ${formCategory}`);
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleDeleteLink = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      const updatedLinks = profile.links.filter((l) => l.id !== id);
      onChangeProfile({ ...profile, links: updatedLinks });
      onShowToast(`Deleted "${title}"`);
    }
  };

  const handleToggleActive = (id: string) => {
    const updatedLinks = profile.links.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l));
    onChangeProfile({ ...profile, links: updatedLinks });
  };

  const handleToggleFeatured = (id: string) => {
    const updatedLinks = profile.links.map((l) => ({
      ...l,
      isFeatured: l.id === id ? !l.isFeatured : false,
    }));
    onChangeProfile({ ...profile, links: updatedLinks });
    onShowToast('Updated featured link highlight');
  };

  // Reorder links via buttons
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= profile.links.length) return;

    const newLinks = [...profile.links];
    const temp = newLinks[index];
    newLinks[index] = newLinks[targetIndex];
    newLinks[targetIndex] = temp;

    const reordered = newLinks.map((item, idx) => ({ ...item, order: idx + 1 }));
    onChangeProfile({ ...profile, links: reordered });
  };

  // Category CRUD
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const catName = newCatName.trim();

    const existingMetas = profile.categoriesMeta || [];
    if (existingMetas.some((c) => c.name.toLowerCase() === catName.toLowerCase())) {
      onShowToast('Category already exists');
      return;
    }

    const newMeta: CategoryMeta = {
      name: catName,
      order: existingMetas.length + 1,
      isCollapsedByDefault: false,
    };

    onChangeProfile({
      ...profile,
      categoriesMeta: [...existingMetas, newMeta],
    });

    onShowToast(`Created category "${catName}"`);
    setNewCatName('');
  };

  const handleRenameCategory = (oldName: string) => {
    if (!editCatInputValue.trim() || editCatInputValue.trim() === oldName) {
      setEditingCatName(null);
      return;
    }
    const newName = editCatInputValue.trim();

    // Update links category reference
    const updatedLinks = profile.links.map((l) => (l.category === oldName ? { ...l, category: newName } : l));

    // Update category meta
    const updatedMetas = (profile.categoriesMeta || []).map((c) =>
      c.name === oldName ? { ...c, name: newName } : c
    );

    onChangeProfile({
      ...profile,
      links: updatedLinks,
      categoriesMeta: updatedMetas,
    });

    onShowToast(`Renamed category to "${newName}"`);
    setEditingCatName(null);
  };

  const handleToggleCategoryCollapseDefault = (catName: string) => {
    const existingMetas = profile.categoriesMeta || [];
    const metaIndex = existingMetas.findIndex((c) => c.name === catName);

    let updatedMetas: CategoryMeta[];
    if (metaIndex >= 0) {
      updatedMetas = existingMetas.map((c) =>
        c.name === catName ? { ...c, isCollapsedByDefault: !c.isCollapsedByDefault } : c
      );
    } else {
      updatedMetas = [
        ...existingMetas,
        {
          name: catName,
          order: existingMetas.length + 1,
          isCollapsedByDefault: true,
        },
      ];
    }

    onChangeProfile({ ...profile, categoriesMeta: updatedMetas });
    onShowToast(`Toggled default collapse state for "${catName}"`);
  };

  const handleDeleteCategory = (catName: string) => {
    if (confirm(`Delete category "${catName}"? Links in this category will move to "General".`)) {
      const updatedLinks = profile.links.map((l) => (l.category === catName ? { ...l, category: 'General' } : l));
      const updatedMetas = (profile.categoriesMeta || []).filter((c) => c.name !== catName);

      onChangeProfile({ ...profile, links: updatedLinks, categoriesMeta: updatedMetas });
      onShowToast(`Deleted category "${catName}"`);
    }
  };

  // DRAG & DROP HANDLERS (Within and Across Categories)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedLinkId(id);
  };

  const handleDragOverLink = (e: React.DragEvent, targetLinkId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverLinkId !== targetLinkId) {
      setDragOverLinkId(targetLinkId);
    }
  };

  const handleDragOverCategory = (e: React.DragEvent, categoryName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCategory !== categoryName) {
      setDragOverCategory(categoryName);
    }
  };

  const handleDropOnLink = (e: React.DragEvent, targetLink: LinkItem) => {
    e.preventDefault();
    e.stopPropagation();

    const draggedId = draggedLinkId || e.dataTransfer.getData('text/plain');
    if (!draggedId || draggedId === targetLink.id) {
      setDraggedLinkId(null);
      setDragOverLinkId(null);
      setDragOverCategory(null);
      return;
    }

    const draggedLink = profile.links.find((l) => l.id === draggedId);
    if (!draggedLink) return;

    const sourceCategory = draggedLink.category;
    const targetCategory = targetLink.category;

    // Create a copy of links
    let newLinks = [...profile.links];

    // Remove dragged link from original array
    newLinks = newLinks.filter((l) => l.id !== draggedId);

    // Update dragged link's category to match target link
    const updatedDraggedLink = {
      ...draggedLink,
      category: targetCategory,
    };

    // Find insertion index of target link
    const targetIndex = newLinks.findIndex((l) => l.id === targetLink.id);
    if (targetIndex >= 0) {
      newLinks.splice(targetIndex, 0, updatedDraggedLink);
    } else {
      newLinks.push(updatedDraggedLink);
    }

    // Atomically re-assign order numbers
    const reorderedLinks = newLinks.map((item, idx) => ({ ...item, order: idx + 1 }));

    onChangeProfile({
      ...profile,
      links: reorderedLinks,
    });

    if (sourceCategory !== targetCategory) {
      onShowToast(`Moved "${draggedLink.title}" to ${targetCategory}`);
    } else {
      onShowToast(`Reordered "${draggedLink.title}"`);
    }

    setDraggedLinkId(null);
    setDragOverLinkId(null);
    setDragOverCategory(null);
  };

  const handleDropOnCategory = (e: React.DragEvent, targetCategory: string) => {
    e.preventDefault();

    const draggedId = draggedLinkId || e.dataTransfer.getData('text/plain');
    if (!draggedId) return;

    const draggedLink = profile.links.find((l) => l.id === draggedId);
    if (!draggedLink) return;

    const sourceCategory = draggedLink.category;

    // Remove from array and push to end of category
    let newLinks = profile.links.filter((l) => l.id !== draggedId);

    const updatedDraggedLink = {
      ...draggedLink,
      category: targetCategory,
    };

    // Find last index of this category or just append
    const lastCatIndex = newLinks.map((l) => l.category).lastIndexOf(targetCategory);
    if (lastCatIndex >= 0) {
      newLinks.splice(lastCatIndex + 1, 0, updatedDraggedLink);
    } else {
      newLinks.push(updatedDraggedLink);
    }

    const reorderedLinks = newLinks.map((item, idx) => ({ ...item, order: idx + 1 }));

    onChangeProfile({
      ...profile,
      links: reorderedLinks,
    });

    if (sourceCategory !== targetCategory) {
      onShowToast(`Moved "${draggedLink.title}" to ${targetCategory}`);
    }

    setDraggedLinkId(null);
    setDragOverLinkId(null);
    setDragOverCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedLinkId(null);
    setDragOverLinkId(null);
    setDragOverCategory(null);
  };

  // Grouped links helper
  const usedCategories = Array.from(new Set(profile.links.map((l) => l.category)));
  const displayCategories = Array.from(new Set([...usedCategories, ...customCatNames]));

  const filteredLinks = profile.links.filter((l) => {
    if (selectedCategoryFilter === 'All') return true;
    return l.category === selectedCategoryFilter;
  });

  return (
    <div className="space-y-6 font-sans-ui text-[#1C1B18]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E4D9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#1C1B18] text-[#FAF8F5] rounded-lg">
              <LinkIcon className="w-4 h-4 text-[#C85A32]" />
            </span>
            <h2 className="font-serif-display text-2xl font-normal text-[#1C1B18]">Links & Content Library</h2>
          </div>
          <p className="text-xs text-[#6B665E] mt-1">
            Curate essays, projects, music, and resources. Drag cards to reorder or move across categories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#E8E4D9] hover:border-[#1C1B18] text-[#1C1B18] text-xs font-medium rounded-xl transition-all shadow-2xs"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>Manage Categories</span>
          </button>

          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-2 px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl shadow-xs transition-all hover:scale-102"
          >
            <Plus className="w-4 h-4 text-[#D49A3E]" />
            <span>Add New Link</span>
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
            Links appear as clean, typography-driven cards grouped under their category headers. Star any item as <strong>"Featured"</strong> to pin it prominently at the top of your public page. Every visitor click is counted in your private analytics.
          </p>
        </div>
      </div>

      {/* Filter and View mode options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
          <button
            onClick={() => setSelectedCategoryFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors ${
              selectedCategoryFilter === 'All'
                ? 'bg-[#1C1B18] text-[#FAF8F5]'
                : 'bg-[#E8E4D9]/40 text-[#6B665E] hover:text-[#1C1B18]'
            }`}
          >
            All ({profile.links.length})
          </button>
          {allCategories.map((cat) => {
            const count = profile.links.filter((l) => l.category === cat).length;
            if (count === 0 && selectedCategoryFilter !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg shrink-0 transition-colors ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#1C1B18] text-[#FAF8F5]'
                    : 'bg-[#E8E4D9]/40 text-[#6B665E] hover:text-[#1C1B18]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* View toggle button */}
        <div className="flex items-center bg-[#E8E4D9]/50 p-1 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'grouped' ? 'bg-white text-[#1C1B18] shadow-2xs' : 'text-[#6B665E]'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Grouped View</span>
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
              viewMode === 'flat' ? 'bg-white text-[#1C1B18] shadow-2xs' : 'text-[#6B665E]'
            }`}
          >
            <BarChart2 className="w-3 h-3" />
            <span>Flat Stream</span>
          </button>
        </div>
      </div>

      {/* NO LINKS EMPTY STATE */}
      {profile.links.length === 0 ? (
        <div className="p-10 text-center border-2 border-dashed border-[#E8E4D9] rounded-2xl bg-[#FAF8F5]/50 my-6">
          <div className="w-12 h-12 rounded-full bg-[#E8E4D9]/60 text-[#6B665E] flex items-center justify-center mx-auto mb-3">
            <LinkIcon className="w-5 h-5" />
          </div>
          <h3 className="font-serif-display text-xl mb-1 text-[#1C1B18]">You haven&apos;t added any links yet.</h3>
          <p className="text-xs text-[#6B665E] max-w-sm mx-auto mb-5">
            Share your essays, portfolio, music, or newsletters in a clean editorial stream.
          </p>
          <button
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-colors"
          >
            + Add Your First Link
          </button>
        </div>
      ) : viewMode === 'grouped' && selectedCategoryFilter === 'All' ? (
        /* GROUPED CATEGORIES VIEW WITH CROSS-CATEGORY DRAG & DROP */
        <div className="space-y-6">
          {displayCategories.map((categoryName) => {
            const categoryLinks = profile.links.filter((l) => l.category === categoryName);
            const isCollapsed = !!collapsedCategories[categoryName];
            const meta = profile.categoriesMeta?.find((c) => c.name === categoryName);

            return (
              <div
                key={categoryName}
                onDragOver={(e) => handleDragOverCategory(e, categoryName)}
                onDrop={(e) => handleDropOnCategory(e, categoryName)}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  dragOverCategory === categoryName
                    ? 'border-[#C85A32] ring-2 ring-[#C85A32]/20 bg-[#C85A32]/5'
                    : 'border-[#E8E4D9] bg-white'
                }`}
              >
                {/* Category Header Bar */}
                <div className="p-4 bg-[#FAF8F5] border-b border-[#E8E4D9] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        setCollapsedCategories((prev) => ({
                          ...prev,
                          [categoryName]: !prev[categoryName],
                        }))
                      }
                      className="p-1 hover:bg-[#E8E4D9]/60 rounded-lg text-[#6B665E] hover:text-[#1C1B18] transition-colors"
                    >
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${!isCollapsed ? 'rotate-90' : ''}`}
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-[#C85A32]" />
                      <h3 className="font-serif-display text-base font-normal text-[#1C1B18]">{categoryName}</h3>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 bg-[#E8E4D9]/60 text-[#6B665E] rounded-full">
                        {categoryLinks.length} {categoryLinks.length === 1 ? 'item' : 'items'}
                      </span>
                      {meta?.isCollapsedByDefault && (
                        <span className="text-[9px] font-mono-code px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md">
                          Collapsed by default
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => openAddModal(categoryName)}
                    className="text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>

                {/* Category Links List */}
                {!isCollapsed && (
                  <div className="p-3 space-y-2.5 min-h-[50px]">
                    {categoryLinks.length === 0 ? (
                      <div className="p-4 text-center border-2 border-dashed border-[#E8E4D9]/60 rounded-xl text-xs text-[#6B665E]">
                        Drag a link card here to assign it to <strong>{categoryName}</strong>.
                      </div>
                    ) : (
                      categoryLinks.map((link) => (
                        <div
                          key={link.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, link.id)}
                          onDragOver={(e) => handleDragOverLink(e, link.id)}
                          onDrop={(e) => handleDropOnLink(e, link)}
                          onDragEnd={handleDragEnd}
                          className={`group flex items-center justify-between p-3.5 bg-white border rounded-xl shadow-2xs transition-all duration-200 cursor-grab active:cursor-grabbing ${
                            draggedLinkId === link.id
                              ? 'opacity-40 border-dashed border-[#1C1B18]'
                              : dragOverLinkId === link.id
                              ? 'border-[#C85A32] ring-2 ring-[#C85A32]/30 scale-[1.01]'
                              : 'border-[#E8E4D9] hover:border-[#1C1B18]'
                          } ${!link.isActive ? 'opacity-60 bg-[#FAF8F5]' : ''}`}
                        >
                          {/* Drag handle & Left Content */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="text-[#6B665E] group-hover:text-[#1C1B18] p-1 cursor-grab">
                              <GripVertical className="w-4 h-4" />
                            </div>

                            <button
                              onClick={() => handleToggleFeatured(link.id)}
                              title={link.isFeatured ? 'Featured Highlight' : 'Set as Featured'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                link.isFeatured
                                  ? 'bg-[#C85A32]/10 border-[#C85A32] text-[#C85A32]'
                                  : 'border-[#E8E4D9] text-[#6B665E] hover:text-[#1C1B18]'
                              }`}
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                            </button>

                            {link.thumbnailUrl ? (
                              <img
                                src={link.thumbnailUrl}
                                alt=""
                                className="w-9 h-9 rounded-lg object-cover border border-[#E8E4D9] shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center shrink-0 text-[#6B665E]">
                                <LinkIcon className="w-3.5 h-3.5" />
                              </div>
                            )}

                            <div className="min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-medium text-[#1C1B18] truncate">{link.title}</h4>
                                {link.linkType === 'project' && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#C85A32] text-white rounded uppercase tracking-wider shrink-0">
                                    Project
                                  </span>
                                )}
                                {link.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#1C1B18] text-[#FAF8F5] rounded uppercase tracking-wider shrink-0">
                                    {link.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#6B665E] truncate font-mono-code mt-0.5">
                                {link.url}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono-code px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-md text-[#6B665E]">
                              <BarChart2 className="w-3 h-3 text-[#1C1B18]" />
                              {link.clicks}
                            </span>

                            <button
                              onClick={() => handleToggleActive(link.id)}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                link.isActive
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                  : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                              }`}
                            >
                              {link.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>

                            <button
                              onClick={() => openEditModal(link)}
                              className="p-1.5 border border-[#E8E4D9] hover:border-[#1C1B18] text-[#6B665E] hover:text-[#1C1B18] rounded-lg transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteLink(link.id, link.title)}
                              className="p-1.5 border border-[#E8E4D9] hover:border-red-300 text-[#6B665E] hover:text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* FLAT STREAM VIEW WITH REORDER BUTTONS */
        <div className="space-y-3">
          {filteredLinks.map((link, index) => (
            <div
              key={link.id}
              className={`group flex items-center justify-between p-4 bg-[#FFFFFF] border rounded-xl shadow-2xs transition-all duration-200 hover:border-[#1C1B18] ${
                !link.isActive ? 'opacity-60 bg-[#FAF8F5]' : ''
              } ${link.isFeatured ? 'ring-1 ring-[#C85A32]/40 border-[#C85A32]' : 'border-[#E8E4D9]'}`}
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className="flex flex-col text-[#6B665E] hover:text-[#1C1B18] shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-0.5 hover:bg-[#E8E4D9]/50 rounded disabled:opacity-20"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === filteredLinks.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-0.5 hover:bg-[#E8E4D9]/50 rounded disabled:opacity-20"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => handleToggleFeatured(link.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    link.isFeatured
                      ? 'bg-[#C85A32]/10 border-[#C85A32] text-[#C85A32]'
                      : 'border-[#E8E4D9] text-[#6B665E] hover:text-[#1C1B18]'
                  }`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>

                {link.thumbnailUrl ? (
                  <img
                    src={link.thumbnailUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover border border-[#E8E4D9] shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-[#FAF8F5] border border-[#E8E4D9] flex items-center justify-center shrink-0 text-[#6B665E]">
                    <LinkIcon className="w-4 h-4" />
                  </div>
                )}

                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-[#1C1B18] truncate">{link.title}</h4>
                    <span className="text-[10px] font-mono-code px-2 py-0.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded text-[#6B665E]">
                      {link.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B665E] truncate font-mono-code mt-0.5">
                    {link.url}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggleActive(link.id)}
                  className={`p-2 rounded-lg border transition-colors ${
                    link.isActive
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                  }`}
                >
                  {link.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => openEditModal(link)}
                  className="p-2 border border-[#E8E4D9] hover:border-[#1C1B18] text-[#6B665E] hover:text-[#1C1B18] rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDeleteLink(link.id, link.title)}
                  className="p-2 border border-[#E8E4D9] hover:border-red-300 text-[#6B665E] hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORY MANAGER MODAL (#categoryModal) */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 relative font-sans-ui space-y-6">
            <button
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="font-serif-display text-2xl text-[#1C1B18] mb-1">Category Management</h3>
              <p className="text-xs text-[#6B665E]">
                Create custom categories, rename existing ones, or configure default collapsed states.
              </p>
            </div>

            {/* Add New Category Form */}
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                placeholder="New category name (e.g. Design Systems)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-colors shrink-0"
              >
                + Add
              </button>
            </form>

            {/* Categories List */}
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {allCategories.map((catName) => {
                const count = profile.links.filter((l) => l.category === catName).length;
                const meta = profile.categoriesMeta?.find((c) => c.name === catName);
                const isEditing = editingCatName === catName;

                return (
                  <div
                    key={catName}
                    className="p-3 bg-white border border-[#E8E4D9] rounded-xl flex items-center justify-between text-xs"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editCatInputValue}
                          onChange={(e) => setEditCatInputValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameCategory(catName)}
                          className="p-1 bg-[#1C1B18] text-white rounded-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <Folder className="w-4 h-4 text-[#C85A32] shrink-0" />
                        <span className="font-medium truncate">{catName}</span>
                        <span className="text-[10px] text-[#6B665E] font-mono-code">({count})</span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleCategoryCollapseDefault(catName)}
                          className={`px-2 py-1 text-[10px] font-mono-code rounded-lg border transition-colors ${
                            meta?.isCollapsedByDefault
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-700'
                          }`}
                          title="Toggle collapse default on public profile"
                        >
                          {meta?.isCollapsedByDefault ? 'Collapsed Default' : 'Expanded Default'}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingCatName(catName);
                            setEditCatInputValue(catName);
                          }}
                          className="p-1 text-[#6B665E] hover:text-[#1C1B18]"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!DEFAULT_CATEGORIES.includes(catName) && (
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(catName)}
                            className="p-1 text-[#6B665E] hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#E8E4D9] flex justify-end">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT LINK MODAL (#linkModal) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-[#FAF8F5] text-[#1C1B18] rounded-2xl border border-[#E8E4D9] shadow-2xl p-6 sm:p-7 relative font-sans-ui">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                resetForm();
              }}
              className="absolute top-5 right-5 p-2 text-[#6B665E] hover:text-[#1C1B18] rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif-display text-2xl mb-1 text-[#1C1B18]">
              {editingLinkId ? 'Edit Link' : 'Add New Link'}
            </h3>
            <p className="text-xs text-[#6B665E] mb-6">
              Configure title, category, destination URL, and featured visual treatments.
            </p>

            <form onSubmit={handleSaveLink} className="space-y-4">
              {/* Link Type Selector */}
              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                  Card Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#E8E4D9]/40 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFormLinkType('link')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      formLinkType === 'link'
                        ? 'bg-white text-[#1C1B18] shadow-2xs font-semibold'
                        : 'text-[#6B665E] hover:text-[#1C1B18]'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Standard Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormLinkType('project')}
                    className={`py-2 px-3 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      formLinkType === 'project'
                        ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-2xs font-semibold'
                        : 'text-[#6B665E] hover:text-[#1C1B18]'
                    }`}
                  >
                    <Folder className="w-3.5 h-3.5 text-[#C85A32]" />
                    <span>Project Showcase</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                  Link Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={formLinkType === 'project' ? 'e.g. Kernel Architecture v2' : 'e.g. On Digital Quietude Essay'}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                  Destination URL *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://yourwebsite.com/article"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18] transition-colors"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. NEW, ESSAY, SHOWCASE"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl uppercase font-bold focus:border-[#1C1B18] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                  Description / Excerpt (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short context about this link or project..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1.5">
                  {formLinkType === 'project' ? 'Project Banner / Image URL' : 'Thumbnail Image URL (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formThumbnailUrl}
                  onChange={(e) => setFormThumbnailUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18] transition-colors"
                />
              </div>

              {/* PROJECT SHOWCASE SPECIFIC FIELDS */}
              {formLinkType === 'project' && (
                <div className="p-3.5 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C85A32]">
                    <Folder className="w-3.5 h-3.5" />
                    <span>Project Showcase Settings</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                      Tech Stack (Comma Separated)
                    </label>
                    <input
                      type="text"
                      placeholder="TypeScript, React, Tailwind, Canvas API"
                      value={formTechStack}
                      onChange={(e) => setFormTechStack(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-lg focus:border-[#1C1B18]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                        GitHub Repo URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="https://github.com/user/repo"
                        value={formGithubUrl}
                        onChange={(e) => setFormGithubUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-lg font-mono-code focus:border-[#1C1B18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                        Live Demo URL (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="https://demo.app"
                        value={formLiveDemoUrl}
                        onChange={(e) => setFormLiveDemoUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-lg font-mono-code focus:border-[#1C1B18]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Featured checkbox */}
              <div className="pt-2 border-t border-[#E8E4D9]">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-[#1C1B18] border-[#E8E4D9] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-medium text-[#1C1B18]">Highlight as Featured Link</span>
                    <p className="text-[11px] text-[#6B665E]">
                      Featured links are prominently rendered at the top with a hero card layout.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E4D9]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2.5 text-xs font-medium text-[#6B665E] hover:text-[#1C1B18] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1C1B18] text-[#FAF8F5] hover:bg-[#33312B] text-xs font-medium rounded-xl transition-all shadow-xs"
                >
                  {editingLinkId ? 'Save Changes' : 'Create Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
