import { describe, expect, it } from 'vitest';
import {
  colorsForPreference,
  colorsForScheme,
  darkColors,
  lightColors,
  resolveScheme,
} from './themes';
import { brand } from './tokens';

describe('resolveScheme', () => {
  it('follows system when preference is system', () => {
    expect(resolveScheme('system', 'dark')).toBe('dark');
    expect(resolveScheme('system', 'light')).toBe('light');
    expect(resolveScheme('system', null)).toBe('light');
  });

  it('forces light or dark regardless of system', () => {
    expect(resolveScheme('light', 'dark')).toBe('light');
    expect(resolveScheme('dark', 'light')).toBe('dark');
  });
});

describe('colorsForScheme', () => {
  it('returns the matching palette', () => {
    expect(colorsForScheme('dark')).toBe(darkColors);
    expect(colorsForScheme('light')).toBe(lightColors);
  });
});

describe('colorsForPreference', () => {
  it('uses forced dark over light system', () => {
    expect(colorsForPreference('dark', 'light')).toBe(darkColors);
  });
});

describe('brand tokens', () => {
  it('wires light beginner accent from brand green', () => {
    expect(lightColors.beginner).toBe(brand.green.light);
    expect(darkColors.beginner).toBe(brand.green.dark);
  });
});
