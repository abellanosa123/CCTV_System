import React from 'react';
import cccLogo from '../assets/ccc-logo.png';
import cctvUnitLogo from '../assets/CCTVUnit_logo_cropped.png';

export default function DashboardParentHeader() {
  return (
    <div style={{ 
      margin: '0 0 20px 0', 
      padding: '16px 24px', 
      background: '#241141', 
      border: '1px solid rgba(139, 92, 246, 0.3)', 
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={cccLogo} alt="CCC Logo" style={{ width: '70px', height: '80px', objectFit: 'contain' }} />
      </div>
      <div style={{ textAlign: 'center', flex: 1, padding: '0 20px' }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#c8b4e6', letterSpacing: '2px', marginBottom: '6px' }}>
          CITY GOVERNMENT OF MALAYBALAY
        </div>
        <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#ff78ff', marginBottom: '12px' }}>
          CITY DISASTER RISK REDUCTION & MANAGEMENT OFFICE
        </div>
        <div style={{ 
          background: '#0f1e2d', 
          border: '1px solid #0096c8', 
          borderRadius: '20px', 
          padding: '6px 24px', 
          display: 'inline-block' 
        }}>
          <div style={{ fontSize: '13px', color: '#0febdc', fontWeight: 'bold', letterSpacing: '1.5px', marginBottom: '2px' }}>
            COMMUNICATION COMMAND CENTRAL
          </div>
          <div style={{ fontSize: '10px', color: '#0febdc', letterSpacing: '3px' }}>
            CCTV UNIT
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={cctvUnitLogo} alt="CCTV Unit Logo" style={{ width: '70px', height: '70px', objectFit: 'contain' }} />
      </div>
    </div>
  );
}
