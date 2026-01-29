import { useState } from 'react';
import SideNavLeft from '../components/SideNavLeft';
import SideNavRight from '../components/SideNavRight';
import AddIngredient from './AddIngredient'; 
import FridgeList from './FridgeList';
import Chatting from './Chatting';
import EditIngredient from './Editingredient';
import Mypage from './Mypage';
import Community from './Community';
import '../style/Fridge.css';

function Fridge() {
  const [activeMenu, setActiveMenu] = useState('add'); // 기본값: 재료 추가

  const renderMain = () => {
    switch (activeMenu) {
      case 'add': return <AddIngredient />;
      case 'list': return <FridgeList/>;
      case 'ai-chat': return <Chatting/>;
      case 'edit':return <EditIngredient/>;
      case 'my-page':return <Mypage/>;
      case 'community':return <Community/>;
      default: return <FridgeList />;
    }
  };

  return (
    <div className="fridge-container">
      {/* 왼쪽 네비게이션 (3개 버튼) */}
      <SideNavLeft activeMenu={activeMenu} setActiveMenu={setActiveMenu} />

      <main className="fridge-main">
        {renderMain()} 
      </main>

      {/* 오른쪽 네비게이션 (4개 버튼) */}
      <SideNavRight activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
    </div>
  );
}

export default Fridge;