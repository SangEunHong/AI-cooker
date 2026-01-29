import React from 'react';
import '../style/Navbar.css';

function SideNavRight({ activeMenu, setActiveMenu }) {
  const menus = [
    { id: 'ai-chat', label: 'AI채팅', icon: '💬' },
    { id: 'community', label: '커뮤니티', icon: '👩🏻‍👧🏻‍👦🏻' },
    { id: 'my-page', label: '마이페이지', icon: '🙂' }
  ];

  return (
    <nav className="side-nav right">
      {menus.map(menu => (
        <button 
          key={menu.id}
          className={`nav-btn ${activeMenu === menu.id ? 'active' : ''}`}
          onClick={() => setActiveMenu(menu.id)}
          data-icon={menu.icon}
          data-label={menu.label}
        >
          {menu.icon}
        </button>
      ))}
    </nav>
  );
}

export default SideNavRight;