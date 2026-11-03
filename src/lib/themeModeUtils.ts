import { ConnProfile, ThemeOption } from '../types';
import { EDITORIAL_THEMES } from '../data/themes';

export type ThemeMode = 'light' | 'dark';

/** Surface palettes shared by the Theme Studio and the live preview mode switch. */
export const LIGHT_SURFACE = {
  bgHex: '#FAF8F5',
  textHex: '#1C1B18',
  mutedHex: '#6B665E',
  borderHex: '#E8E4D9',
  cardBgHex: '#FFFFFF',
  gradientBgHex: '#E8E4D9',
} as const;

export const DARK_SURFACE = {
  bgHex: '#121110',
  textHex: '#FAF8F5',
  mutedHex: '#9C978E',
  borderHex: '#2B2824',
  cardBgHex: '#1A1917',
  gradientBgHex: '#1E1C1A',
} as const;

export const getSurfaceForMode = (mode: ThemeMode) =>
  mode === 'dark' ? DARK_SURFACE : LIGHT_SURFACE;

/** Resolves the theme actually rendered for a profile (preset, custom or fallback). */
export const resolveActiveTheme = (profile: ConnProfile): ThemeOption =>
  profile.themeId === 'custom' && profile.customTheme
    ? profile.customTheme
    : EDITORIAL_THEMES.find((t) => t.id === profile.themeId) ||
      profile.customTheme ||
      EDITORIAL_THEMES[0];

/** Infers the mode of a theme when it was never set explicitly, from its background luminance. */
export const getThemeMode = (theme: ThemeOption): ThemeMode => {
  if (theme.mode) return theme.mode;
  const hex = (theme.bgHex || '#FFFFFF').replace('#', '');
  if (hex.length !== 6) return 'light';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5 ? 'dark' : 'light';
};

/** Returns the theme re-surfaced for the requested mode, keeping accent and typography. */
export const withThemeMode = (theme: ThemeOption, mode: ThemeMode): ThemeOption => ({
  ...theme,
  ...getSurfaceForMode(mode),
  mode,
});

/**
 * Switches the profile's rendered theme between light and dark.
 * Preset themes are forked into an editable custom theme so the switch persists
 * on the public page exactly like a Theme Studio change.
 */
export const applyProfileThemeMode = (
  profile: ConnProfile,
  mode: ThemeMode
): ConnProfile => {
  const activeTheme = resolveActiveTheme(profile);
  const nextTheme = withThemeMode(activeTheme, mode);

  return {
    ...profile,
    themeId: 'custom',
    customTheme: nextTheme,
  };
};

/** Maps ThemeOption.fontSize to the type-scale class declared in index.css. */
export const getTypeScaleClass = (fontSize?: 'sm' | 'md' | 'lg'): string => {
  if (fontSize === 'sm') return 'type-scale-sm';
  if (fontSize === 'lg') return 'type-scale-lg';
  return '';
};

/** Maps a theme font token to its Tailwind font-family utility. */
export const getFontFamilyClass = (
  token?: 'serif-display' | 'serif-editorial' | 'sans-ui' | 'mono-code'
): string => {
  switch (token) {
    case 'serif-display':
      return 'font-serif-display';
    case 'serif-editorial':
      return 'font-serif-editorial';
    case 'mono-code':
      return 'font-mono-code';
    case 'sans-ui':
      return 'font-sans-ui';
    default:
      return '';
  }
};
