import { useState } from 'react';
import BottomTabs from './components/BottomTabs';
import Week from './screens/Weeks/Weeks';
import Todos from './screens/Todo/Todo';
import Home from './screens/Home/Home';
import Focus from './screens/Focus/Focus';
import AI from './screens/AI/AI';
import Profile from './screens/Profile/Profile';

function App() {
  const [tab, setTab] = useState('home');
  const [reloadWeek, setReloadWeek] = useState(false);

  const renderTab = () => (
    <div style={{ paddingBottom: 70 }}>
      <div style={{ display: tab === 'home' ? 'block' : 'none' }}>
        <Home />
      </div>

      <div style={{ display: tab === 'todos' ? 'block' : 'none' }}>
        <Todos />
      </div>

      <div style={{ display: tab === 'week' ? 'block' : 'none' }}>
        <Week reload={reloadWeek} />
      </div>

      <div style={{ display: tab === 'focus' ? 'block' : 'none' }}>
        <Focus />
      </div>

      <div style={{ display: tab === 'insights' ? 'block' : 'none' }}>
        <AI />
      </div>

      <div style={{ display: tab === 'profile' ? 'block' : 'none' }}>
        <Profile />
      </div>
    </div>
  );

  return (
    <>
      {renderTab()}
      <BottomTabs
        current={tab}
        setCurrent={(t) => {
          setTab(t);
          if (t === 'week') setReloadWeek((x) => !x);
        }}
      />
    </>
  );
}

export default App;
