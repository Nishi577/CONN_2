import React from 'react';
import {
  CustomBackgroundConfig,
  ElementPositionOverride,
  DecorativeObject,
  ElementAnimationSetting,
  MotionConfig,
} from '../types';

export const getBackgroundStyleAndElements = (
  customBg?: CustomBackgroundConfig,
  defaultBgHex: string = '#FAF8F5'
): {
  containerStyle: React.CSSProperties;
  backgroundOverlayElements: React.ReactNode;
} => {
  if (!customBg) {
    return {
      containerStyle: { backgroundColor: defaultBgHex },
      backgroundOverlayElements: null,
    };
  }

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflowX: 'hidden',
  };

  let overlayElements: React.ReactNode = null;

  switch (customBg.type) {
    case 'solid':
      containerStyle.backgroundColor = customBg.solidHex || defaultBgHex;
      break;

    case 'gradient': {
      const g = customBg.gradient;
      if (g) {
        const colorsStr = (g.colors || [defaultBgHex, '#EFECE6']).join(', ');
        if (g.style === 'radial') {
          containerStyle.background = `radial-gradient(circle at center, ${colorsStr})`;
        } else if (g.style === 'conic') {
          containerStyle.background = `conic-gradient(from ${g.directionAngle || 0}deg, ${colorsStr})`;
        } else {
          containerStyle.background = `linear-gradient(${g.directionAngle || 135}deg, ${colorsStr})`;
        }
      } else {
        containerStyle.backgroundColor = defaultBgHex;
      }
      break;
    }

    case 'mesh': {
      containerStyle.backgroundColor = customBg.solidHex || defaultBgHex;
      const m = customBg.mesh;
      if (m) {
        const colors = m.colors || ['#FCE7F3', '#E0E7FF', '#FEF3C7'];
        overlayElements = (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ opacity: m.opacity ?? 0.8 }}
          >
            {colors.map((c, i) => {
              const positions = [
                { top: '-10%', left: '-10%', width: '60%', height: '60%' },
                { top: '40%', right: '-15%', width: '65%', height: '65%' },
                { bottom: '-20%', left: '20%', width: '70%', height: '70%' },
                { top: '20%', left: '30%', width: '50%', height: '50%' },
              ];
              const pos = positions[i % positions.length];
              return (
                <div
                  key={i}
                  className="absolute rounded-full transition-all duration-1000"
                  style={{
                    ...pos,
                    backgroundColor: c,
                    filter: `blur(${m.blurPx || 60}px)`,
                  }}
                />
              );
            })}
          </div>
        );
      }
      break;
    }

    case 'animated_gradient': {
      const ag = customBg.animatedGradient;
      const colorsStr = (ag?.colors || ['#FAF8F5', '#FED7AA', '#E0E7FF']).join(', ');
      containerStyle.background = `linear-gradient(-45deg, ${colorsStr})`;
      containerStyle.backgroundSize = '400% 400%';
      containerStyle.animation = `gradientAnimation ${15 / (ag?.speed || 1)}s ease infinite`;
      break;
    }

    case 'pattern': {
      containerStyle.backgroundColor = customBg.solidHex || defaultBgHex;
      const p = customBg.pattern;
      if (p) {
        let patternSvg = '';
        const color = encodeURIComponent(p.colorHex || '#1C1B18');
        const opacity = p.opacity || 0.15;
        const spacing = p.spacingPx || 20;

        switch (p.style) {
          case 'grid':
            patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}" viewBox="0 0 ${spacing} ${spacing}"><path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/></svg>`;
            break;
          case 'lines':
            patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}" viewBox="0 0 ${spacing} ${spacing}"><path d="M 0 ${spacing} L ${spacing} 0" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/></svg>`;
            break;
          case 'paper':
            patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100" height="100" filter="url(%23n)" opacity="${opacity}"/></svg>`;
            break;
          case 'geometric':
            patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${spacing * 2}" height="${spacing * 2}" viewBox="0 0 ${spacing * 2} ${spacing * 2}"><polygon points="0,0 ${spacing},0 ${spacing / 2},${spacing}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/></svg>`;
            break;
          case 'dots':
          default:
            patternSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${spacing}" height="${spacing}" viewBox="0 0 ${spacing} ${spacing}"><circle cx="${spacing / 2}" cy="${spacing / 2}" r="1.5" fill="${color}" fill-opacity="${opacity}"/></svg>`;
            break;
        }

        overlayElements = (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `url('${patternSvg}')`,
              backgroundRepeat: 'repeat',
            }}
          />
        );
      }
      break;
    }

    case 'image': {
      const img = customBg.image;
      if (img && img.url) {
        overlayElements = (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <img
              src={img.url}
              alt="Background cover"
              className="w-full h-full object-cover"
              style={{
                opacity: img.opacity ?? 1,
                filter: `blur(${img.blurPx || 0}px) brightness(${img.brightness || 100}%) contrast(${img.contrast || 100}%)`,
              }}
            />
            {img.overlayOpacity ? (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: img.overlayColor || '#000000',
                  opacity: img.overlayOpacity,
                }}
              />
            ) : null}
          </div>
        );
      } else {
        containerStyle.backgroundColor = defaultBgHex;
      }
      break;
    }

    case 'creative': {
      containerStyle.backgroundColor = customBg.solidHex || defaultBgHex;
      const c = customBg.creative;
      if (c) {
        const pColor = c.primaryHex || '#C85A32';
        const sColor = c.secondaryHex || '#D49A3E';
        overlayElements = (
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ opacity: c.opacity ?? 0.3 }}
          >
            {c.effect === 'soft_blobs' && (
              <>
                <div
                  className="absolute -top-20 -left-20 w-80 h-80 rounded-full animate-pulse"
                  style={{
                    backgroundColor: pColor,
                    filter: 'blur(70px)',
                  }}
                />
                <div
                  className="absolute top-1/2 -right-20 w-96 h-96 rounded-full animate-pulse"
                  style={{
                    backgroundColor: sColor,
                    filter: 'blur(80px)',
                    animationDuration: '6s',
                  }}
                />
              </>
            )}

            {c.effect === 'particles' && (
              <div className="absolute inset-0 flex flex-wrap gap-12 p-8 justify-around items-center">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-ping"
                    style={{
                      backgroundColor: i % 2 === 0 ? pColor : sColor,
                      animationDuration: `${2 + (i % 3)}s`,
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}

            {c.effect === 'stars' && (
              <div className="absolute inset-0 grid grid-cols-6 gap-8 p-6">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full bg-white animate-pulse"
                    style={{
                      animationDuration: `${1.5 + (i % 4)}s`,
                      opacity: 0.2 + (i % 5) * 0.15,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      }
      break;
    }
  }

  return { containerStyle, backgroundOverlayElements: overlayElements };
};

export const getElementTransformStyle = (
  override?: ElementPositionOverride
): React.CSSProperties => {
  if (!override) return {};

  const transforms: string[] = [];
  if (override.offsetX !== undefined && override.offsetX !== 0 || override.offsetY !== undefined && override.offsetY !== 0) {
    transforms.push(`translate(${override.offsetX || 0}px, ${override.offsetY || 0}px)`);
  }
  if (override.scale !== undefined && override.scale !== 100) {
    transforms.push(`scale(${override.scale / 100})`);
  }
  if (override.rotation !== undefined && override.rotation !== 0) {
    transforms.push(`rotate(${override.rotation}deg)`);
  }

  const style: React.CSSProperties = {
    position: 'relative',
  };

  if (transforms.length > 0) {
    style.transform = transforms.join(' ');
    style.transformOrigin =
      override.alignment === 'left'
        ? 'left center'
        : override.alignment === 'right'
        ? 'right center'
        : 'center center';
  }

  if (override.zIndex !== undefined && override.zIndex !== 1) {
    style.zIndex = override.zIndex;
  }

  if (override.alignment) {
    style.textAlign = override.alignment;
    if (override.alignment === 'center') {
      style.marginLeft = 'auto';
      style.marginRight = 'auto';
    } else if (override.alignment === 'right') {
      style.marginLeft = 'auto';
      style.marginRight = '0';
    } else if (override.alignment === 'left') {
      style.marginLeft = '0';
      style.marginRight = 'auto';
    }
  }

  if (override.width) {
    style.width = override.width;
  }

  return style;
};

export const getElementAlignmentClasses = (
  override?: ElementPositionOverride
): string => {
  if (!override || !override.alignment) return '';
  switch (override.alignment) {
    case 'center':
      return 'items-center text-center justify-center mx-auto';
    case 'right':
      return 'items-end text-right justify-end ml-auto';
    case 'left':
      return 'items-start text-left justify-start mr-auto';
    default:
      return '';
  }
};

export const getElementAnimationStyle = (
  setting?: ElementAnimationSetting,
  motionConfig?: MotionConfig,
  orderIndex: number = 0
): { className: string; style: React.CSSProperties } => {
  if (!motionConfig || motionConfig.reduceMotion || motionConfig.globalIntensity === 'none') {
    return { className: '', style: {} };
  }

  const anim = setting || { type: 'none', durationMs: 600, delayMs: 0 };
  if (!anim.type || anim.type === 'none') {
    return { className: '', style: {} };
  }

  const speed = motionConfig.globalSpeed || 1;
  const duration = Math.max(150, (anim.durationMs || 600) / speed);
  const stagger = motionConfig.sequenceStaggerMs || 80;
  const delay = Math.max(0, (anim.delayMs || 0) + orderIndex * stagger);

  let animClass = '';
  switch (anim.type) {
    case 'float':
      animClass = 'animate-float-subtle';
      break;
    case 'scale':
      animClass = 'animate-bounce-subtle';
      break;
    case 'fade':
      animClass = 'animate-fade-in';
      break;
    case 'slide':
      animClass = 'animate-slide-up';
      break;
    case 'reveal':
    case 'blur_reveal':
      animClass = 'animate-reveal-up';
      break;
    default:
      animClass = '';
  }

  return {
    className: animClass,
    style: {
      animationDuration: `${duration}ms`,
      animationDelay: `${delay}ms`,
      animationFillMode: 'both',
    },
  };
};

export const renderDecorativeObjects = (
  objects: DecorativeObject[] = []
): React.ReactNode => {
  if (!objects || objects.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {objects.map((obj) => {
        let animClass = '';
        if (obj.animation === 'float') animClass = 'animate-float-subtle';
        else if (obj.animation === 'pulse') animClass = 'animate-pulse';
        else if (obj.animation === 'spin') animClass = 'animate-spin';
        else if (obj.animation === 'drift') animClass = 'animate-bounce-subtle';

        const speedMultiplier = obj.speed || 1;
        const animDuration = Math.max(1.5, 4 / speedMultiplier);

        return (
          <div
            key={obj.id}
            className={`absolute pointer-events-none select-none transition-all duration-300 ${animClass}`}
            style={{
              left: `${obj.xPercent}%`,
              top: `${obj.yPercent}%`,
              transform: `scale(${obj.scale || 1}) rotate(${obj.rotation || 0}deg)`,
              opacity: obj.opacity !== undefined ? obj.opacity : 0.7,
              filter: obj.blurPx ? `blur(${obj.blurPx}px)` : undefined,
              zIndex: obj.zIndex || 0,
              animationDuration: animClass ? `${animDuration}s` : undefined,
            }}
          >
            {obj.type === 'gradient_blob' && (
              <div
                className="w-36 h-36 rounded-full blur-xl"
                style={{ backgroundColor: obj.colorHex }}
              />
            )}
            {obj.type === 'star' && (
              <div className="text-2xl select-none" style={{ color: obj.colorHex }}>
                ✦
              </div>
            )}
            {obj.type === 'shape' && (
              <div
                className="w-14 h-14 border-2 rounded-2xl rotate-12"
                style={{ borderColor: obj.colorHex }}
              />
            )}
            {obj.type === 'circle' && (
              <div
                className="w-16 h-16 rounded-full border border-dashed"
                style={{ borderColor: obj.colorHex }}
              />
            )}
            {obj.type === 'dot' && (
              <div
                className="w-3.5 h-3.5 rounded-full shadow-sm"
                style={{ backgroundColor: obj.colorHex }}
              />
            )}
            {obj.type === 'badge' && (
              <div
                className="px-3 py-1 rounded-full text-2xs font-mono-code uppercase font-bold text-white shadow-md border border-white/20"
                style={{ backgroundColor: obj.colorHex }}
              >
                {obj.content || 'Conn Verified'}
              </div>
            )}
            {obj.type === 'text_label' && (
              <div
                className="px-2.5 py-0.5 rounded text-xs font-mono-code font-bold uppercase tracking-wider"
                style={{ color: obj.colorHex }}
              >
                {obj.content || '• IDENTITY ARCHIVE'}
              </div>
            )}
            {obj.type === 'wave' && (
              <div className="text-xl font-mono-code opacity-70" style={{ color: obj.colorHex }}>
                〜〜〜
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export const getMicroHoverClass = (
  hoverEffect?: string
): string => {
  switch (hoverEffect) {
    case 'lift':
      return 'hover:-translate-y-1.5 hover:shadow-lg active:translate-y-0 transition-all duration-200';
    case 'scale':
      return 'hover:scale-[1.03] active:scale-100 transition-all duration-200';
    case 'glow':
      return 'hover:ring-2 hover:ring-offset-2 hover:ring-current transition-all duration-200';
    case 'underline':
      return 'hover:underline transition-all duration-200';
    case 'shadow':
      return 'hover:shadow-xl transition-all duration-200';
    case 'tilt':
      return 'hover:rotate-1 hover:scale-102 transition-all duration-200';
    case 'zoom':
      return 'hover:scale-105 hover:shadow-md transition-all duration-200';
    case 'rotate':
    case 'spin':
      return 'hover:rotate-6 hover:scale-105 transition-all duration-200';
    case 'bg_shift':
      return 'hover:bg-black/10 hover:backdrop-brightness-95 transition-all duration-200';
    case 'border_shift':
      return 'hover:border-current transition-all duration-200';
    case 'border_glow':
      return 'hover:ring-2 hover:ring-offset-1 hover:ring-[#C85A32]/60 transition-all duration-200';
    case 'border_pulse':
      return 'hover:animate-pulse hover:ring-2 hover:ring-current transition-all duration-200';
    case 'color_shift':
      return 'hover:text-[#C85A32] hover:scale-110 transition-all duration-200';
    case 'bounce':
      return 'hover:-translate-y-2 transition-all duration-200';
    case 'border':
      return 'hover:border-current transition-all duration-200';
    case 'none':
      return '';
    default:
      return 'transition-all duration-200';
  }
};
