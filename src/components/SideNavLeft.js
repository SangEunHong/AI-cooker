import React from 'react';
import '../style/Navbar.css';

function SideNavLeft({ activeMenu, setActiveMenu }) {
  const menus = [
    { id: 'list', label: '냉장고', icon: '❄️' },
    { id: 'edit', label: '재료 편집', icon: '✂️' },
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