import { useState } from 'react';
import SideNavLeft from '../components/SideNavLeft';
import SideNavRight from '../components/SideNavRight';
import AddIngredient from './AddIngredient'; 
import FridgeList from './FridgeList';
import Chatting from './Chatting';
import EditIngredient from './Editingredient';
import '../style/Fridge.css';

function Fridge() {
  const [activeMenu, setActiveMenu] = useState('add'); // 기본값: 재료 추가

  // 현재 activeMenu에 따라 어떤 컴포넌트를 보여줄지 결정하는 함수
  const renderMain = () => {
    switch (activeMenu) {
      case 'add': return <AddIngredient />;
      case 'list': return <FridgeList/>;
      case 'ai-chat': return <Chatting/>;
      case 'edit':return <EditIngredient/>;
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