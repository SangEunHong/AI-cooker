import React from 'react';

function SideNavRight({ activeMenu, setActiveMenu }) {
  const menus = [
    { id: 'meat', label: 'AI채팅', icon: '💬' },
    { id: 'vege', label: '요리모드', icon: '🍽️' },
    { id: 'processed', label: '커뮤니티', icon: '👩🏻‍👧🏻‍👦🏻' },
    { id: 'add', label: '마이페이지', icon: '🙂' }
  ];

  return (
    <nav className="side-nav left">
      {menus.map(menu => (
        <button 
          key={menu.id}
          className={`nav-btn ${activeMenu === menu.id ? 'active' : ''}`}
          onClick={() => setActiveMenu(menu.id)}
        >
          {menu.icon}
        </button>
      ))}
    </nav>
  );
}

export default SideNavRight;