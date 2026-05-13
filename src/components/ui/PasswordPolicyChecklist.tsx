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
  const t = useTranslations('Auth');
  
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
    <div className={`px-1 text-xs ${className}`}>
      <p className="font-semibold text-gray-700 mb-2 tracking-tight text-[12px]">{t('PasswordPolicy_title')}</p>
      <ul className="space-y-1.5">
        {rules.map((rule) => {
          const isMet = password.length > 0 && !missingRules.includes(rule.key);
          return (
            <li 
              key={rule.key} 
              className={`flex items-center gap-2 transition-colors duration-300 font-medium text-[11px] ${isMet ? 'text-green-600' : 'text-gray-400'}`}
            >
              <Check className={`w-3.5 h-3.5 flex-shrink-0 transition-opacity duration-300 ${isMet ? 'opacity-100 stroke-[2.5]' : 'opacity-30 stroke-[2]'}`} />
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
