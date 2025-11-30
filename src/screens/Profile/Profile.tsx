import { useEffect, useState } from 'react';
import {  Trophy, Target, Settings, Download, Trash2, Edit2, Save, X } from 'lucide-react';
import './Profile.css';

interface UserProfile {
  name: string;
  avatar: string;
  goal: string;
  dailyGoal: number;
}

interface Stats {
  totalTasks: number;
  completedTasks: number;
  activeDays: number;
  currentStreak: number;
  scheduledTasks: number;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: 'Usuario',
      avatar: 'U',
      goal: '',
      dailyGoal: 5,
    };
  });

  const [stats, setStats] = useState<Stats>({
    totalTasks: 0,
    completedTasks: 0,
    activeDays: 0,
    currentStreak: 0,
    scheduledTasks: 0,
  });

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editGoal, setEditGoal] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Cargar perfil
  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      setProfile(JSON.parse(saved));
    }
  }, []);

  // Guardar perfil
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(profile));
  }, [profile]);

  // Calcular estadísticas
  useEffect(() => {
    const tasks = JSON.parse(localStorage.getItem('tasks_v2') || '[]');

    const completed = tasks.filter((t: any) => t.completed && t.completedAt);
    const scheduled = tasks.filter((t: any) => t.scheduled);

    // Agrupar tareas completadas por fecha
    const grouped = completed.reduce((acc: any, task: any) => {
      const date = task.completedAt || '';
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const sortedDates = Object.keys(grouped).sort();
    const activeDays = sortedDates.length;

    // Calcular racha
    let streak = 0;
    if (sortedDates.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

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
    }

    setStats({
      totalTasks: tasks.length,
      completedTasks: completed.length,
      activeDays,
      currentStreak: streak,
      scheduledTasks: scheduled.length,
    });
  }, []);

  // Sincronizar estadísticas cuando cambien los datos
  useEffect(() => {
    const sync = () => {
      const tasks = JSON.parse(localStorage.getItem('tasks_v2') || '[]');

      const completed = tasks.filter((t: any) => t.completed && t.completedAt);
      const scheduled = tasks.filter((t: any) => t.scheduled);

      const grouped = completed.reduce((acc: any, task: any) => {
        const date = task.completedAt || '';
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const sortedDates = Object.keys(grouped).sort();
      const activeDays = sortedDates.length;

      let streak = 0;
      if (sortedDates.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

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
      }

      setStats({
        totalTasks: tasks.length,
        completedTasks: completed.length,
        activeDays,
        currentStreak: streak,
        scheduledTasks: scheduled.length,
      });
    };

    window.addEventListener('storage', sync);
    const interval = setInterval(sync, 2000);

    return () => {
      window.removeEventListener('storage', sync);
      clearInterval(interval);
    };
  }, []);

  const handleEditName = () => {
    setEditName(profile.name);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      const initial = editName.trim().charAt(0).toUpperCase();
      setProfile({ ...profile, name: editName.trim(), avatar: initial });
    }
    setIsEditingName(false);
  };

  const handleCancelName = () => {
    setIsEditingName(false);
    setEditName('');
  };

  const handleEditGoal = () => {
    setEditGoal(profile.goal);
    setIsEditingGoal(true);
  };

  const handleSaveGoal = () => {
    setProfile({ ...profile, goal: editGoal.trim() });
    setIsEditingGoal(false);
  };

  const handleCancelGoal = () => {
    setIsEditingGoal(false);
    setEditGoal('');
  };

  const handleDailyGoalChange = (value: number) => {
    if (value >= 1 && value <= 50) {
      setProfile({ ...profile, dailyGoal: value });
    }
  };

  const exportData = () => {
    const data = {
      profile,
      tasks: JSON.parse(localStorage.getItem('tasks_v2') || '[]'),
      events: JSON.parse(localStorage.getItem('calendarEvents') || '[]'),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetData = () => {
    localStorage.removeItem('tasks_v2');
    localStorage.removeItem('calendarEvents');
    setProfile({
      name: 'Usuario',
      avatar: 'U',
      goal: '',
      dailyGoal: 5,
    });
    setStats({
      totalTasks: 0,
      completedTasks: 0,
      activeDays: 0,
      currentStreak: 0,
      scheduledTasks: 0,
    });
    setShowResetConfirm(false);
    window.location.reload();
  };

  const completionRate = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;
  const todayCompleted = (() => {
    const today = new Date().toISOString().split('T')[0];
    const tasks = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
    return tasks.filter((t: any) => t.completed && t.completedAt === today).length;
  })();
  const goalProgress = profile.dailyGoal > 0 ? Math.min(100, Math.round((todayCompleted / profile.dailyGoal) * 100)) : 0;

  return (
    <div className="profile-container">
      {/* Header con Avatar y Nombre */}
      <div className="profile-header">
        <div className="profile-avatar">
          <span>{profile.avatar}</span>
        </div>
        <div className="profile-name-section">
          {isEditingName ? (
            <div className="profile-edit-group">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="profile-edit-input"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelName();
                }}
              />
              <button onClick={handleSaveName} className="profile-edit-btn save">
                <Save size={16} />
              </button>
              <button onClick={handleCancelName} className="profile-edit-btn cancel">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <h2 className="profile-name">{profile.name}</h2>
              <button onClick={handleEditName} className="profile-edit-icon">
                <Edit2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Meta Diaria */}
      <div className="profile-daily-goal">
        <div className="daily-goal-header">
          <Target size={20} />
          <h3>Meta Diaria</h3>
        </div>
        <div className="daily-goal-content">
          <div className="daily-goal-progress">
            <div className="daily-goal-bar">
              <div
                className="daily-goal-fill"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
            <span className="daily-goal-text">
              {todayCompleted} / {profile.dailyGoal} tareas
            </span>
          </div>
          <div className="daily-goal-controls">
            <button
              onClick={() => handleDailyGoalChange(profile.dailyGoal - 1)}
              className="goal-btn"
              disabled={profile.dailyGoal <= 1}
            >
              −
            </button>
            <span className="goal-value">{profile.dailyGoal}</span>
            <button
              onClick={() => handleDailyGoalChange(profile.dailyGoal + 1)}
              className="goal-btn"
              disabled={profile.dailyGoal >= 50}
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="profile-stats">
        <h3 className="profile-section-title">
          <Trophy size={20} />
          Estadísticas
        </h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Completadas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.activeDays}</div>
            <div className="stat-label">Días Activos</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">Racha Actual</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{completionRate}%</div>
            <div className="stat-label">Tasa de Éxito</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.scheduledTasks}</div>
            <div className="stat-label">Programadas</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Total Tareas</div>
          </div>
        </div>
      </div>

      {/* Meta Personal */}
      <div className="profile-goal-section">
        <h3 className="profile-section-title">
          <Target size={20} />
          Meta Personal
        </h3>
        {isEditingGoal ? (
          <div className="goal-edit-group">
            <textarea
              value={editGoal}
              onChange={(e) => setEditGoal(e.target.value)}
              className="goal-edit-textarea"
              placeholder="Escribe tu meta personal..."
              rows={3}
            />
            <div className="goal-edit-buttons">
              <button onClick={handleSaveGoal} className="goal-save-btn">
                <Save size={16} />
                Guardar
              </button>
              <button onClick={handleCancelGoal} className="goal-cancel-btn">
                <X size={16} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="goal-display">
            {profile.goal ? (
              <p className="goal-text">{profile.goal}</p>
            ) : (
              <p className="goal-placeholder">No has establecido una meta aún</p>
            )}
            <button onClick={handleEditGoal} className="goal-edit-btn">
              <Edit2 size={16} />
              {profile.goal ? 'Editar' : 'Agregar Meta'}
            </button>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="profile-actions">
        <h3 className="profile-section-title">
          <Settings size={20} />
          Acciones
        </h3>
        <div className="actions-list">
          <button onClick={exportData} className="action-btn export">
            <Download size={18} />
            <span>Exportar Datos</span>
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            className="action-btn reset"
          >
            <Trash2 size={18} />
            <span>Resetear Todo</span>
          </button>
        </div>
      </div>

      {/* Confirmación de Reset */}
      {showResetConfirm && (
        <div className="reset-modal-overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Resetear todos los datos?</h3>
            <p>Esta acción eliminará todas tus tareas, eventos y estadísticas. Esta acción no se puede deshacer.</p>
            <div className="reset-modal-buttons">
              <button onClick={resetData} className="reset-confirm-btn">
                Sí, Resetear
              </button>
              <button onClick={() => setShowResetConfirm(false)} className="reset-cancel-btn">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

