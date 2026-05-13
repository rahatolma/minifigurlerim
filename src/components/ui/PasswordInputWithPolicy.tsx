'use client';

import { useState } from 'react';
import PasswordInput from './PasswordInput';
import PasswordPolicyChecklist from './PasswordPolicyChecklist';
import { validatePassword } from '@/utils/validations/password';

interface PasswordInputWithPolicyProps {
  id: string;
  name: string;
  placeholder: string;
  required?: boolean;
}

export default function PasswordInputWithPolicy({ id, name, placeholder, required }: PasswordInputWithPolicyProps) {
  const [password, setPassword] = useState('');
  
  // Custom validation pattern for HTML5 validation (prevents submit if invalid)
  const pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?\":{}|<>]).{8,}$";

  return (
    <div className="w-full space-y-4">
      <PasswordInput
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        pattern={pattern}
        title="Şifreniz tüm güvenlik kurallarını karşılamalıdır."
      />
      
      {/* We only show the checklist if it's rendered, the parent will conditionally render this component for Register only */}
      <PasswordPolicyChecklist password={password} />
    </div>
  );
}
