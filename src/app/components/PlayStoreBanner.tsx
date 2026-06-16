import { useState } from 'react';

export function PlayStoreBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'linear-gradient(90deg, #1B4FD8 0%, #0E3AA8 100%)',
        color: '#fff',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.15)',
        fontFamily: 'Lato, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <img
          src="/icon-darni.png"
          alt="Darni"
          style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0 }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: '14px', lineHeight: 1.2 }}>
            L'app Darni arrive bientôt 🇩🇿
          </div>
          <div style={{ fontSize: '12px', opacity: 0.85, lineHeight: 1.2 }}>
            Soyez parmi les premiers à la tester sur Android
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        
          href="https://play.google.com/apps/internaltest/4700676223053107145"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: '#fff',
            color: '#1B4FD8',
            fontWeight: 800,
            fontSize: '13px',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Tester maintenant
        </a>
        <button
          onClick={() => setVisible(false)}
          aria-label="Fermer"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '4px 8px',
            opacity: 0.8,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}