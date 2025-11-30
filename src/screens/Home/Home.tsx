import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import './Home.css';

interface Task {
  id: number;
  text: string;
  type: string;
  completed: boolean;
  completedAt?: string;
  scheduled?: boolean;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tasks_v2');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Recargar cuando cambien las tareas en localStorage
  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem('tasks_v2');
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', sync);
    // También verificar periódicamente para cambios en la misma pestaña
    const interval = setInterval(sync, 1000);
    
    return () => {
      window.removeEventListener('storage', sync);
      clearInterval(interval);
    };
  }, []);

  // Filtrar tareas completadas y agrupar por fecha
  const completedTasks = tasks.filter((t) => t.completed && t.completedAt);
  
  const grouped = completedTasks.reduce((acc: any, task) => {
    const date = task.completedAt || '';
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  // Ordenar fechas para la gráfica
  const sortedDates = Object.keys(grouped).sort();
  const last7Days = sortedDates.slice(-7); // Últimos 7 días con actividad

  const chartData = {
    labels: last7Days.length > 0 ? last7Days : ['Sin datos'],
    datasets: [
      {
        label: 'Tareas Completadas',
        data: last7Days.length > 0 ? last7Days.map((date) => grouped[date]) : [0],
        borderColor: 'var(--neon-blue)',
        backgroundColor: 'rgba(77, 252, 255, 0.3)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Calcular racha de días consecutivos
  const calculateStreak = () => {
    if (sortedDates.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Verificar si completó tareas hoy o ayer
    if (sortedDates.includes(today) || sortedDates.includes(yesterdayStr)) {
      streak = 1;
      let checkDate = new Date(sortedDates[sortedDates.length - 1]);
      
      for (let i = sortedDates.length - 2; i >= 0; i--) {
        const prevDate = new Date(sortedDates[i]);
        const daysDiff = Math.floor((checkDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          streak++;
          checkDate = prevDate;
        } else {
          break;
        }
      }
    }
    
    return streak;
  };

  const totalCompleted = completedTasks.length;
  const activeDays = Object.keys(grouped).length;
  const streak = calculateStreak();

  return (
    <div className="home-container">
      <h2 className="home-title">Tu Progreso</h2>

      <div className="chart-wrapper">
        {last7Days.length > 0 ? (
          <Line 
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  display: true,
                  labels: {
                    color: '#fff',
                  },
                },
              },
              scales: {
                x: {
                  ticks: { color: '#ccc' },
                  grid: { color: '#222' },
                },
                y: {
                  ticks: { color: '#ccc', stepSize: 1 },
                  grid: { color: '#222' },
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
            <p>Completa tareas para ver tu progreso aquí</p>
          </div>
        )}
      </div>

      <h3 className="home-subtitle">Estadísticas</h3>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Tareas completadas</h4>
          <p>{totalCompleted}</p>
        </div>

        <div className="stat-card">
          <h4>Días activos</h4>
          <p>{activeDays}</p>
        </div>

        <div className="stat-card">
          <h4>Racha</h4>
          <p>🔥 {streak} días</p>
        </div>
      </div>
    </div>
  );
}
