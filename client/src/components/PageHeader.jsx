import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="premium-page-header">
      <div className="premium-header-deco-line" />
      <div className="premium-header-orb premium-header-orb-1" />
      <div className="premium-header-orb premium-header-orb-2" />
      
      <div className="premium-header-content">
        <div>
          <h2 className="premium-header-title">{title}</h2>
          {subtitle && <p className="premium-header-subtitle">{subtitle}</p>}
        </div>
        {children && <div className="premium-header-actions">{children}</div>}
      </div>
    </div>
  );
}
