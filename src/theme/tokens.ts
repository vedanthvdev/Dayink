/**
 * Brand color primitives — edit these to retheme the app.
 * Light/dark themes in `themes.ts` compose semantic roles from these tokens.
 *
 * Tip: keep light + dark pairs in sync (same role, different luminance).
 */
export const brand = {
  /** Primary brand green (Beginner / success / Quiz CTA). */
  green: {
    light: '#3D8F6A',
    dark: '#7BC4A0',
    softLight: '#D8EDE2',
    softDark: 'rgba(123, 196, 160, 0.22)',
  },
  /** Intermediate / warm accent. */
  amber: {
    light: '#C56A35',
    dark: '#E0A278',
    softLight: '#F5E2D2',
    softDark: 'rgba(224, 162, 120, 0.22)',
  },
  /** Hard / error accent. */
  rose: {
    light: '#B04555',
    dark: '#E0909C',
    softLight: '#F3D9DE',
    softDark: 'rgba(224, 144, 156, 0.22)',
  },
  /** Ink on light surfaces / light text on dark surfaces. */
  ink: {
    onLight: '#1A2620',
    onDark: '#EFF4F0',
    mutedOnLight: '#66756C',
    mutedOnDark: '#9AABA1',
    tipOnLight: '#3F4E46',
    tipOnDark: '#C9D5CE',
    chipTextOnLight: '#4A5A52',
    chipTextOnDark: '#B7C6BC',
  },
  /** Page backgrounds (also drive gradients). */
  paper: {
    light: '#F6F1E8',
    lightAccent: '#E7EFE4',
    lightDeep: '#EDE6DA',
    dark: '#0F1412',
    darkAccent: '#17201C',
    darkDeep: '#0B100E',
  },
} as const;

/** Native splash / adaptive icon anchors (keep aligned with paper/ink). */
export const nativeChrome = {
  splashBackground: '#F7F3EA',
  androidIconBackground: brand.ink.onLight,
} as const;
