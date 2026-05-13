'use client';

import { useTranslations } from 'next-intl';
import { PasswordRuleKey, validatePassword } from '@/utils/validations/password';
import { Check, X } from 'lucide-react';
import { useMemo } from 'react';

interface PasswordPolicyChecklistProps {
  password?: string;
  className?: string;
}

export default function PasswordPolicyChecklist({ password = '', className = '' }: PasswordPolicyChecklistProps) {
  const t = useTranslations('Navigation');
  
  const validation = useMemo(() => validatePassword(password), [password]);
  const missingRules = validation.missingRules;

  const rules: { key: PasswordRuleKey; label: string }[] = [
    { key: 'minLength', label: t('PasswordPolicy_minLength') },
    { key: 'uppercase', label: t('PasswordPolicy_uppercase') },
    { key: 'lowercase', label: t('PasswordPolicy_lowercase') },
    { key: 'number', label: t('PasswordPolicy_number') },
    { key: 'symbol', label: t('PasswordPolicy_symbol') },
  ];

  return (
    <div className={`bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs ${className}`}>
      <p className="font-black text-gray-900 mb-2 uppercase tracking-wide text-[10px]">{t('PasswordPolicy_title')}</p>
      <ul className="space-y-1.5">
        {rules.map((rule) => {
          const isMet = password.length > 0 && !missingRules.includes(rule.key);
          return (
            <li 
              key={rule.key} 
              className={`flex items-center gap-2 font-semibold transition-colors duration-200 ${isMet ? 'text-green-600' : 'text-gray-500'}`}
            >
              {isMet ? (
                <Check className="w-3.5 h-3.5 flex-shrink-0 stroke-[3]" />
              ) : (
                <X className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
              )}
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
