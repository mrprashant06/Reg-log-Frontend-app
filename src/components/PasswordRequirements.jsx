import React from 'react';
import { Check, X } from 'lucide-react';

export default function PasswordRequirements({ password = '', confirmPassword = null }) {
  const criteria = [
    { label: '8+ Characters', met: password.length >= 8 },
    { label: 'Uppercase Letter (A-Z)', met: /[A-Z]/.test(password) },
    { label: 'Lowercase Letter (a-z)', met: /[a-z]/.test(password) },
    { label: 'Numeric Digit (0-9)', met: /\d/.test(password) },
    { label: 'Special Character (!@#$%^&*)', met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) },
  ];

  if (confirmPassword !== null) {
    criteria.push({
      label: 'Passwords Match',
      met: password.length > 0 && password === confirmPassword,
    });
  }

  return (
    <div className="password-requirements-card">
      <div className="requirements-title">Security Checklist</div>
      <div className="requirements-grid">
        {criteria.map((item, index) => (
          <div key={index} className={`requirement-item ${item.met ? 'met' : 'unmet'}`}>
            <span className="req-icon">
              {item.met ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2.5} />}
            </span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
