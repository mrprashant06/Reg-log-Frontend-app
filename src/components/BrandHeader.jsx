import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export default function BrandHeader({ theme = 'violet', badgeText, title, subtitle }) {
  return (
    <div className="brand-header">
      <div className="brand-badge">
        {theme === 'violet' ? (
          <Sparkles size={14} className="badge-icon" />
        ) : (
          <ShieldCheck size={14} className="badge-icon" />
        )}
        <span>{badgeText || 'AURA PLATFORM'}</span>
      </div>
      <h1 className="brand-title">{title}</h1>
      {subtitle && <p className="brand-subtitle">{subtitle}</p>}
    </div>
  );
}
