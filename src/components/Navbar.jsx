// src/components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// 🌐 內建完整多語系對照表，確保切換語言時導覽列文字能立即改變
const NAVBAR_TRANSLATIONS = {
  'zh-TW': {
    home: '明細',
    stats: '分析',
    wallets: '錢包・目標',
    history: '月報',
    settings: '設定'
  },
  'zh-CN': {
    home: '明细',
    stats: '分析',
    wallets: '账户・目标',
    history: '月报',
    settings: '设置'
  },
  'en': {
    home: 'Transactions',
    stats: 'Stats',
    wallets: 'Wallets & Goals',
    history: 'History',
    settings: 'Settings'
  },
  'ja': {
    home: '明細',
    stats: '分析',
    wallets: '口座・目標',
    history: '月報',
    settings: '設定'
  },
  'ko': {
    home: '내역',
    stats: '통계',
    wallets: '지갑·목표',
    history: '월간',
    settings: '설정'
  }
};

function Navbar({ isDarkMode }) {
  // 🌐 取得全域語言狀態 (lang) 與字典 (t)
  const { lang, t } = useAppContext();

  // 取得當前語言對應的字典，若無則預設為繁體中文
  const currentLang = lang || 'zh-TW';
  const dict = NAVBAR_TRANSLATIONS[currentLang] || NAVBAR_TRANSLATIONS['zh-TW'];

  const linkStyle = ({ isActive }) => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '10px 4px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
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
          padding: 8px 6px;
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
          <span>📝</span> {t?.navHome || dict.home}
        </NavLink>
        <NavLink to="/stats" style={linkStyle}>
          <span>📊</span> {t?.navStats || dict.stats}
        </NavLink>
        <NavLink to="/wallets" style={linkStyle}>
          <span>👛</span> {t?.navWallets || dict.wallets}
        </NavLink>
        <NavLink to="/history" style={linkStyle}>
          <span>📅</span> {t?.navHistory || dict.history}
        </NavLink>
        <NavLink to="/settings" style={linkStyle}>
          <span>⚙️</span> {t?.navSettings || dict.settings}
        </NavLink>
      </nav>
    </>
  );
}

export default Navbar;