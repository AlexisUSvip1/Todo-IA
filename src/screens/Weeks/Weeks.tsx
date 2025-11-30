import { useEffect, useState } from 'react';
import './Weeks.css';

import { format, parse, startOfWeek, getDay, startOfDay, addHours } from 'date-fns';
import { es } from 'date-fns/locale';
import { DndContext } from '@dnd-kit/core';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { dateFnsLocalizer, type EventProps } from 'react-big-calendar';
import { DndCalendar } from '../../rbc-dnd-kit/DndCalendar';

interface Task {
  id: number;
  text: string;
  type: string;
  completed?: boolean;
  scheduled?: boolean;
}

interface EventData {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: string;
}

const locales = { es };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ===============================
// CUSTOM EVENT VIEW
// ===============================
const EventComponent = (props: EventProps<EventData>) => {
  const event = props.event as EventData;
  const start = event.start.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="event-custom">
      <div className="event-hour">{start}</div>
      <div className="event-title">{event.title}</div>
    </div>
  );
};

export default function Week({ reload }: { reload: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const today = new Date();
  const todayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;

  const onSelectEvent = (event: EventData) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const generateWeekDays = () => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        name: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
        date: d.getDate(),
        full: d,
      };
    });
  };

  const weekDays = generateWeekDays();

  // ======================
  // Cargar tareas
  // ======================
  useEffect(() => {
    const saved = localStorage.getItem('tasks_v2');
    if (saved) setTasks(JSON.parse(saved));
  }, [reload]);

  useEffect(() => {
    const sync = () => {
      const saved = localStorage.getItem('tasks_v2');
      if (saved) setTasks(JSON.parse(saved));
    };

    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // ======================
  // Cargar eventos
  // ======================
  useEffect(() => {
    const saved = localStorage.getItem('calendarEvents');
    if (saved) {
      const parsed: EventData[] = JSON.parse(saved);
      parsed.forEach((ev) => {
        ev.start = new Date(ev.start);
        ev.end = new Date(ev.end);
      });
      setEvents(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // ======================
  // CREAR evento al soltar una tarea
  // ======================
  const handleDropTask = (task: Task, day: Date, hour: number) => {
    const start = new Date(day);
    start.setHours(hour);

    const end = new Date(day);
    end.setHours(hour + 1);

    const event: EventData = {
      id: Date.now(),
      title: task.text,
      start,
      end,
      type: task.type,
    };

    setEvents((prev) => [...prev, event]);

    // Marcar la tarea como programada para que no aparezca en la lista
    const updatedTasks = tasks.map((t) =>
      t.id === task.id ? { ...t, scheduled: true } : t
    );
    setTasks(updatedTasks);
    
    // Actualizar en localStorage
    const saved = JSON.parse(localStorage.getItem('tasks_v2') || '[]');
    const updatedSaved = saved.map((t: Task) =>
      t.id === task.id ? { ...t, scheduled: true } : t
    );
    localStorage.setItem('tasks_v2', JSON.stringify(updatedSaved));
  };

  // ======================
  // MOVER evento dentro del calendario
  // ======================
  const moveEvent = ({ event, start, end }: { event: EventData; start: Date; end: Date }) => {
    const updated = events.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev));
    setEvents(updated);
  };

  const resizeEvent = ({ event, start, end }: { event: EventData; start: Date; end: Date }) => {
    const updated = events.map((ev) => (ev.id === event.id ? { ...ev, start, end } : ev));
    setEvents(updated);
  };

  // ======================
  // RENDER
  // ======================
  return (
    <div className="week-layout">
      {/* 🟦 SIDEBAR IZQUIERDO */}
      <aside className="sidebar">
        {/* DÍAS */}
        <div className="week-days">
          {weekDays.map((d, i) => (
            <div key={i} className={`day-block ${i === todayIndex ? 'active-day' : ''}`}>
              <span className="day-name">{d.name}</span>
              <span className="day-number">{d.date}</span>
            </div>
          ))}
        </div>

        {/* LISTA DE TAREAS */}
        <h2 className="week-title">Tareas pendientes</h2>

        <div className="draggable-tasks">
          {tasks.filter((t) => !t.completed && !t.scheduled).length === 0 && (
            <p className="no-tasks">No hay tareas pendientes.</p>
          )}

          {tasks
            .filter((t) => !t.completed && !t.scheduled)
            .map((task) => (
              <div
                key={task.id}
                className="task-card-week"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('task', JSON.stringify(task));
                  e.currentTarget.classList.add('dragging');
                }}
                onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
                onTouchStart={(e) => {
                  setDraggedTask(task);
                  e.currentTarget.classList.add('dragging');
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.classList.remove('dragging');
                }}
              >
                <p className="task-text">{task.text}</p>
                <span className="task-type">{task.type}</span>
              </div>
            ))}
        </div>
      </aside>

      {/* 🟩 CALENDARIO */}
      <div
        className="calendar-area"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          const data = e.dataTransfer.getData('task');
          if (!data) return;

          const task: Task = JSON.parse(data);
          const rect = e.currentTarget.getBoundingClientRect();

          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const columnWidth = rect.width / 7;
          const dayIndex = Math.floor(x / columnWidth);
          const day = weekDays[dayIndex].full;

          const hour = Math.floor(y / 50) + 6;

          handleDropTask(task, day, hour);
        }}
        onTouchEnd={(e) => {
          if (!draggedTask) return;

          const touch = e.changedTouches[0];
          const rect = e.currentTarget.getBoundingClientRect();

          const x = touch.clientX - rect.left;
          const y = touch.clientY - rect.top;

          const columnWidth = rect.width / 7;
          const dayIndex = Math.floor(x / columnWidth);
          
          if (dayIndex >= 0 && dayIndex < weekDays.length) {
            const day = weekDays[dayIndex].full;
            const hour = Math.floor(y / 50) + 6;
            handleDropTask(draggedTask, day, hour);
            setDraggedTask(null);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
        }}
      >
        <DndContext>
          <DndCalendar
            localizer={localizer}
            events={events as any}
            onEventDrop={moveEvent as any}
            onEventResize={resizeEvent as any}
            onSelectEvent={onSelectEvent as any}
            components={{ event: EventComponent as any }}
            defaultView="week"
            views={['week']}
            step={60}
            toolbar={false}
            min={addHours(startOfDay(new Date()), 6)}
            max={addHours(startOfDay(new Date()), 22)}
            style={{ height: 700 }}
          />
        </DndContext>
      </div>
      {isModalOpen && selectedEvent && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{selectedEvent.title}</h2>

            <div className="modal-section">
              <p>
                <strong>Inicio:</strong>{' '}
                {selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>
                <strong>Fin:</strong>{' '}
                {selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
              <p>
                <strong>Tipo:</strong> {selectedEvent.type}
              </p>
            </div>

            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
