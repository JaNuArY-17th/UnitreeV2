import { signupLocales } from '../signup';

describe('Signup Locales', () => {
  it('should have all required translation keys in Vietnamese', () => {
    const vi = signupLocales.vi;
    
    // Check main structure
    expect(vi.title).toBeDefined();
    expect(vi.userType).toBeDefined();
    expect(vi.userType.store).toBeDefined();
    expect(vi.userType.user).toBeDefined();
    
    // Check input placeholders
    expect(vi.fullNameInput.placeholder).toBeDefined();
    expect(vi.phoneInput.placeholder).toBeDefined();
    expect(vi.passwordInput.placeholder).toBeDefined();
    expect(vi.confirmPasswordInput.placeholder).toBeDefined();
    expect(vi.emailInput.placeholder).toBeDefined();
    expect(vi.storeNameInput.placeholder).toBeDefined();
    expect(vi.storeAddressInput.placeholder).toBeDefined();
    
    // Check buttons
    expect(vi.button.register).toBeDefined();
    expect(vi.login.title).toBeDefined();
    expect(vi.login.button).toBeDefined();
    
    // Check validation messages
    expect(vi.validation.fullNameRequired).toBeDefined();
    expect(vi.validation.phoneRequired).toBeDefined();
    expect(vi.validation.passwordRequired).toBeDefined();
    expect(vi.validation.confirmPasswordRequired).toBeDefined();
    expect(vi.validation.passwordMismatch).toBeDefined();
    
    // Check error messages
    expect(vi.errors.registrationFailed).toBeDefined();
    expect(vi.errors.unexpectedError).toBeDefined();
  });

  it('should have all required translation keys in English', () => {
    const en = signupLocales.en;
    
    // Check main structure
    expect(en.title).toBeDefined();
    expect(en.userType).toBeDefined();
    expect(en.userType.store).toBeDefined();
    expect(en.userType.user).toBeDefined();
    
    // Check input placeholders
    expect(en.fullNameInput.placeholder).toBeDefined();
    expect(en.phoneInput.placeholder).toBeDefined();
    expect(en.passwordInput.placeholder).toBeDefined();
    expect(en.confirmPasswordInput.placeholder).toBeDefined();
    expect(en.emailInput.placeholder).toBeDefined();
    expect(en.storeNameInput.placeholder).toBeDefined();
    expect(en.storeAddressInput.placeholder).toBeDefined();
    
    // Check buttons
    expect(en.button.register).toBeDefined();
    expect(en.login.title).toBeDefined();
    expect(en.login.button).toBeDefined();
    
    // Check validation messages
    expect(en.validation.fullNameRequired).toBeDefined();
    expect(en.validation.phoneRequired).toBeDefined();
    expect(en.validation.passwordRequired).toBeDefined();
    expect(en.validation.confirmPasswordRequired).toBeDefined();
    expect(en.validation.passwordMismatch).toBeDefined();
    
    // Check error messages
    expect(en.errors.registrationFailed).toBeDefined();
    expect(en.errors.unexpectedError).toBeDefined();
  });

  it('should have consistent structure between Vietnamese and English', () => {
    const vi = signupLocales.vi;
    const en = signupLocales.en;
    
    // Check that both languages have the same structure
    expect(Object.keys(vi)).toEqual(Object.keys(en));
    expect(Object.keys(vi.userType)).toEqual(Object.keys(en.userType));
    expect(Object.keys(vi.validation)).toEqual(Object.keys(en.validation));
    expect(Object.keys(vi.errors)).toEqual(Object.keys(en.errors));
  });
});
