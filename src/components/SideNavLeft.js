import React from 'react';
import '../style/Navbar.css';

function SideNavLeft({ activeMenu, setActiveMenu }) {
  const menus = [
    { id: 'meat', label: '육류', icon: '🥩' },
    { id: 'vege', label: '채소', icon: '🥦' },
    { id: 'processed', label: '가공육', icon: '🥫' },
    { id: 'add', label: '재료 추가', icon: '➕' }
  ];

  return (
    <nav className="side-nav left">
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

export default SideNavLeft;