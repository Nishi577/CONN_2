import React from 'react';
import { ConnProfile, CustomBackgroundConfig } from '../../types';
import {
  Sparkles,
  RotateCcw,
  Image as ImageIcon,
  Layers,
  Wand2,
  Grid,
  Sun,
  Zap,
  Sliders,
  Check,
  Eye,
} from 'lucide-react';

interface BackgroundStudioProps {
  profile: ConnProfile;
  onChangeProfile: (updated: ConnProfile) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_BG_CONFIG: CustomBackgroundConfig = {
  type: 'solid',
  solidHex: '#FAF8F5',
  gradient: {
    style: 'linear',
    directionAngle: 135,
    colors: ['#FAF8F5', '#EFECE6', '#E8E4D9'],
    intensity: 80,
  },
  mesh: {
    colors: ['#FAF8F5', '#FCE7F3', '#E0E7FF', '#FEF3C7'],
    blurPx: 60,
    opacity: 0.8,
  },
  animatedGradient: {
    colors: ['#FAF8F5', '#FED7AA', '#E0E7FF'],
    speed: 1,
    direction: 'diagonal',
    opacity: 0.9,
  },
  pattern: {
    style: 'dots',
    scale: 1,
    opacity: 0.15,
    rotation: 0,
    spacingPx: 20,
    colorHex: '#1C1B18',
  },
  creative: {
    effect: 'soft_blobs',
    primaryHex: '#C85A32',
    secondaryHex: '#D49A3E',
    speed: 1,
    density: 50,
    opacity: 0.2,
  },
};

const VARIATION_PRESETS: { name: string; desc: string; icon: string; style: CustomBackgroundConfig }[] = [
  {
    name: 'Editorial Paper Grain',
    desc: 'Soft warm cream canvas with subtle tactile paper fiber pattern.',
    icon: '📜',
    style: {
      type: 'pattern',
      solidHex: '#FAF8F5',
      pattern: { style: 'paper', scale: 1, opacity: 0.25, rotation: 0, spacingPx: 16, colorHex: '#3C3933' },
    },
  },
  {
    name: 'Terracotta Sunset Mesh',
    desc: 'Soft multi-point ambient gradient with warm terracotta & gold glow.',
    icon: '🌅',
    style: {
      type: 'mesh',
      solidHex: '#FAF8F5',
      mesh: { colors: ['#FAF8F5', '#FFEDD5', '#FED7AA', '#FDE68A'], blurPx: 70, opacity: 0.85 },
    },
  },
  {
    name: 'Cybernetic Tech Grid',
    desc: 'Dark terminal canvas with cyan/emerald subtle technical matrix grid.',
    icon: '💻',
    style: {
      type: 'pattern',
      solidHex: '#0D1117',
      pattern: { style: 'grid', scale: 1, opacity: 0.2, rotation: 0, spacingPx: 24, colorHex: '#10B981' },
    },
  },
  {
    name: 'Cosmic Floating Orbs',
    desc: 'Deep slate backdrop with floating radiant gradient blobs.',
    icon: '✨',
    style: {
      type: 'creative',
      solidHex: '#0F172A',
      creative: { effect: 'soft_blobs', primaryHex: '#6366F1', secondaryHex: '#EC4899', speed: 0.8, density: 40, opacity: 0.3 },
    },
  },
  {
    name: 'Minimal Linear Wash',
    desc: 'Ultra clean subtle 135deg dual-shade gradient wash.',
    icon: '🎨',
    style: {
      type: 'gradient',
      solidHex: '#FAF8F5',
      gradient: { style: 'linear', directionAngle: 135, colors: ['#FFFFFF', '#FAF8F5', '#EFECE6'], intensity: 90 },
    },
  },
];

export const BackgroundStudio: React.FC<BackgroundStudioProps> = ({
  profile,
  onChangeProfile,
  onShowToast,
}) => {
  const bgConfig: CustomBackgroundConfig = profile.customBackground || DEFAULT_BG_CONFIG;

  const updateBg = (newConfig: CustomBackgroundConfig, msg?: string) => {
    onChangeProfile({
      ...profile,
      customBackground: newConfig,
    });
    if (msg) onShowToast(msg);
  };

  const handleSetType = (type: CustomBackgroundConfig['type']) => {
    updateBg({ ...bgConfig, type }, `Background set to ${type.toUpperCase()}`);
  };

  // Generative variation creator
  const handleGenerateVariation = (direction: 'Minimal' | 'Editorial' | 'Organic' | 'Technical' | 'Playful' | 'Abstract') => {
    let generated: CustomBackgroundConfig;
    switch (direction) {
      case 'Minimal':
        generated = {
          type: 'solid',
          solidHex: '#FAFAFA',
        };
        break;
      case 'Editorial':
        generated = {
          type: 'pattern',
          solidHex: '#FAF8F5',
          pattern: { style: 'paper', scale: 1.1, opacity: 0.2, rotation: 0, spacingPx: 18, colorHex: '#2A2824' },
        };
        break;
      case 'Organic':
        generated = {
          type: 'mesh',
          mesh: { colors: ['#FAF8F5', '#ECFDF5', '#FEF3C7', '#FFEDD5'], blurPx: 80, opacity: 0.8 },
        };
        break;
      case 'Technical':
        generated = {
          type: 'pattern',
          solidHex: '#0B0F19',
          pattern: { style: 'grid', scale: 1, opacity: 0.18, rotation: 0, spacingPx: 20, colorHex: '#38BDF8' },
        };
        break;
      case 'Playful':
        generated = {
          type: 'animated_gradient',
          animatedGradient: { colors: ['#FFF1F2', '#F0FDFA', '#FEF3C7', '#F3E8FF'], speed: 1.2, direction: 'diagonal', opacity: 0.9 },
        };
        break;
      case 'Abstract':
      default:
        generated = {
          type: 'creative',
          solidHex: '#18181B',
          creative: { effect: 'soft_blobs', primaryHex: '#C85A32', secondaryHex: '#3B82F6', speed: 1, density: 60, opacity: 0.25 },
        };
        break;
    }

    updateBg(generated, `Generated ${direction} Background Variation`);
  };

  return (
    <div className="space-y-6 font-sans-ui text-[#1C1B18]">
      {/* HEADER & QUICK VARIATIONS */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif-display text-lg font-bold flex items-center gap-2">
              <Sun className="w-5 h-5 text-[#C85A32]" /> Custom Profile Background Studio
            </h3>
            <p className="text-xs text-[#6B665E] mt-0.5">
              Transform your profile canvas with solid colors, multi-stop gradients, mesh blur fields, background images, patterns, or creative particle FX.
            </p>
          </div>

          <button
            type="button"
            onClick={() => updateBg(DEFAULT_BG_CONFIG, 'Reset background to default')}
            className="px-3 py-1.5 border border-[#E8E4D9] hover:border-red-300 text-xs font-mono-code text-[#6B665E] hover:text-red-600 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Background</span>
          </button>
        </div>

        {/* GENERATIVE VARIATION SELECTOR BUTTONS */}
        <div className="pt-3 border-t border-[#E8E4D9] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-code font-bold text-[#1C1B18]">
            <span className="flex items-center gap-1.5">
              <Wand2 className="w-4 h-4 text-[#C85A32]" /> Generative Variation Generator:
            </span>
            <span className="text-2xs text-[#6B665E] font-normal">Click to auto-synthesize style</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['Minimal', 'Editorial', 'Organic', 'Technical', 'Playful', 'Abstract'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => handleGenerateVariation(dir)}
                className="px-3 py-1.5 bg-[#FAF8F5] border border-[#E8E4D9] hover:border-[#C85A32] hover:bg-white text-xs font-mono-code rounded-xl flex items-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3 text-[#C85A32]" />
                <span>{dir}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BACKGROUND PRESET CARDS */}
      <div className="space-y-2">
        <label className="text-xs font-mono-code uppercase font-bold text-[#6B665E]">
          Curated Background Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {VARIATION_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => updateBg(p.style, `Applied preset "${p.name}"`)}
              className="p-3 bg-white border border-[#E8E4D9] hover:border-[#C85A32] rounded-xl text-left transition-all space-y-1.5 group shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{p.icon}</span>
                <span className="text-2xs font-mono-code uppercase text-[#C85A32] font-bold">Preset</span>
              </div>
              <div className="font-serif-display text-xs font-bold text-[#1C1B18] group-hover:text-[#C85A32]">
                {p.name}
              </div>
              <p className="text-2xs text-[#6B665E] line-clamp-2 leading-tight font-light">{p.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN STYLE CATEGORY SELECTOR TABS */}
      <div className="p-5 bg-white border border-[#E8E4D9] rounded-2xl space-y-5">
        <label className="text-xs font-mono-code uppercase font-bold text-[#1C1B18] block">
          Background System Engine
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {[
            { id: 'solid', label: 'Solid Color', icon: '🎨' },
            { id: 'gradient', label: 'Multi Gradient', icon: '🌈' },
            { id: 'mesh', label: 'Ambient Mesh', icon: '☁️' },
            { id: 'animated_gradient', label: 'Animated Wash', icon: '✨' },
            { id: 'pattern', label: 'Tactile Pattern', icon: '📐' },
            { id: 'image', label: 'Cover Image', icon: '🖼️' },
            { id: 'creative', label: 'Creative Particles', icon: '🎆' },
          ].map((tab) => {
            const active = bgConfig.type === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSetType(tab.id as any)}
                className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                  active
                    ? 'border-[#C85A32] bg-[#FAF8F5] text-[#1C1B18] font-bold ring-2 ring-[#C85A32]/20 shadow-xs'
                    : 'border-[#E8E4D9] bg-white text-[#6B665E] hover:border-[#1C1B18]'
                }`}
              >
                <div className="text-xl">{tab.icon}</div>
                <div className="text-xs font-mono-code leading-tight">{tab.label}</div>
              </button>
            );
          })}
        </div>

        {/* DETAILED CONTROLS BASED ON ACTIVE STYLE */}
        <div className="pt-4 border-t border-[#E8E4D9] space-y-4">
          {/* SOLID COLOR */}
          {bgConfig.type === 'solid' && (
            <div className="space-y-3">
              <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                Solid Canvas Color
              </label>
              <div className="flex items-center gap-3">
                {['#FAF8F5', '#FFFFFF', '#F3F4F6', '#FEF3C7', '#0D1117', '#0F172A', '#18181B'].map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => updateBg({ ...bgConfig, solidHex: hex })}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      bgConfig.solidHex === hex ? 'scale-110 border-[#C85A32] shadow-md' : 'border-black/10'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
                <input
                  type="color"
                  value={bgConfig.solidHex || '#FAF8F5'}
                  onChange={(e) => updateBg({ ...bgConfig, solidHex: e.target.value })}
                  className="w-9 h-9 rounded-lg border border-[#E8E4D9] cursor-pointer"
                />
                <span className="text-xs font-mono-code text-[#6B665E]">
                  {bgConfig.solidHex || '#FAF8F5'}
                </span>
              </div>
            </div>
          )}

          {/* GRADIENT */}
          {bgConfig.type === 'gradient' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Gradient Style</label>
                  <select
                    value={bgConfig.gradient?.style || 'linear'}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        gradient: { ...bgConfig.gradient, style: e.target.value as any, colors: bgConfig.gradient?.colors || ['#FAF8F5', '#EFECE6'] },
                      })
                    }
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5]"
                  >
                    <option value="linear">Linear Directional Gradient</option>
                    <option value="radial">Radial Center Glow</option>
                    <option value="conic">Conic Angular Sweep</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Angle: {bgConfig.gradient?.directionAngle || 135}°
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={15}
                    value={bgConfig.gradient?.directionAngle || 135}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        gradient: { ...bgConfig.gradient, directionAngle: Number(e.target.value), colors: bgConfig.gradient?.colors || ['#FAF8F5', '#EFECE6'] },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>
              </div>

              {/* COLOR STOPS */}
              <div className="space-y-2">
                <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Gradient Stop Colors</label>
                <div className="flex items-center gap-3">
                  {(bgConfig.gradient?.colors || ['#FAF8F5', '#EFECE6']).map((col, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={col}
                        onChange={(e) => {
                          const newCols = [...(bgConfig.gradient?.colors || ['#FAF8F5', '#EFECE6'])];
                          newCols[idx] = e.target.value;
                          updateBg({ ...bgConfig, gradient: { ...bgConfig.gradient, colors: newCols } });
                        }}
                        className="w-8 h-8 rounded border border-[#E8E4D9] cursor-pointer"
                      />
                      <span className="text-2xs font-mono-code text-[#6B665E]">Stop {idx + 1}</span>
                    </div>
                  ))}
                  {(bgConfig.gradient?.colors || []).length < 4 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newCols = [...(bgConfig.gradient?.colors || ['#FAF8F5', '#EFECE6']), '#D49A3E'];
                        updateBg({ ...bgConfig, gradient: { ...bgConfig.gradient, colors: newCols } });
                      }}
                      className="px-2.5 py-1 text-xs border border-dashed border-[#C85A32] text-[#C85A32] rounded-lg hover:bg-orange-50 font-mono-code"
                    >
                      + Stop
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MESH GRADIENT */}
          {bgConfig.type === 'mesh' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6B665E]">
                Mesh gradients combine multi-point diffuse radial color fields with blur parameters for a floating ambient lighting feel.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Blur Radius: {bgConfig.mesh?.blurPx || 60}px
                  </label>
                  <input
                    type="range"
                    min={20}
                    max={120}
                    value={bgConfig.mesh?.blurPx || 60}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        mesh: { ...bgConfig.mesh, colors: bgConfig.mesh?.colors || ['#FAF8F5', '#FCE7F3'], blurPx: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Opacity: {Math.round((bgConfig.mesh?.opacity || 0.8) * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={bgConfig.mesh?.opacity || 0.8}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        mesh: { ...bgConfig.mesh, colors: bgConfig.mesh?.colors || ['#FAF8F5', '#FCE7F3'], opacity: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ANIMATED GRADIENT */}
          {bgConfig.type === 'animated_gradient' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Speed Multiplier: {bgConfig.animatedGradient?.speed || 1}x
                  </label>
                  <input
                    type="range"
                    min={0.2}
                    max={3.0}
                    step={0.2}
                    value={bgConfig.animatedGradient?.speed || 1}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        animatedGradient: {
                          ...bgConfig.animatedGradient,
                          colors: bgConfig.animatedGradient?.colors || ['#FAF8F5', '#FED7AA'],
                          speed: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Flow Motion</label>
                  <select
                    value={bgConfig.animatedGradient?.direction || 'diagonal'}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        animatedGradient: {
                          ...bgConfig.animatedGradient,
                          colors: bgConfig.animatedGradient?.colors || ['#FAF8F5', '#FED7AA'],
                          direction: e.target.value as any,
                        },
                      })
                    }
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5]"
                  >
                    <option value="diagonal">Diagonal Wave Shift</option>
                    <option value="horizontal">Horizontal Flow</option>
                    <option value="vertical">Vertical Rise</option>
                    <option value="radial">Radial Pulsing</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* PATTERN */}
          {bgConfig.type === 'pattern' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Pattern Archetype</label>
                  <select
                    value={bgConfig.pattern?.style || 'dots'}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        pattern: { ...bgConfig.pattern, style: e.target.value as any },
                      })
                    }
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5]"
                  >
                    <option value="dots">Dots Matrix</option>
                    <option value="grid">Technical Architectural Grid</option>
                    <option value="lines">Diagonal Line Shading</option>
                    <option value="noise">Grainy Tactile Noise</option>
                    <option value="paper">Parchment Paper Grain</option>
                    <option value="geometric">Geometric Tiles</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Opacity: {Math.round((bgConfig.pattern?.opacity || 0.15) * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.02}
                    max={0.5}
                    step={0.02}
                    value={bgConfig.pattern?.opacity || 0.15}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        pattern: { ...bgConfig.pattern, opacity: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Grid Spacing: {bgConfig.pattern?.spacingPx || 20}px
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={60}
                    step={2}
                    value={bgConfig.pattern?.spacingPx || 20}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        pattern: { ...bgConfig.pattern, spacingPx: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* COVER IMAGE */}
          {bgConfig.type === 'image' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Background Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={bgConfig.image?.url || ''}
                  onChange={(e) =>
                    updateBg({
                      ...bgConfig,
                      image: { ...bgConfig.image, url: e.target.value },
                    })
                  }
                  className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Blur: {bgConfig.image?.blurPx || 0}px
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    value={bgConfig.image?.blurPx || 0}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        image: { ...bgConfig.image, url: bgConfig.image?.url || '', blurPx: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Opacity: {Math.round((bgConfig.image?.opacity ?? 1) * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={bgConfig.image?.opacity ?? 1}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        image: { ...bgConfig.image, url: bgConfig.image?.url || '', opacity: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">
                    Overlay Dimming: {Math.round((bgConfig.image?.overlayOpacity || 0.2) * 100)}%
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={0.8}
                    step={0.05}
                    value={bgConfig.image?.overlayOpacity || 0.2}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        image: { ...bgConfig.image, url: bgConfig.image?.url || '', overlayOpacity: Number(e.target.value) },
                      })
                    }
                    className="w-full accent-[#C85A32]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CREATIVE PARTICLES */}
          {bgConfig.type === 'creative' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Visual Effect Type</label>
                  <select
                    value={bgConfig.creative?.effect || 'soft_blobs'}
                    onChange={(e) =>
                      updateBg({
                        ...bgConfig,
                        creative: { ...bgConfig.creative, effect: e.target.value as any },
                      })
                    }
                    className="w-full p-2.5 text-xs border border-[#E8E4D9] rounded-xl bg-[#FAF8F5]"
                  >
                    <option value="soft_blobs">Soft Floating Blobs</option>
                    <option value="particles">Floating Spark Particles</option>
                    <option value="stars">Twinkling Night Stars</option>
                    <option value="waves">Flowing Wave Lines</option>
                    <option value="glow">Radial Corner Glow</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgConfig.creative?.primaryHex || '#C85A32'}
                      onChange={(e) =>
                        updateBg({
                          ...bgConfig,
                          creative: { ...bgConfig.creative, primaryHex: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-[#E8E4D9] cursor-pointer"
                    />
                    <span className="text-xs font-mono-code">{bgConfig.creative?.primaryHex || '#C85A32'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono-code font-bold text-[#1C1B18]">Secondary Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgConfig.creative?.secondaryHex || '#D49A3E'}
                      onChange={(e) =>
                        updateBg({
                          ...bgConfig,
                          creative: { ...bgConfig.creative, secondaryHex: e.target.value },
                        })
                      }
                      className="w-8 h-8 rounded border border-[#E8E4D9] cursor-pointer"
                    />
                    <span className="text-xs font-mono-code">{bgConfig.creative?.secondaryHex || '#D49A3E'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
