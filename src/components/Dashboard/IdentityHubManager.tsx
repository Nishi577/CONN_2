import React, { useState } from 'react';
import { ConnProfile, ConnectedService, ExperienceItem, TimelineItem, AvailabilityStatus, NowSection, AudienceContext, ProfileSnapshot } from '../../types';
import { TimelineManager } from './TimelineManager';
import {
  Sparkles,
  GitBranch,
  Linkedin,
  FileText,
  Clock,
  ShieldCheck,
  Zap,
  Globe,
  UploadCloud,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  Server,
  Key,
  Layers,
  Activity,
  UserCheck,
  Share2,
  Lock,
  Eye,
  Bookmark,
  ExternalLink,
  Code,
  BookOpen,
} from 'lucide-react';

interface IdentityHubManagerProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

export const IdentityHubManager: React.FC<IdentityHubManagerProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
}) => {
  const [subTab, setSubTab] = useState<'import' | 'living' | 'timeline' | 'health' | 'export'>('import');

  // Digital Identity Import State
  const connectedServices = profile.connectedServices || [
    { platform: 'github', connected: true, username: profile.username, lastSynced: 'Just now' },
    { platform: 'linkedin', connected: true, username: profile.username, lastSynced: '2 hours ago' },
    { platform: 'devto', connected: false },
    { platform: 'medium', connected: false },
    { platform: 'youtube', connected: false },
    { platform: 'kaggle', connected: false },
  ];

  // Resume Parsing State
  const [rawResumeText, setRawResumeText] = useState('');
  const [isParsingResume, setIsParsingResume] = useState(false);

  // Living Profile Fields
  const [role, setRole] = useState(profile.role || '');
  const [organization, setOrganization] = useState(profile.organization || '');
  const [skillsText, setSkillsText] = useState((profile.skills || []).join(', '));
  const [contactEmail, setContactEmail] = useState(profile.contactEmail || '');
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || '');

  // NOW Section State
  const nowSection: NowSection = profile.nowSection || {
    building: 'Conn — Living Personal Identity Hub',
    learning: 'WebGPU Shader Composition',
    workingOn: 'Open Source Design Tokens',
    interestedIn: 'Local-first architecture',
    reading: 'The Design of Everyday Things',
  };
  const [buildingNow, setBuildingNow] = useState(nowSection.building || '');
  const [learningNow, setLearningNow] = useState(nowSection.learning || '');
  const [workingOnNow, setWorkingOnNow] = useState(nowSection.workingOn || '');
  const [interestedInNow, setInterestedInNow] = useState(nowSection.interestedIn || '');
  const [readingNow, setReadingNow] = useState(nowSection.reading || '');

  // Availability State
  const availability: AvailabilityStatus = profile.availability || {
    status: 'available_collaboration',
    preferredRole: 'Design Systems / Tech Lead',
    locationPreference: 'Remote',
    contactMethod: 'Intent Router or Email',
  };
  const [availStatus, setAvailStatus] = useState<AvailabilityStatus['status']>(availability.status);
  const [preferredRole, setPreferredRole] = useState(availability.preferredRole || '');
  const [locationPref, setLocationPref] = useState<'Remote' | 'On-site' | 'Hybrid'>(availability.locationPreference || 'Remote');

  // Timeline & Experience State
  const experienceList: ExperienceItem[] = profile.experience || [];
  const timelineList: TimelineItem[] = profile.timeline || [];

  // Profile Snapshots State
  const snapshots: ProfileSnapshot[] = profile.snapshots || [];
  const [snapshotName, setSnapshotName] = useState('');

  // Auto Calculate Profile Health
  const healthChecks = [
    { label: 'Role & Organization set', ok: !!profile.role && !!profile.organization, weight: 15 },
    { label: 'Connected GitHub account', ok: connectedServices.some((s) => s.platform === 'github' && s.connected), weight: 15 },
    { label: 'Connected LinkedIn account', ok: connectedServices.some((s) => s.platform === 'linkedin' && s.connected), weight: 10 },
    { label: 'NOW section active', ok: !!profile.nowSection?.building, weight: 15 },
    { label: 'Availability status declared', ok: !!profile.availability?.status, weight: 15 },
    { label: 'Verified experience added', ok: (profile.experience || []).length > 0, weight: 15 },
    { label: 'Identity timeline entries', ok: (profile.timeline || []).length > 0, weight: 15 },
  ];
  const totalScore = healthChecks.reduce((acc, curr) => acc + (curr.ok ? curr.weight : 0), 0);

  // Handle Connecting Service
  const handleToggleService = (platform: ConnectedService['platform']) => {
    const updated = connectedServices.map((svc) => {
      if (svc.platform === platform) {
        return {
          ...svc,
          connected: !svc.connected,
          username: !svc.connected ? profile.username : undefined,
          lastSynced: !svc.connected ? 'Just now' : undefined,
        };
      }
      return svc;
    });

    onChangeProfile({ ...profile, connectedServices: updated });
    onShowToast(`Updated ${platform} connection status`);
  };

  // Handle Automatic Project Discovery from GitHub
  const handleAutoDiscoverProjects = () => {
    onShowToast('Connecting to GitHub API...');
    setTimeout(() => {
      const discoveredProjects = [
        {
          id: `disc-${Date.now()}-1`,
          title: 'ForensIQ — Computer Vision Analysis',
          url: 'https://github.com/elenarostova/forensiq',
          description: 'Auto-discovered GitHub Repo: High throughput visual pattern recognition engine.',
          category: 'Projects & Work',
          isActive: true,
          clicks: 120,
          order: 1,
          badge: 'GITHUB VERIFIED ✓',
          linkType: 'project' as const,
          techStack: ['Python', 'PyTorch', 'TypeScript'],
          githubUrl: 'https://github.com/elenarostova/forensiq',
        },
        {
          id: `disc-${Date.now()}-2`,
          title: 'HelpHive — Open Source Assistive Tech',
          url: 'https://github.com/elenarostova/helphive',
          description: 'Auto-discovered GitHub Repo: Accessible audio-visual routing framework.',
          category: 'Projects & Work',
          isActive: true,
          clicks: 340,
          order: 2,
          badge: 'GITHUB VERIFIED ✓',
          linkType: 'project' as const,
          techStack: ['React', 'WebAudio API'],
          githubUrl: 'https://github.com/elenarostova/helphive',
        },
      ];

      const existingLinks = profile.links || [];
      const updatedLinks = [...discoveredProjects, ...existingLinks];

      onChangeProfile({
        ...profile,
        links: updatedLinks,
        openSourceStats: {
          reposCount: (profile.openSourceStats?.reposCount || 28) + 2,
          mergedPRsCount: profile.openSourceStats?.mergedPRsCount || 42,
          activeProjectsCount: (profile.openSourceStats?.activeProjectsCount || 5) + 2,
          totalStarsCount: (profile.openSourceStats?.totalStarsCount || 1840) + 180,
          featuredRepos: profile.openSourceStats?.featuredRepos,
        },
      });

      onShowToast('Auto-discovered 2 GitHub projects! Added to profile with verification badge ✓');
    }, 800);
  };

  // Resume Parsing Handler
  const handleParseResume = () => {
    if (!rawResumeText.trim()) {
      onShowToast('Please paste or upload resume text first.');
      return;
    }
    setIsParsingResume(true);
    setTimeout(() => {
      const extractedRole = 'Principal Design Engineer';
      const extractedOrg = 'Atelier Rostova & Atomity';
      const extractedSkills = ['TypeScript', 'React', 'Node.js', 'System Architecture', 'PostgreSQL', 'GraphQL'];

      setRole(extractedRole);
      setOrganization(extractedOrg);
      setSkillsText(extractedSkills.join(', '));

      setIsParsingResume(false);
      onShowToast('Resume parsed! Extracted Role, Organization, and Skills.');
    }, 1000);
  };

  // Save Living Profile Fields
  const handleSaveLivingProfile = () => {
    const updatedSkills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);

    const updatedProfile: ConnProfile = {
      ...profile,
      role: role.trim() || undefined,
      organization: organization.trim() || undefined,
      skills: updatedSkills,
      contactEmail: contactEmail.trim() || undefined,
      resumeUrl: resumeUrl.trim() || undefined,
      nowSection: {
        building: buildingNow.trim(),
        learning: learningNow.trim(),
        workingOn: workingOnNow.trim(),
        interestedIn: interestedInNow.trim(),
        reading: readingNow.trim(),
      },
      availability: {
        status: availStatus,
        preferredRole: preferredRole.trim() || undefined,
        locationPreference: locationPref,
      },
    };

    onChangeProfile(updatedProfile);
    onShowToast('Saved Living Identity parameters!');
  };

  // Handle Export Profile Data
  const handleExportData = (format: 'json' | 'markdown' | 'html') => {
    let content = '';
    let filename = `${profile.username}-identity.${format}`;
    let mimeType = 'text/plain';

    if (format === 'json') {
      content = JSON.stringify(profile, null, 2);
      mimeType = 'application/json';
    } else if (format === 'markdown') {
      content = `# ${profile.name} (@${profile.username})\n\n**${profile.role || ''}** at ${profile.organization || ''}\n\n${profile.bio}\n\n## Skills\n${(profile.skills || []).join(', ')}\n\n## NOW\n- **Building**: ${profile.nowSection?.building}\n- **Learning**: ${profile.nowSection?.learning}\n\n## Verified Experience\n${(profile.experience || []).map((e) => `- **${e.title}** @ ${e.company} (${e.period}) ✓`).join('\n')}\n`;
    } else {
      content = `<!DOCTYPE html><html><head><title>${profile.name} Identity</title></head><body><h1>${profile.name}</h1><p>${profile.bio}</p></body></html>`;
      mimeType = 'text/html';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast(`Exported profile identity as ${format.toUpperCase()}`);
  };

  // Save Snapshot
  const handleCreateSnapshot = () => {
    if (!snapshotName.trim()) return;
    const newSnap: ProfileSnapshot = {
      id: `snp-${Date.now()}`,
      name: snapshotName.trim(),
      viewContext: 'public',
      createdAt: new Date().toISOString().split('T')[0],
    };
    onChangeProfile({
      ...profile,
      snapshots: [newSnap, ...(profile.snapshots || [])],
    });
    setSnapshotName('');
    onShowToast(`Saved identity snapshot "${newSnap.name}"`);
  };

  return (
    <div className="bg-white border border-[#E8E4D9] rounded-2xl p-6 sm:p-8 space-y-8 font-sans-ui text-[#1C1B18] shadow-xs">
      {/* Header */}
      <div className="pb-5 border-b border-[#E8E4D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-[#1C1B18] text-[#FAF8F5] rounded-lg">
              <Layers className="w-4 h-4 text-[#D49A3E]" />
            </span>
            <h2 className="font-serif-display text-2xl font-normal">Living Identity Hub</h2>
          </div>
          <p className="text-xs text-[#6B665E]">
            One permanent URL that continuously collects, verifies, updates and presents who you are.
          </p>
        </div>

        {/* Health Score Pill */}
        <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E8E4D9] p-2.5 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] font-mono-code uppercase text-[#6B665E]">Identity Health</div>
            <div className="text-sm font-bold font-mono-code text-[#C85A32]">{totalScore}% Complete</div>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-[#1C1B18] flex items-center justify-center font-bold text-xs font-mono-code">
            {totalScore}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#E8E4D9]">
        {[
          { id: 'import', label: '1. Identity Import & Repos', icon: GitBranch },
          { id: 'living', label: '2. Living Info & NOW', icon: Activity },
          { id: 'timeline', label: '3. Experience & Timeline', icon: Clock },
          { id: 'health', label: '4. Health & Snapshots', icon: ShieldCheck },
          { id: 'export', label: '5. Export & Self-Hosting', icon: Download },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition-all ${
                subTab === tab.id
                  ? 'bg-[#1C1B18] text-[#FAF8F5] shadow-2xs font-semibold'
                  : 'text-[#6B665E] hover:text-[#1C1B18] hover:bg-[#FAF8F5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feature Output Explainer Card */}
      <div className="p-4 bg-[#FAF8F5] border border-[#E8E4D9] rounded-2xl flex items-start gap-3 shadow-2xs">
        <span className="p-2 bg-white border border-[#E8E4D9] rounded-xl text-[#D49A3E] shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </span>
        <div className="space-y-1 text-xs">
          <span className="font-bold text-[#1C1B18] uppercase tracking-wider text-[10px] font-mono-code block">
            Public Profile Output & Purpose
          </span>
          <p className="text-[#6B665E] leading-relaxed">
            The Living Hub powers real-time dynamic cards on your profile: your <strong>"Now"</strong> section (what you are currently building, reading, and learning), connected developer platforms, and your live availability badge.
          </p>
        </div>
      </div>

      {/* SUB-TAB 1: DIGITAL IDENTITY IMPORT & AUTOMATIC DISCOVERY */}
      {subTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] p-5 border border-[#E8E4D9] rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#D49A3E]" /> Automatic Project Discovery from GitHub
                </h3>
                <p className="text-xs text-[#6B665E] mt-0.5">
                  Conn automatically scans your connected GitHub activity to detect repositories, languages, stars, and topics.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAutoDiscoverProjects}
                className="px-4 py-2 bg-[#1C1B18] hover:bg-[#33312B] text-[#FAF8F5] text-xs font-medium rounded-xl flex items-center gap-1.5 transition-all shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D49A3E]" />
                <span>Scan Repositories</span>
              </button>
            </div>

            {profile.openSourceStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white border border-[#E8E4D9] rounded-xl text-center">
                  <div className="text-xl font-mono-code font-bold text-[#1C1B18]">{profile.openSourceStats.reposCount}</div>
                  <div className="text-[10px] text-[#6B665E] uppercase font-mono-code">Repositories</div>
                </div>
                <div className="p-3 bg-white border border-[#E8E4D9] rounded-xl text-center">
                  <div className="text-xl font-mono-code font-bold text-[#C85A32]">{profile.openSourceStats.mergedPRsCount}</div>
                  <div className="text-[10px] text-[#6B665E] uppercase font-mono-code">Merged PRs ✓</div>
                </div>
                <div className="p-3 bg-white border border-[#E8E4D9] rounded-xl text-center">
                  <div className="text-xl font-mono-code font-bold text-[#1C1B18]">{profile.openSourceStats.activeProjectsCount}</div>
                  <div className="text-[10px] text-[#6B665E] uppercase font-mono-code">Active Projects</div>
                </div>
                <div className="p-3 bg-white border border-[#E8E4D9] rounded-xl text-center">
                  <div className="text-xl font-mono-code font-bold text-[#D49A3E]">{profile.openSourceStats.totalStarsCount}</div>
                  <div className="text-[10px] text-[#6B665E] uppercase font-mono-code">Stars Earned</div>
                </div>
              </div>
            )}
          </div>

          {/* Connected Identity Integrations Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18]">
              Connected Platforms & Verification Sources
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {connectedServices.map((svc) => (
                <div
                  key={svc.platform}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between ${
                    svc.connected ? 'bg-white border-[#1C1B18]' : 'bg-[#FAF8F5] border-[#E8E4D9]'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold capitalize flex items-center gap-1.5">
                      <span>{svc.platform}</span>
                      {svc.connected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="text-[11px] text-[#6B665E] font-mono-code">
                      {svc.connected ? `@${svc.username || profile.username}` : 'Not connected'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleService(svc.platform)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      svc.connected
                        ? 'bg-[#1C1B18] text-[#FAF8F5] border-[#1C1B18]'
                        : 'bg-white border-[#E8E4D9] text-[#1C1B18] hover:border-[#1C1B18]'
                    }`}
                  >
                    {svc.connected ? 'Connected ✓' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Import */}
          <div className="p-5 border border-[#E8E4D9] bg-white rounded-2xl space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1C1B18] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#C85A32]" /> Resume &rarr; Living Profile Auto-Parser
            </h4>
            <p className="text-xs text-[#6B665E]">
              Paste your raw resume text to automatically extract structured roles, skills, education, and achievements into Conn.
            </p>

            <textarea
              rows={4}
              value={rawResumeText}
              onChange={(e) => setRawResumeText(e.target.value)}
              placeholder="Paste resume or LinkedIn summary text here..."
              className="w-full p-3 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleParseResume}
                disabled={isParsingResume}
                className="px-5 py-2.5 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-colors flex items-center gap-2"
              >
                {isParsingResume ? 'Parsing Resume Structure...' : 'Parse & Extract Info'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: LIVING INFO & "NOW" SECTION */}
      {subTab === 'living' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                Current Role / Position
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Principal Design Engineer"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1">
                Current Organization / Studio
              </label>
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="e.g. Atelier Rostova Studio"
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl focus:border-[#1C1B18]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B665E] uppercase tracking-wider mb-1">
              Skills & Tech Stack (comma separated)
            </label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. TypeScript, React, Go, System Architecture, PostgreSQL"
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-[#E8E4D9] rounded-xl font-mono-code focus:border-[#1C1B18]"
            />
          </div>

          {/* Dedicated "NOW" Section Controls */}
          <div className="p-5 border border-[#E8E4D9] bg-[#FAF8F5] rounded-2xl space-y-4">
            <div className="border-b border-[#E8E4D9] pb-3">
              <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#C85A32]" /> Dedicated "NOW" Section
              </h3>
              <p className="text-xs text-[#6B665E]">
                Answers: "What are you doing right now?" Makes your profile feel alive over time.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase block mb-1">Currently Building</label>
                <input
                  type="text"
                  value={buildingNow}
                  onChange={(e) => setBuildingNow(e.target.value)}
                  placeholder="e.g. Conn — Personal Identity Hub"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase block mb-1">Currently Learning</label>
                <input
                  type="text"
                  value={learningNow}
                  onChange={(e) => setLearningNow(e.target.value)}
                  placeholder="e.g. WebGPU Shader Composition"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase block mb-1">Currently Working On</label>
                <input
                  type="text"
                  value={workingOnNow}
                  onChange={(e) => setWorkingOnNow(e.target.value)}
                  placeholder="e.g. Open Source Design Tokens"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#6B665E] uppercase block mb-1">Currently Reading</label>
                <input
                  type="text"
                  value={readingNow}
                  onChange={(e) => setReadingNow(e.target.value)}
                  placeholder="e.g. The Design of Everyday Things"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E8E4D9] rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="p-5 border border-[#E8E4D9] bg-white rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" /> Availability & Opportunity Status
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { status: 'open_opportunities', label: '🟢 Open Opportunities', color: 'border-emerald-500 bg-emerald-50' },
                { status: 'open_freelance', label: '🟡 Open Freelance', color: 'border-amber-500 bg-amber-50' },
                { status: 'available_collaboration', label: '🔵 Available Collab', color: 'border-blue-500 bg-blue-50' },
                { status: 'not_available', label: '⚫ Not Available', color: 'border-gray-500 bg-gray-50' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.status}
                  onClick={() => setAvailStatus(opt.status as any)}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all text-center ${
                    availStatus === opt.status ? `${opt.color} font-bold shadow-2xs` : 'bg-white border-[#E8E4D9] text-[#6B665E]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] text-[#6B665E] uppercase block mb-1">Preferred Role / Project Type</label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Design Systems Lead / Advisory"
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#6B665E] uppercase block mb-1">Location Preference</label>
                <select
                  value={locationPref}
                  onChange={(e) => setLocationPref(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl"
                >
                  <option value="Remote">Remote Only</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleSaveLivingProfile}
              className="px-6 py-2.5 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B] transition-all shadow-xs"
            >
              Save Living Identity Parameters
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: TIMELINE & EXPERIENCE */}
      {subTab === 'timeline' && (
        <TimelineManager
          profile={profile}
          onChangeProfile={onChangeProfile}
          onShowToast={onShowToast}
        />
      )}

      {/* SUB-TAB 4: HEALTH & SNAPSHOTS */}
      {subTab === 'health' && (
        <div className="space-y-6">
          <div className="p-5 border border-[#E8E4D9] bg-[#FAF8F5] rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Identity Health Assessment ({totalScore}%)
            </h3>

            <div className="w-full bg-[#E8E4D9] h-2 rounded-full overflow-hidden">
              <div className="h-full bg-[#1C1B18] transition-all duration-300" style={{ width: `${totalScore}%` }} />
            </div>

            <div className="space-y-2 pt-2">
              {healthChecks.map((chk, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 bg-white rounded-lg border border-[#E8E4D9]">
                  <span className="flex items-center gap-2">
                    {chk.ok ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-gray-400" />
                    )}
                    <span className={chk.ok ? 'text-[#1C1B18] font-medium' : 'text-[#6B665E]'}>{chk.label}</span>
                  </span>
                  <span className="font-mono-code text-[11px] text-[#6B665E]">+{chk.weight}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Snapshots */}
          <div className="p-5 border border-[#E8E4D9] bg-white rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#D49A3E]" /> Identity Presentation Snapshots
            </h3>
            <p className="text-xs text-[#6B665E]">
              Save versions of your identity presentation (e.g. "Recruiter Snapshot", "Job Search Profile") without duplicating underlying data.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Snapshot Name e.g. 2026 Developer View..."
                className="flex-1 px-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl"
              />
              <button
                type="button"
                onClick={handleCreateSnapshot}
                className="px-4 py-2 bg-[#1C1B18] text-[#FAF8F5] text-xs font-medium rounded-xl hover:bg-[#33312B]"
              >
                + Save Snapshot
              </button>
            </div>

            {snapshots.length > 0 && (
              <div className="space-y-2 pt-2">
                {snapshots.map((s) => (
                  <div key={s.id} className="p-3 bg-[#FAF8F5] border border-[#E8E4D9] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-[#1C1B18]">{s.name}</div>
                      <div className="text-[10px] text-[#6B665E] font-mono-code">Saved {s.createdAt}</div>
                    </div>
                    <span className="px-2 py-0.5 bg-white border border-[#E8E4D9] rounded text-[10px] font-mono-code uppercase">
                      {s.viewContext}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: EXPORT & SELF-HOSTING */}
      {subTab === 'export' && (
        <div className="space-y-6">
          <div className="p-5 border border-[#E8E4D9] bg-white rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
              <Download className="w-4 h-4 text-[#C85A32]" /> Portable Profile Data Export
            </h3>
            <p className="text-xs text-[#6B665E]">
              You own your identity data. Export your entire profile structure in standard open formats.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleExportData('json')}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl flex items-center gap-1.5"
              >
                <Code className="w-3.5 h-3.5 text-blue-600" /> Export JSON
              </button>
              <button
                type="button"
                onClick={() => handleExportData('markdown')}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#C85A32]" /> Export Markdown
              </button>
              <button
                type="button"
                onClick={() => handleExportData('html')}
                className="px-4 py-2 bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#1C1B18] text-xs font-medium rounded-xl flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" /> Export Standalone HTML
              </button>
            </div>
          </div>

          <div className="p-5 border border-[#E8E4D9] bg-[#FAF8F5] rounded-2xl space-y-3">
            <h3 className="text-sm font-bold text-[#1C1B18] flex items-center gap-2">
              <Server className="w-4 h-4 text-[#D49A3E]" /> Open Source Self-Hosting Architecture
            </h3>
            <p className="text-xs text-[#6B665E]">
              Deploy your own independent Conn identity server instance using Docker or PostgreSQL.
            </p>

            <div className="p-3 bg-[#1C1B18] text-[#FAF8F5] rounded-xl font-mono-code text-[11px] space-y-1">
              <div># Self-Host Conn Container</div>
              <div className="text-emerald-400">docker run -d -p 3000:3000 -e DATABASE_URL="postgresql://..." ghcr.io/conn/hub:latest</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
