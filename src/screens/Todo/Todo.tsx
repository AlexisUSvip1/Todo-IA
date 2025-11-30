import { useEffect, useState } from 'react';
import './Todo.css';
import { CheckCircle, Circle, Trash2, Inbox, Trophy } from 'lucide-react';

interface Task {
  id: number;
  text: string;
  type: string;
  completed: boolean;
  completedAt?: string; // Fecha cuando se completó (formato YYYY-MM-DD)
  scheduled?: boolean; // Si está programada en el calendario
}

export default function Todos() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  // Cargar tareas desde localStorage v2
  useEffect(() => {
    const saved = localStorage.getItem('tasks_v2');
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  // Guardar tareas cuando cambien
  useEffect(() => {
    localStorage.setItem('tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  // Crear tarea (guarda al instante, no se pierde al cambiar de tab)
  const addTask = () => {
    if (!input.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      text: input.trim(),
      type: 'General',
      completed: false,
    };

    // Guardar inmediatamente en localStorage
    const saved = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
    const updated = [...saved, newTask];
    localStorage.setItem('tasks_v2', JSON.stringify(updated));

    setTasks(updated);
    setInput('');
  };

  // Alternar estado
  const toggleTask = (taskId: number) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        const newCompleted = !t.completed;
        return {
          ...t,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });
    setTasks(updated);
  };

  // Eliminar
  const deleteTask = (taskId: number) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
  };

  // Drag handlers (desktop)
  const onDragStart = (e: any, id: number) => {
    e.dataTransfer.setData('taskId', id.toString());
  };

  const onDrop = (completed: boolean, e: any) => {
    const taskId = e.dataTransfer ? Number(e.dataTransfer.getData('taskId')) : draggedTaskId;
    if (!taskId) return;

    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          completed,
          completedAt: completed ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return t;
    });
    setTasks(updated);
    setDraggedTaskId(null);
  };

  // Touch handlers (mobile)
  const onTouchStart = (e: React.TouchEvent, id: number) => {
    setDraggedTaskId(id);
    e.currentTarget.classList.add('dragging');
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    e.currentTarget.classList.remove('dragging');
    // Si hay una tarea arrastrada, buscar el elemento bajo el toque
    if (draggedTaskId) {
      const touch = e.changedTouches[0];
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      
      // Buscar la columna padre
      const column = elementBelow?.closest('.task-column');
      if (column) {
        const isCompleted = column.classList.contains('completed') || 
                           column.querySelector('.column-title.left') !== null;
        handleTouchDrop(isCompleted);
      }
      setDraggedTaskId(null);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchDrop = (completed: boolean) => {
    if (draggedTaskId) {
      const updated = tasks.map((t) => {
        if (t.id === draggedTaskId) {
          return {
            ...t,
            completed,
            completedAt: completed ? new Date().toISOString().split('T')[0] : undefined,
          };
        }
        return t;
      });
      setTasks(updated);
    }
  };

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  return (
    <div className="todos-container">
      <h2 className="title">Mis Tareas</h2>

      {/* Input */}
      <div className="add-task-box">
        <input
          value={input}
          placeholder="Escribe una tarea..."
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={addTask}>Crear</button>
      </div>

      {/* GRID DOS COLUMNAS */}
      <div className="tasks-grid">
        {/* COMPLETADAS */}
        <div
          className="task-column completed-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(true, e)}
        >
          <h3 className="column-title left">Completadas</h3>

          {done.length === 0 ? (
            <div className="empty-box">
              <Trophy size={32} />
              <p>Aún no haz terminado ninguna tarea</p>
            </div>
          ) : (
            done.map((task) => (
              <div
                key={task.id}
                className="task-card completed"
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                onTouchStart={(e) => onTouchStart(e, task.id)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <button className="check-btn" onClick={() => toggleTask(task.id)}>
                  <CheckCircle size={22} />
                </button>

                <p className="task-text">{task.text}</p>

                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* PENDIENTES */}
        <div
          className="task-column pending-column"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => onDrop(false, e)}
        >
          <h3 className="column-title right">Pendientes</h3>

          {pending.length === 0 ? (
            <div className="empty-box">
              <Inbox size={32} />
              <p>Aún no haz creado ninguna tarea</p>
            </div>
          ) : (
            pending.map((task) => (
              <div
                key={task.id}
                className="task-card"
                draggable
                onDragStart={(e) => onDragStart(e, task.id)}
                onTouchStart={(e) => onTouchStart(e, task.id)}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <button className="check-btn" onClick={() => toggleTask(task.id)}>
                  <Circle size={22} />
                </button>

                <p className="task-text">{task.text}</p>

                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
