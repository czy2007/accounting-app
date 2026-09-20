import React from 'react';
import { NavLink } from 'react-router-dom';

function Navbar({ isDarkMode }) {
  const linkStyle = ({ isActive }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '15px',
    transition: 'all 0.2s ease',
    color: isActive 
      ? '#ffffff' 
      : isDarkMode ? '#94a3b8' : '#475569',
    backgroundColor: isActive 
      ? (isDarkMode ? '#0284c7' : '#1e3a8a') 
      : 'transparent',
  });

  return (
    <>
      <style>{`
        /* 📱 預設：手機版樣式（固定在最底部貼滿） */
        .responsive-navbar {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 12px;
          box-sizing: border-box;
          background-color: ${isDarkMode ? 'rgba(30, 41, 59, 0.98)' : 'rgba(255, 255, 255, 0.98)'};
          backdrop-filter: blur(10px);
          border-top: ${isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'};
          box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.08);
        }

        /* 💻 電腦版樣式（螢幕寬度 >= 768px 時，放回最上方） */
        @media (min-width: 768px) {
          .responsive-navbar {
            position: relative;
            bottom: auto;
            left: auto;
            width: 100%;
            max-width: 960px;
            margin: 0 auto 20px auto;
            padding: 8px;
            border-radius: 16px;
            border-top: none;
            border: ${isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
        }
      `}</style>

      <nav className="responsive-navbar">
        <NavLink to="/" style={linkStyle}>
          <span>📝</span> 記帳明細
        </NavLink>
        <NavLink to="/stats" style={linkStyle}>
          <span>📊</span> 財務分析
        </NavLink>
        <NavLink to="/settings" style={linkStyle}>
          <span>⚙️</span> 系統設定
        </NavLink>
      </nav>
    </>
  );
}

export default Navbar;