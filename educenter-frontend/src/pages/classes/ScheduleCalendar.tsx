import React from 'react';
import { Clock, Calendar as CalendarIcon } from 'lucide-react';

interface ClasseEvent {
  id: number;
  name: string;
  subject: string;
  teacher: string;
  day: number; // 0-6 (Mon-Sun)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  color?: string;
}

interface ScheduleCalendarProps {
  events: ClasseEvent[];
}

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8:00 to 21:00

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ events }) => {
  const getEventStyle = (event: ClasseEvent) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const startMin = parseInt(event.startTime.split(':')[1]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMin = parseInt(event.endTime.split(':')[1]);

    const startOffset = (startHour - 8) * 60 + startMin;
    const duration = (endHour * 60 + endMin) - (startHour * 60 + startMin);

    return {
      top: `${(startOffset / 60) * 60}px`,
      height: `${(duration / 60) * 60}px`,
      backgroundColor: event.color || 'var(--color-primary-light)',
      borderLeft: `4px solid ${event.color ? 'rgba(0,0,0,0.2)' : 'var(--color-primary)'}`,
    };
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
      }}>
        <div style={{ 
          flex: 1, 
          position: 'relative', 
          display: 'flex',
          backgroundColor: 'var(--color-border)'
        }}>
          {/* Time column */}
          <div style={{ width: '60px', borderRight: '1px solid var(--color-border)', backgroundColor: '#f9fafb', zIndex: 10 }}>
              <div style={{ height: '40px', borderBottom: '1px solid var(--color-border)', backgroundColor: '#f9fafb' }}></div> {/* Spacer for header row */}
              {HOURS.map((hour, hourIdx) => (
                  <div key={hour} style={{ 
                      height: '60px', 
                      fontSize: '11px', 
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      justifyContent: 'center',
                      paddingTop: '4px',
                      borderBottom: '1px solid var(--color-border)',
                      backgroundColor: 'white', // Unified background
                      boxSizing: 'border-box'
                  }}>
                      {hour}:00
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
                      flex: 1, 
                      minWidth: '120px', 
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
                      <div style={{ position: 'relative', height: `${HOURS.length * 60}px` }}>
                          {HOURS.map((hour, hourIdx) => (
                              <div key={hour} style={{ 
                                  height: '60px', 
                                  borderBottom: '1px solid var(--color-border)',
                                  backgroundColor: 'white', // Unified background
                                  pointerEvents: 'none',
                                  boxSizing: 'border-box'
                              }}></div>
                          ))}

                          {/* Events Overlay */}
                          {events.filter(e => e.day === dayIdx).map(event => (
                              <div 
                                  key={event.id}
                                  style={{
                                      position: 'absolute',
                                      left: '4px',
                                      right: '4px',
                                      padding: '6px',
                                      borderRadius: '6px',
                                      fontSize: '11px',
                                      overflow: 'hidden',
                                      zIndex: 2,
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '2px',
                                      ...getEventStyle(event)
                                  }}
                              >
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
                          ))}
                      </div>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendar;