import { useState } from 'react';
import SideNavLeft from '../components/SideNavLeft';
import SideNavRight from '../components/SideNavRight';
// 8개의 컴포넌트를 모두 import 합니다.
import AddIngredient from './AddIngredient'; 
//import MeatList from './MeatList';
// ... 나머지 6개 생략

function Fridge() {
  const [activeMenu, setActiveMenu] = useState('add'); // 기본값: 재료 추가

  // 현재 activeMenu에 따라 어떤 컴포넌트를 보여줄지 결정하는 함수
  const renderMain = () => {
    switch (activeMenu) {
      case 'add': return <AddIngredient />;
      //case 'meat': return <MeatList />;
      //case 'vege': return <VegetableList />;
      // ... 총 8개의 케이스를 작성
      default: return <AddIngredient />;
    }
  };

  return (
    <div className="fridge-container">
      {/* 왼쪽 네비게이션 (4개 버튼) */}
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