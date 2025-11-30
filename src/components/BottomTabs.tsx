import { Home, ListTodo, Calendar, Timer, BarChart2, User } from 'lucide-react';

interface BottomTabsProps {
  current: string;
  setCurrent: (tab: string) => void;
}

export default function BottomTabs({ current, setCurrent }: BottomTabsProps) {
  const tabs = [
    { id: 'home', icon: <Home size={22} />, label: 'Inicio' },
    { id: 'todos', icon: <ListTodo size={22} />, label: 'Tareas' },
    { id: 'week', icon: <Calendar size={22} />, label: 'Semana' },
    { id: 'focus', icon: <Timer size={22} />, label: 'Enfoque' },
    { id: 'insights', icon: <BarChart2 size={22} />, label: 'IA' },
    { id: 'profile', icon: <User size={22} />, label: 'Perfil' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        background: '#050505',
        borderTop: '1px solid #111',
        zIndex: 20,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrent(tab.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: current === tab.id ? 'var(--neon-pink)' : '#666',
            textAlign: 'center',
            cursor: 'pointer',
            fontSize: '11px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
