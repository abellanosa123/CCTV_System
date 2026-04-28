import React from 'react';
import { LogOut, Trash2, AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm' }) {
  if (!isOpen) return null;

  // Pick an appropriate icon based on the confirm action
  const isLogout = confirmLabel.toLowerCase().includes('logout') || confirmLabel.toLowerCase().includes('sign out');
  const isDelete = confirmLabel.toLowerCase().includes('delete') || confirmLabel.toLowerCase().includes('remove');
  const IconComponent = isLogout ? LogOut : isDelete ? Trash2 : AlertTriangle;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div 
        className="confirm-dialog" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(26, 15, 60, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
          padding: '40px'
        }}
      >
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          {/* Decorative Ring */}
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
            zIndex: 0
          }} />
          
          <div style={{ 
            position: 'relative',
            width: '74px',
            height: '74px',
            margin: '0 auto',
            borderRadius: '20px',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            boxShadow: 'inset 0 0 15px rgba(239, 68, 68, 0.2)',
            zIndex: 1
          }}>
            <IconComponent size={36} />
          </div>
        </div>

        <h4 style={{ 
          fontSize: '24px', 
          fontWeight: 800, 
          color: '#fff', 
          marginBottom: '16px',
          letterSpacing: '-0.5px'
        }}>{title || 'Confirm Action'}</h4>
        
        <p style={{ 
          color: 'rgba(196, 181, 253, 0.8)', 
          fontSize: '15px', 
          lineHeight: '1.6', 
          marginBottom: '35px',
          maxWidth: '300px',
          margin: '0 auto 35px'
        }}>{message || 'Are you sure you want to proceed?'}</p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <button 
            className="btn btn-secondary" 
            style={{ 
              padding: '14px 28px', 
              flex: 1, 
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }} 
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            className="btn btn-danger" 
            style={{ 
              padding: '14px 28px', 
              flex: 1, 
              borderRadius: '14px', 
              fontSize: '14px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)', 
              border: 'none',
              boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)'
            }} 
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
