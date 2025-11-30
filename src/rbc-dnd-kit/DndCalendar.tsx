import { Calendar } from 'react-big-calendar';
import { useDndContext } from '@dnd-kit/core';

export function DndCalendar(props) {
  const dnd = useDndContext();

  return (
    <>
      <Calendar {...props} draggableAccessor={() => true} resizable />

      {dnd.active && (
        <div
          className="drag-preview"
          style={{
            position: 'fixed',
            top: dnd.active.rect.current.translated?.top || 0,
            left: dnd.active.rect.current.translated?.left || 0,
            padding: '6px 12px',
            background: '#222',
            borderRadius: '8px',
            color: 'white',
            pointerEvents: 'none',
            zIndex: 9999,
            boxShadow: '0 0 10px rgba(0,0,0,0.4)',
          }}
        >
          {dnd.active.data?.current?.event?.title}
        </div>
      )}
    </>
  );
}
