import { BiometricAuth, BiometryType, CheckBiometryResult } from '@aparajita/capacitor-biometric-auth';
import { Capacitor } from '@capacitor/core';

export type BiometryAvailability =
  | { available: false; reason: string }
  | { available: true; biometryType: BiometryType };

export async function checkBiometry(): Promise<BiometryAvailability> {
  if (!Capacitor.isNativePlatform()) {
    return { available: false, reason: 'Not a native platform' };
  }

  const result: CheckBiometryResult = await BiometricAuth.checkBiometry();

  if (!result.isAvailable) {
    return { available: false, reason: result.reason || 'Not available' };
  }

  return { available: true, biometryType: result.biometryType };
}

export async function authenticateWithBiometry(reason?: string): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;

  try {
    await BiometricAuth.authenticate({
      reason: reason ?? 'Authenticate to access ɳTask',
      cancelTitle: 'Cancel',
      allowDeviceCredential: true,
      iosFallbackTitle: 'Use Passcode',
      androidTitle: 'ɳTask Authentication',
      androidSubtitle: 'Sign in securely',
      androidConfirmationRequired: false,
    });
    return true;
  } catch {
    return false;
  }
}
