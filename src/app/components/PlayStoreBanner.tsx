import { useState } from 'react';

const bannerStyle = {
  position: 'fixed' as const,
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
};

const leftGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  minWidth: 0,
};

const iconStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  flexShrink: 0,
};

const titleStyle = {
  fontWeight: 800,
  fontSize: '14px',
  lineHeight: 1.2,
};

const subtitleStyle = {
  fontSize: '12px',
  opacity: 0.85,
  lineHeight: 1.2,
};

const rightGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  flexShrink: 0,
};

const ctaStyle = {
  background: '#fff',
  color: '#1B4FD8',
  fontWeight: 800,
  fontSize: '13px',
  padding: '8px 16px',
  borderRadius: '8px',
  textDecoration: 'none',
  whiteSpace: 'nowrap' as const,
};

const badgeStyle = {
  height: '42px',
  display: 'block',
};

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: '20px',
  cursor: 'pointer',
  padding: '4px 8px',
  opacity: 0.8,
  lineHeight: 1,
};

export function PlayStoreBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div style={bannerStyle}>
      <div style={leftGroupStyle}>
        <img src="/icon-darni.png" alt="Darni" style={iconStyle} />
        <div>
          <div style={titleStyle}>L'app Darni arrive bientot</div>
          <div style={subtitleStyle}>Soyez parmi les premiers a la tester sur Android</div>
        </div>
      </div>

      <div style={rightGroupStyle}>
        <a
          href="https://play.google.com/apps/internaltest/4700676223053107145"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src="/playstore-badge.png"
            alt="Disponible sur Google Play"
            style={badgeStyle}
          />
        </a>
        <button onClick={() => setVisible(false)} aria-label="Fermer" style={closeButtonStyle}>
          x
        </button>
      </div>
    </div>
  );
}