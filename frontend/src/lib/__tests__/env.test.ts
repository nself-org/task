import { describe, it, expect } from 'vitest';
import {
  env,
  isDevEnvironment,
  isStagingEnvironment,
  isProductionEnvironment,
  shouldEnableDevTools,
  shouldEnableFauxSignin,
  getEnvironmentName,
  getEnvironmentColor,
} from '../env';

describe('Environment Detection', () => {
  describe('Environment Config', () => {
    it('should have defined environment type', () => {
      expect(env.env).toBeDefined();
      expect(typeof env.env).toBe('string');
    });

    it('should have boolean flags for each environment', () => {
      expect(typeof env.isDevelopment).toBe('boolean');
      expect(typeof env.isStaging).toBe('boolean');
      expect(typeof env.isProduction).toBe('boolean');
    });

    it('should have server/client detection', () => {
      expect(typeof env.isServer).toBe('boolean');
      expect(typeof env.isClient).toBe('boolean');
      // In test environment, might be server-side
    });

    it('should have api url configured', () => {
      expect(typeof env.apiUrl).toBe('string');
    });
  });

  describe('Feature Flags', () => {
    it('should have dev tools flag', () => {
      expect(typeof env.enableDevTools).toBe('boolean');
    });

    it('should have faux-signin flag', () => {
      expect(typeof env.enableFauxSignin).toBe('boolean');
    });

    it('should only enable faux-signin in development', () => {
      if (env.isDevelopment) {
        expect(env.enableFauxSignin).toBe(true);
      } else {
        expect(env.enableFauxSignin).toBe(false);
      }
    });

    it('should enable dev tools in development and staging', () => {
      if (env.isDevelopment || env.isStaging) {
        expect(env.enableDevTools).toBe(true);
      } else {
        expect(env.enableDevTools).toBe(false);
      }
    });
  });

  describe('Helper Functions', () => {
    it('isDevEnvironment should match env.isDevelopment', () => {
      expect(isDevEnvironment()).toBe(env.isDevelopment);
    });

    it('isStagingEnvironment should match env.isStaging', () => {
      expect(isStagingEnvironment()).toBe(env.isStaging);
    });

    it('isProductionEnvironment should match env.isProduction', () => {
      expect(isProductionEnvironment()).toBe(env.isProduction);
    });

    it('shouldEnableDevTools should match env.enableDevTools', () => {
      expect(shouldEnableDevTools()).toBe(env.enableDevTools);
    });

    it('shouldEnableFauxSignin should match env.enableFauxSignin', () => {
      expect(shouldEnableFauxSignin()).toBe(env.enableFauxSignin);
    });
  });

  describe('Environment Name and Color', () => {
    it('should return a valid environment name', () => {
      const name = getEnvironmentName();
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });

    it('should return valid color hex code', () => {
      const color = getEnvironmentColor();
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should return correct values for detected environment', () => {
      const name = getEnvironmentName();
      const color = getEnvironmentColor();

      if (env.isDevelopment) {
        expect(name).toBe('Development');
        expect(color).toBe('#10b981');
      } else if (env.isStaging) {
        expect(name).toBe('Staging');
        expect(color).toBe('#f59e0b');
      } else if (env.isProduction) {
        expect(name).toBe('Production');
        expect(color).toBe('#ef4444');
      } else {
        // Test environment or unknown
        expect(name).toBe('Unknown');
        expect(color).toBe('#6b7280');
      }
    });
  });
});
