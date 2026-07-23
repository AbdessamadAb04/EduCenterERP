import React from 'react';
import { Clock, Calendar as CalendarIcon, Plus, Archive, Edit2, RotateCcw, Trash2 } from 'lucide-react';
import ArchiveInfoTooltip from '../../components/common/ArchiveInfoTooltip';

interface ClasseEvent {
  id: number;
  name: string;
  subject: string;
  teacher: string;
  day: number; // 0-6 (Mon-Sun)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  color?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
}

interface ScheduleCalendarProps {
  events: ClasseEvent[];
  onCreateSession: (slot: { day: number; startTime: string; endTime: string }) => void;
  onEditSession: (event: ClasseEvent) => void;
  onArchiveSession: (id: number) => void;
  onDeleteArchivedEvent?: (id: number) => void;
  onDeleteAllArchived?: () => void;
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 8:00 to 23:00
const ROW_HEIGHT = 64;

const formatHourLabel = (hour: number) => `${String(hour % 24).padStart(2, '0')}:00`;
const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const resolveEndMinutes = (startTime: string, endTime: string) => {
  const startMinutes = toMinutes(startTime);
  const endMinutes = toMinutes(endTime);

  if (endMinutes === 0 && startMinutes < 24 * 60) {
    return 24 * 60;
  }

  if (endMinutes < startMinutes) {
    return endMinutes + (24 * 60);
  }

  return endMinutes;
};

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  events,
  onCreateSession,
  onEditSession,
  onArchiveSession,
  onDeleteArchivedEvent,
  onDeleteAllArchived,
}) => {
  const [hoveredCell, setHoveredCell] = React.useState<{ day: number; hour: number } | null>(null);
  const [hoveredEventId, setHoveredEventId] = React.useState<number | null>(null);
  const visibleEvents = React.useMemo(() => events.filter((event) => event.status !== 'ARCHIVED'), [events]);
  const archivedEvents = React.useMemo(() => events.filter((event) => event.status === 'ARCHIVED'), [events]);

  // Compute positions for overlapping events and the width needed by each day column.
  const { eventPositions, dayColumnWidths } = React.useMemo(() => {
    const map = new Map<number, { leftPercent: number; widthPercent: number; zIndex: number }>();
    const widths = new Map<number, number>();

    const eventsByDay: Record<number, ClasseEvent[]> = {};
    visibleEvents.forEach((ev) => {
      (eventsByDay[ev.day] = eventsByDay[ev.day] || []).push(ev);
    });

    Object.keys(eventsByDay).forEach((dayKey) => {
      const day = Number(dayKey);
      const dayEvents = eventsByDay[day].map((ev) => {
        const start = toMinutes(ev.startTime);
        const end = resolveEndMinutes(ev.startTime, ev.endTime);
        return {
          ev,
          start,
          end,
        };
      }).sort((a, b) => a.start - b.start || a.end - b.end);

      // interval partitioning: assign to first available column
      const columnsEnd: number[] = [];
      const assignments: Map<number, number> = new Map(); // event id -> slot index

      dayEvents.forEach(({ ev, start, end }) => {
        let placed = false;
        for (let i = 0; i < columnsEnd.length; i++) {
          if (start >= columnsEnd[i]) {
            columnsEnd[i] = end;
            assignments.set(ev.id, i);
            placed = true;
            break;
          }
        }
        if (!placed) {
          assignments.set(ev.id, columnsEnd.length);
          columnsEnd.push(end);
        }
      });

      const totalCols = Math.max(1, columnsEnd.length);
      widths.set(day, Math.max(160, totalCols * 150));

      const baseLeft = 4; // percent
      const avail = 88; // percent available for events
      const slotWidth = avail / totalCols;

      dayEvents.forEach(({ ev }) => {
        const idx = assignments.get(ev.id) ?? 0;
        const gap = 2; // percent gap between columns
        const leftPercent = baseLeft + idx * slotWidth;
        const widthPercent = Math.max(slotWidth - gap, 6);
        map.set(ev.id, { leftPercent, widthPercent, zIndex: 2 + idx });
      });
    });

    return { eventPositions: map, dayColumnWidths: widths };
  }, [visibleEvents]);

  const getEventStyle = (event: ClasseEvent) => {
    const startMinutes = toMinutes(event.startTime);
    const endMinutes = resolveEndMinutes(event.startTime, event.endTime);

    const startOffset = startMinutes - (8 * 60);
    const duration = endMinutes - startMinutes;

    const eventTop = (startOffset / 60) * ROW_HEIGHT;
    const eventHeight = (duration / 60) * ROW_HEIGHT;
    const verticalInset = 2;

    return {
      top: `${eventTop + verticalInset}px`,
      height: `${Math.max(eventHeight - verticalInset * 2, 8)}px`,
      backgroundColor: event.color || 'var(--color-primary-light)',
      borderLeft: `4px solid ${event.color ? 'rgba(0,0,0,0.2)' : 'var(--color-primary)'}`,
    };
  };

  const toCellTime = (hour: number) => `${String((hour + 24) % 24).padStart(2, '0')}:00`;

  const handleCreateFromCell = (day: number, hour: number) => {
    onCreateSession({
      day,
      startTime: toCellTime(hour),
      endTime: toCellTime(hour + 1),
    });
  };

  return (
    <div>
      {/* Calendar Header */}
      <div style={{ 
        padding: '16px 24px', 
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        backgroundColor: '#f9fafb',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            padding: '8px', 
            borderRadius: '8px', 
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)'
          }}>
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>Emploi du temps hebdomadaire</h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>Vue d'ensemble de toutes les classes planifiées</p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        border: '1px solid var(--color-border)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
      }}>
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          display: 'flex',
          width: '100%',
          backgroundColor: 'var(--color-border)'
        }}>
          {/* Time column */}
          <div style={{ width: '60px', borderRight: '1px solid var(--color-border)', backgroundColor: '#f9fafb', zIndex: 10 }}>
              <div style={{ height: '40px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f9fafb' }}></div> {/* Spacer for header row */}
                {HOURS.map((hour) => (
                  <div key={hour} style={{ 
                    height: `${ROW_HEIGHT}px`, 
                      fontSize: '11px', 
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      justifyContent: 'center',
                      paddingTop: '4px',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: 'white', // Unified background
                      boxSizing: 'border-box'
                  }}>
                        {formatHourLabel(hour)}
                  </div>
              ))}
          </div>

          {/* Days columns */}
          <div style={{ 
            flex: 1,
            display: 'flex', 
            backgroundColor: 'white' // Unified background
          }}>
              {DAYS.map((day, dayIdx) => (
                  <div key={day} style={{ 
                      flex: '1 1 0', 
                      minWidth: `${dayColumnWidths.get(dayIdx) ?? 160}px`, 
                      borderRight: '1px solid var(--color-border)',
                      position: 'relative',
                      backgroundColor: 'white'
                  }}>
                      {/* Day Header */}
                      <div style={{ 
                          height: '40px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontSize: 'var(--text-sm)', 
                          fontWeight: 600,
                          borderBottom: '1px solid var(--color-border)',
                          backgroundColor: '#f9fafb',
                          position: 'sticky',
                          top: 0,
                          zIndex: 5
                      }}>
                          {day}
                      </div>

                      {/* Hour Slots Background */}
                      <div style={{ position: 'relative', height: `${HOURS.length * ROW_HEIGHT}px` }}>
                          {HOURS.map((hour) => {
                              return (
                              <div
                                key={hour}
                                style={{
                                  height: `${ROW_HEIGHT}px`,
                                  borderBottom: '1px solid var(--color-border)',
                                  backgroundColor: hoveredCell?.day === dayIdx && hoveredCell?.hour === hour ? 'rgba(15, 23, 42, 0.04)' : 'white',
                                  boxSizing: 'border-box',
                                  position: 'relative',
                                  cursor: 'pointer',
                                  transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
                                }}
                                onMouseEnter={() => setHoveredCell({ day: dayIdx, hour })}
                                onMouseLeave={() => setHoveredCell((current) => (current?.day === dayIdx && current?.hour === hour ? null : current))}
                                onClick={() => handleCreateFromCell(dayIdx, hour)}
                                role='button'
                                tabIndex={0}
                              >
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: hoveredCell?.day === dayIdx && hoveredCell?.hour === hour ? 1 : 0,
                                    transition: 'opacity 0.15s ease',
                                    pointerEvents: 'none',
                                  }}
                                >
                                  <div
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 10px',
                                      borderRadius: '999px',
                                          backgroundColor: 'var(--color-primary)',
                                          color: 'white',
                                      fontSize: '10px',
                                      fontWeight: 700,
                                      letterSpacing: '0.04em',
                                          boxShadow: '0 4px 10px rgba(5, 150, 105, 0.18)',
                                    }}
                                  >
                                    <Plus size={12} /> ajouter
                                  </div>
                                </div>
                              </div>
                              );
                          })}

                          {/* Events Overlay */}
                              {visibleEvents.filter(e => e.day === dayIdx).map(event => (
                              <div 
                                  key={event.id}
                                  onMouseEnter={() => setHoveredEventId(event.id)}
                                  onMouseLeave={() => setHoveredEventId((current) => (current === event.id ? null : current))}
                                style={{
                                  position: 'absolute',
                                  padding: '6px',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  overflow: 'hidden',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '2px',
                                  cursor: 'default',
                                  opacity: event.status === 'ARCHIVED' ? 0.55 : 1,
                                  transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                                  ...getEventStyle(event),
                                  ...(eventPositions.get(event.id)
                                  ? {
                                    left: `${eventPositions.get(event.id)!.leftPercent}%`,
                                    width: `${eventPositions.get(event.id)!.widthPercent}%`,
                                    zIndex: eventPositions.get(event.id)!.zIndex,
                                    }
                                  : { left: '4px', width: '88%', zIndex: 2 }),
                                }}
                              >
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                                    <span style={{ fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                                      {event.name}
                                    </span>
                                    <span style={{ opacity: 0.8, fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                      <Clock size={10} /> {event.startTime} - {event.endTime}
                                    </span>
                                    <span style={{ opacity: 0.8, fontSize: '10px', marginTop: '2px' }}>
                                      {event.teacher}
                                    </span>
                                  </div>
                                  <div style={{ position: 'absolute', right: '6px', bottom: '6px', display: 'flex', gap: '6px', opacity: hoveredEventId === event.id ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                                    <button
                                      title="Modifier"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditSession(event);
                                      }}
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: 'var(--color-primary)',
                                        borderRadius: '999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background-color 0.2s',
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
                                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <Edit2 size={16} />
                                    </button>
                                    <button
                                      title={event.status === 'ARCHIVED' ? 'Désarchiver' : 'Archiver'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onArchiveSession(event.id);
                                      }}
                                      style={{
                                        width: '22px',
                                        height: '22px',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        color: 'var(--color-gray)',
                                        borderRadius: '999px',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'background-color 0.2s',
                                      }}
                                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                      <Archive size={16} />
                                    </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>

      {archivedEvents.length > 0 && (
        <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: '16px',
            border: '1px solid var(--color-border)', width: '100%'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                backgroundColor: 'white', border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-text-secondary)'
              }}>
                <Archive size={18} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>
                Séances archivées
              </h3>
              <span style={{
                fontSize: '12px', backgroundColor: 'white',
                border: '1px solid var(--color-border)', padding: '2px 10px',
                borderRadius: '20px', color: 'var(--color-text-secondary)', fontWeight: 600
              }}>
                {archivedEvents.length}
              </span>
              <ArchiveInfoTooltip />
            </div>
            {onDeleteAllArchived && (
              <button
                onClick={onDeleteAllArchived}
                style={{
                  padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-gray)',
                  backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', color: 'var(--color-gray)', display: 'flex',
                  alignItems: 'center', gap: '6px', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--color-danger)'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-gray)'; e.currentTarget.style.borderColor = 'var(--color-gray)'; }}
              >
                <Trash2 size={14} />
                Supprimer tout
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {archivedEvents.map((event) => {
              const dayLabel = DAYS[event.day];
              return (
                <div
                  key={event.id}
                  style={{
                    backgroundColor: 'white', borderRadius: '16px',
                    border: '1px solid var(--color-border)', padding: '16px 20px',
                    display: 'flex', flexDirection: 'column', gap: '10px',
                    opacity: 0.85, boxShadow: 'var(--shadow-sm)',
                    minWidth: '240px', flex: '1 0 auto', maxWidth: '340px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '4px', height: '34px', borderRadius: '2px', backgroundColor: event.color || 'var(--color-gray)', opacity: 0.5, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          {event.name}
                        </h4>
                        <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--color-gray)' }}>
                          {dayLabel} • {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {onDeleteArchivedEvent && (
                        <button
                          title="Supprimer définitivement"
                          onClick={() => onDeleteArchivedEvent(event.id)}
                          style={{
                            padding: '4px 6px', borderRadius: '6px',
                            border: '1px solid var(--color-danger)',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            color: 'var(--color-danger)', display: 'flex',
                            alignItems: 'center', transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger)'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-danger)'; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--color-gray)' }}>
                      {event.teacher}
                    </span>
                    <button
                      title="Restaurer"
                      onClick={() => onArchiveSession(event.id)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px',
                        border: '1px solid var(--color-primary)',
                        backgroundColor: 'transparent', fontSize: '11px',
                        fontWeight: 600, cursor: 'pointer',
                        color: 'var(--color-primary)', transition: 'all 0.2s',
                        display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = 'white'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                    >
                      <RotateCcw size={12} />
                      Restaurer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCalendar;