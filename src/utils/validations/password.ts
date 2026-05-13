export type PasswordRuleKey = 'minLength' | 'uppercase' | 'lowercase' | 'number' | 'symbol';

export interface PasswordValidationResult {
  isValid: boolean;
  missingRules: PasswordRuleKey[];
}

export function validatePassword(password: string): PasswordValidationResult {
  const missingRules: PasswordRuleKey[] = [];

  if (!password || password.length < 8) {
    missingRules.push('minLength');
  }
  if (!/[A-Z]/.test(password)) {
    missingRules.push('uppercase');
  }
  if (!/[a-z]/.test(password)) {
    missingRules.push('lowercase');
  }
  if (!/[0-9]/.test(password)) {
    missingRules.push('number');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    missingRules.push('symbol');
  }

  return {
    isValid: missingRules.length === 0,
    missingRules,
  };
}
