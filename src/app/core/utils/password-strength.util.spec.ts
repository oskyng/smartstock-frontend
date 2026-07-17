import { passwordStrength } from './password-strength.util';

describe('passwordStrength', () => {
  it('should return debil for an empty or null value', () => {
    expect(passwordStrength('')).toBe('debil');
    expect(passwordStrength(null)).toBe('debil');
    expect(passwordStrength(undefined)).toBe('debil');
  });

  it('should return debil for a short simple password', () => {
    expect(passwordStrength('abc')).toBe('debil');
  });

  it('should return media for a password meeting only length + case', () => {
    expect(passwordStrength('Password')).toBe('media');
  });

  it('should return fuerte for a long password with mixed case, numbers and symbols', () => {
    expect(passwordStrength('Str0ng!Passw0rd')).toBe('fuerte');
  });
});
