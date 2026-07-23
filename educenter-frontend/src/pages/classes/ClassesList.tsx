import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Plus, Edit2, Archive, Users, LayoutGrid, Calendar as CalendarIcon, Printer, Download, Clock, GraduationCap, Eye, EyeOff, Trash2, DollarSign, Palette } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import PrimaryButton from '../../components/common/PrimaryButton';
import SearchInput from '../../components/common/SearchInput';
import FilterChip from '../../components/common/FilterChip';
import Modal from '../../components/common/Modal';
import ArchiveInfoTooltip from '../../components/common/ArchiveInfoTooltip';
import FormInput from '../../components/common/FormInput';
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal';
import ScheduleCalendar from './ScheduleCalendar';
import { useClassSelection } from '../../context/ClassSelectionContext';
import { ClassExportPDF } from '../../components/finance/ClassExportPDF';
import { ScheduleExportPDF } from '../../components/finance/ScheduleExportPDF';
import { downloadPDF } from '../../utils/exporterUtils';
import { generateId } from '../../utils/id';
import { useCenter } from '../../context/CenterContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import EmptyDataOverlay from '../../components/common/EmptyDataOverlay';

type ScheduleEvent = {
  id: number;
  classId?: number;
  name: string;
  subject: string;
  teacher: string;
  day: number;
  startTime: string;
  endTime: string;
  color?: string;
  status?: 'ACTIVE' | 'ARCHIVED';
};

type DayConfig = {
  startTime: string;
  endTime: string;
  durationMinutes: string;
};

const DEFAULT_DAY_CONFIG: DayConfig = {
  startTime: '08:00',
  endTime: '10:00',
  durationMinutes: '120',
};

const SCHEDULE_END_MINUTES = 24 * 60;
const MIN_SESSION_DURATION = 15;
const SCHEDULE_START_MINUTES = 8 * 60;
const DAY_OPTIONS = [
  { label: 'Lundi', value: '0' },
  { label: 'Mardi', value: '1' },
  { label: 'Mercredi', value: '2' },
  { label: 'Jeudi', value: '3' },
  { label: 'Vendredi', value: '4' },
  { label: 'Samedi', value: '5' },
  { label: 'Dimanche', value: '6' },
];

const SESSION_COLOR_OPTIONS = [
  { label: 'Bleu clair', value: '#e0f2fe' },
  { label: 'Ambre clair', value: '#fef3c7' },
  { label: 'Vert clair', value: '#dcfce7' },
  { label: 'Gris clair', value: '#f1f5f9' },
  { label: 'Violet clair', value: '#ede9fe' },
  { label: 'Rose clair', value: '#fce7f3' },
];

const STATUS_OPTIONS = [
  { label: 'Actif', value: 'ACTIVE' },
  { label: 'En pause', value: 'PAUSED' },
];

const TARIF_PERIOD_OPTIONS = [
  { label: 'Mensuel', value: 'mensuel' },
  { label: 'Trimestriel', value: 'trimestrial' },
  { label: 'Annuel', value: 'annuelle' },
];

const initialClassFormData = {
  name: '',
  subject: '',
  level: '',
  schedule: 'Matin',
  teacher: '',
  maxCapacity: 15,
  tarifAmount: 0,
  tarifPeriod: 'mensuel',
  tarifCustomLabel: '',
  status: 'ACTIVE',
  day: '',
  color: '#e0f2fe',
};

const ClassesList: React.FC = () => {
  const { centerName } = useCenter();
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const base = `/mes-etablissements/etablissement/${etablissementId}`;
  const [classes, setClasses] = useLocalStorage<any[]>('classes', []);
  const [scheduleEvents, setScheduleEvents] = useLocalStorage<ScheduleEvent[]>('scheduleEvents', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [scheduleContext, setScheduleContext] = useState<'grid' | 'cell' | 'event' | null>(null);
  const [editingScheduleEventId, setEditingScheduleEventId] = useState<number | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<number | 'batch' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | 'all' | null>(null);
  const [isDeleteArchivedEventModalOpen, setIsDeleteArchivedEventModalOpen] = useState(false);
  const [deleteArchivedEventId, setDeleteArchivedEventId] = useState<number | 'all' | null>(null);
  const [pendingScheduleArchiveId, setPendingScheduleArchiveId] = useState<number | null>(null);
  const [hoveredPrintableEventId, setHoveredPrintableEventId] = useState<number | null>(null);
  const [isExistingClassMode, setIsExistingClassMode] = useState(false);
  const [selectedExistingClassId, setSelectedExistingClassId] = useState<number | null>(null);
  const [scheduleExportSelectedEventIds, setScheduleExportSelectedEventIds] = useState<number[]>([]);
  const { selectedIds, showExportModal, setShowExportModal, clearSelection } = useClassSelection();

  const [formData, setFormData] = useState(initialClassFormData);
  const [dayConfigs, setDayConfigs] = useState<Record<string, DayConfig>>({});
  const [formSnapshot, setFormSnapshot] = useState(initialClassFormData);

  const [searchParams] = useSearchParams();
  const colorInputRef = useRef<HTMLInputElement>(null);

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(formSnapshot);

  const closeClassModal = () => {
    setIsModalOpen(false);
    setIsDiscardChangesModalOpen(false);
    setEditingClasse(null);
    setEditingScheduleEventId(null);
    setScheduleContext(null);
    setDayConfigs({});
    setIsExistingClassMode(false);
    setSelectedExistingClassId(null);
  };

  const requestCloseClassModal = () => {
    if (isFormDirty) {
      setIsDiscardChangesModalOpen(true);
      return;
    }

    closeClassModal();
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number) => {
    const safeMinutes = ((minutes % (24 * 60)) + (24 * 60)) % (24 * 60);
    const hours = Math.floor(safeMinutes / 60);
    const mins = safeMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const addMinutesToTime = (time: string, minutes: number) => minutesToTime(timeToMinutes(time) + minutes);

  const resolveEndMinutes = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (endMinutes === 0 && startMinutes < SCHEDULE_END_MINUTES) {
      return SCHEDULE_END_MINUTES;
    }

    if (endMinutes < startMinutes) {
      return endMinutes + (24 * 60);
    }

    return endMinutes;
  };

  const getDurationBetweenTimes = (startTime: string, endTime: string) => {
    const startMinutes = timeToMinutes(startTime);
    return resolveEndMinutes(startTime, endTime) - startMinutes;
  };

  const getAvailableMinutes = (startTime: string) => {
    const clampedStartMinutes = Math.max(timeToMinutes(startTime), SCHEDULE_START_MINUTES);
    return Math.max(SCHEDULE_END_MINUTES - clampedStartMinutes, 0);
  };

  const clampDuration = (startTime: string, duration: number) => {
    const availableMinutes = getAvailableMinutes(startTime);

    if (availableMinutes < MIN_SESSION_DURATION) {
      return availableMinutes;
    }

    return Math.min(Math.max(duration, MIN_SESSION_DURATION), availableMinutes);
  };

  const getClassScheduleEvent = (id: number, classId: number, data: typeof formData, dayValue: string, config: DayConfig) => ({
    id,
    classId,
    name: data.name,
    subject: data.subject,
    teacher: data.teacher,
    day: Number(dayValue),
    startTime: config.startTime,
    endTime: config.endTime,
    color: data.color,
    status: 'ACTIVE' as const,
  });

  const handleClassFieldChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateDayConfig = (dayValue: string, field: keyof DayConfig, value: string) => {
    setDayConfigs((prev) => {
      const config = prev[dayValue] || { ...DEFAULT_DAY_CONFIG };
      if (field === 'startTime') {
        const nextDuration = clampDuration(value, Number(config.durationMinutes || MIN_SESSION_DURATION));
        return {
          ...prev,
          [dayValue]: {
            startTime: value,
            durationMinutes: String(nextDuration),
            endTime: addMinutesToTime(value, nextDuration),
          },
        };
      }
      if (field === 'durationMinutes') {
        const duration = clampDuration(config.startTime, Number(value) || 0);
        return {
          ...prev,
          [dayValue]: {
            ...config,
            durationMinutes: String(duration),
            endTime: addMinutesToTime(config.startTime, duration),
          },
        };
      }
      if (field === 'endTime') {
        const duration = clampDuration(config.startTime, getDurationBetweenTimes(config.startTime, value));
        return {
          ...prev,
          [dayValue]: {
            ...config,
            endTime: addMinutesToTime(config.startTime, duration),
            durationMinutes: String(duration),
          },
        };
      }
      return {
        ...prev,
        [dayValue]: { ...config, [field]: value },
      };
    });
  };

  const toggleDay = (dayValue: string) => {
    const selected = formData.day ? formData.day.split(',') : [];
    const isAdding = !selected.includes(dayValue);
    const updated = isAdding
      ? [...selected, dayValue]
      : selected.filter(d => d !== dayValue);
    setFormData({ ...formData, day: updated.join(',') });
    if (isAdding) {
      setDayConfigs((prev) => ({
        ...prev,
        [dayValue]: { ...DEFAULT_DAY_CONFIG },
      }));
    } else {
      setDayConfigs((prev) => {
        const next = { ...prev };
        delete next[dayValue];
        return next;
      });
    }
  };

  const handleSave = () => {
    const nextClassId = editingClasse ? editingClasse.id : generateId();
    const eventClassId = selectedExistingClassId || nextClassId;

    if (!selectedExistingClassId) {
      const nextClass = {
        id: nextClassId,
        ...formData,
        capacity: `0/${formData.maxCapacity}`,
      };

      if (editingClasse) {
        setClasses(classes.map(c => c.id === editingClasse.id ? nextClass : c));
      } else {
        setClasses([...classes, nextClass]);
      }
    }

    if (formData.day) {
      const selectedDays = formData.day.split(',').filter(d => dayConfigs[d]);

      if (scheduleContext === 'event' && editingScheduleEventId !== null) {
        const originalEvent = scheduleEvents.find(e => e.id === editingScheduleEventId);

        if (originalEvent?.classId) {
          const classId = originalEvent.classId;
          setScheduleEvents((current) => {
            const withoutClass = current.filter(e => e.classId !== classId);
            const newEvents = selectedDays.flatMap((day) => {
              const config = dayConfigs[day];
              if (!config) return [];
              return getClassScheduleEvent(generateId(), classId, formData, day, config);
            });
            return [...withoutClass, ...newEvents];
          });
        } else if (selectedDays.length > 0) {
          const config = dayConfigs[selectedDays[0]] || DEFAULT_DAY_CONFIG;
          const nextEvent = getClassScheduleEvent(generateId(), eventClassId, formData, selectedDays[0], config);
          setScheduleEvents((current) => current.map((event) => (event.id === editingScheduleEventId ? { ...nextEvent, id: editingScheduleEventId } : event)));
        }
      } else {
        const newEvents = selectedDays.flatMap((day) => {
          const config = dayConfigs[day];
          if (!config) return [];
          return getClassScheduleEvent(generateId(), eventClassId, formData, day, config);
        });

        if (newEvents.length > 0) {
          setScheduleEvents((current) => [...current, ...newEvents]);
        }
      }
    }

    closeClassModal();
  };

  const handleSelectExistingClass = (classId: number) => {
    const selectedClass = classes.find(c => c.id === classId);
    if (!selectedClass) return;
    setSelectedExistingClassId(classId);
    setFormData({
      ...initialClassFormData,
      name: selectedClass.name,
      subject: selectedClass.subject,
      level: selectedClass.level || '',
      teacher: selectedClass.teacher,
      maxCapacity: parseInt(selectedClass.capacity.split('/')[1]) || 15,
      tarifAmount: selectedClass.tarifAmount || 0,
      tarifPeriod: selectedClass.tarifPeriod || 'mensuel',
      tarifCustomLabel: selectedClass.tarifCustomLabel || '',
      day: formData.day,
      color: '#e5e7eb',
    });
  };

  const handleArchiveSession = (id: number) => {
    const targetEvent = scheduleEvents.find((event) => event.id === id);

    if (targetEvent?.status === 'ARCHIVED') {
      setScheduleEvents((current) => current.map((event) => (
        event.id === id
          ? { ...event, status: 'ACTIVE' }
          : event
      )));
      return;
    }

    setArchiveTarget(null);
    setPendingScheduleArchiveId(id);
    setIsConfirmModalOpen(true);
  };

  const handleCreateClassFromCell = ({ day, startTime, endTime }: { day: number; startTime: string; endTime: string }) => {
    setScheduleContext('cell');
    setEditingScheduleEventId(null);
    setEditingClasse(null);
    setIsExistingClassMode(false);
    setSelectedExistingClassId(null);
    const dayStr = String(day);
    const nextFormData = {
      ...initialClassFormData,
      day: dayStr,
      color: '#e0f2fe',
    };
    const duration = String(clampDuration(startTime, getDurationBetweenTimes(startTime, endTime)));
    setFormData(nextFormData);
    setDayConfigs({ [dayStr]: { startTime, endTime, durationMinutes: duration } });
    setFormSnapshot(nextFormData);
    setIsDiscardChangesModalOpen(false);
    setIsModalOpen(true);
  };

  const handleEditScheduleEvent = (event: ScheduleEvent) => {
    const relatedClass = event.classId ? classes.find((classe) => classe.id === event.classId) : null;

    setScheduleContext('event');
    setEditingScheduleEventId(event.id);
    setEditingClasse(relatedClass ?? null);

    const allDays: string[] = [];
    const configs: Record<string, DayConfig> = {};

    if (event.classId) {
      const siblings = scheduleEvents.filter(e => e.classId === event.classId);
      siblings.forEach((sibling) => {
        const dStr = String(sibling.day);
        if (!allDays.includes(dStr)) {
          allDays.push(dStr);
          configs[dStr] = {
            startTime: sibling.startTime,
            endTime: sibling.endTime,
            durationMinutes: String(clampDuration(sibling.startTime, getDurationBetweenTimes(sibling.startTime, sibling.endTime))),
          };
        }
      });
    }

    if (allDays.length === 0) {
      const dayStr = String(event.day);
      allDays.push(dayStr);
      configs[dayStr] = {
        startTime: event.startTime,
        endTime: event.endTime,
        durationMinutes: String(clampDuration(event.startTime, getDurationBetweenTimes(event.startTime, event.endTime))),
      };
    }

    const nextFormData = {
      name: relatedClass?.name ?? event.name,
      subject: relatedClass?.subject ?? event.subject,
      level: relatedClass?.level ?? '',
      schedule: relatedClass?.schedule ?? 'Matin',
      teacher: relatedClass?.teacher ?? event.teacher,
      maxCapacity: relatedClass ? parseInt(relatedClass.capacity.split('/')[1]) : 15,
      tarifAmount: relatedClass?.tarifAmount ?? 0,
      tarifPeriod: relatedClass?.tarifPeriod ?? 'mensuel',
      tarifCustomLabel: relatedClass?.tarifCustomLabel ?? '',
      status: relatedClass?.status ?? 'ACTIVE',
      day: allDays.join(','),
      color: event.color ?? '#e0f2fe',
    };
    setFormData(nextFormData);
    setDayConfigs(configs);
    setFormSnapshot(nextFormData);
    setIsDiscardChangesModalOpen(false);
    setIsModalOpen(true);
  };

  const handleOpenModal = (classe: any = null, schedulePrefill?: Partial<ScheduleEvent>) => {
    setScheduleContext('grid');
    setEditingScheduleEventId(null);
    setIsDiscardChangesModalOpen(false);
    const prefillDay = schedulePrefill?.day !== undefined ? String(schedulePrefill.day) : '';
    if (classe) {
      setEditingClasse(classe);
      const nextFormData = {
        name: classe.name,
        subject: classe.subject,
        level: classe.level,
        schedule: classe.schedule,
        teacher: classe.teacher,
        maxCapacity: parseInt(classe.capacity.split('/')[1]),
        tarifAmount: classe.tarifAmount || 0,
        tarifPeriod: classe.tarifPeriod || 'mensuel',
        tarifCustomLabel: classe.tarifCustomLabel || '',
        status: classe.status,
        day: prefillDay,
        color: schedulePrefill?.color ?? '#e0f2fe',
      };
      setFormData(nextFormData);
      setFormSnapshot(nextFormData);
    } else {
      setEditingClasse(null);
      const nextFormData = {
        ...initialClassFormData,
        day: prefillDay,
        color: schedulePrefill?.color ?? '#e0f2fe',
      };
      setFormData(nextFormData);
      setFormSnapshot(nextFormData);
    }
    if (prefillDay && schedulePrefill?.startTime && schedulePrefill?.endTime) {
      const duration = String(clampDuration(schedulePrefill.startTime, getDurationBetweenTimes(schedulePrefill.startTime, schedulePrefill.endTime)));
      setDayConfigs({ [prefillDay]: { startTime: schedulePrefill.startTime, endTime: schedulePrefill.endTime, durationMinutes: duration } });
    } else {
      setDayConfigs({});
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenModal();
      window.history.replaceState(null, '', `${base}/classes`);
    }
  }, []);

  const handleOpenConfirmModal = (id: number | 'batch') => {
    setArchiveTarget(id);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setArchiveTarget(null);
    setPendingScheduleArchiveId(null);
  };

  const handleConfirmArchive = () => {
    if (pendingScheduleArchiveId !== null) {
      setScheduleEvents((current) => current.map((event) => (
        event.id === pendingScheduleArchiveId
          ? { ...event, status: 'ARCHIVED' }
          : event
      )));
    } else if (archiveTarget === 'batch') {
      const selectedClassIds = classes.filter(c => selectedIds.includes(c.id)).map(c => c.id);
      setClasses(classes.map(c => selectedIds.includes(c.id) ? { ...c, status: 'ARCHIVED' } : c));
      setScheduleEvents((current) => current.filter(e => e.classId === undefined || !selectedClassIds.includes(e.classId)));
      clearSelection();
    } else if (archiveTarget !== null) {
      setClasses(classes.map(c => c.id === archiveTarget ? { ...c, status: 'ARCHIVED' } : c));
      setScheduleEvents((current) => current.filter(e => e.classId !== archiveTarget));
    }
    handleCloseConfirmModal();
  };

  const handleDeleteArchivedEvent = (id: number) => {
    setDeleteArchivedEventId(id);
    setIsDeleteArchivedEventModalOpen(true);
  };

  const handleDeleteAllArchived = () => {
    setDeleteArchivedEventId('all');
    setIsDeleteArchivedEventModalOpen(true);
  };

  const handleArchive = (id: number) => {
    const targetClass = classes.find(c => c.id === id);
    if (targetClass?.status === 'ARCHIVED') {
      setClasses(classes.map(c => c.id === id ? { ...c, status: 'ACTIVE' } : c));
    } else {
      handleOpenConfirmModal(id);
    }
  };

  const handleBatchArchive = () => {
    handleOpenConfirmModal('batch');
  };

  const handleExportSelected = () => {
    setShowExportModal(true);
  };

  useEffect(() => {
    if (isPrintModalOpen) {
      setScheduleExportSelectedEventIds(scheduleEvents.map((event) => event.id));
      setHoveredPrintableEventId(null);
      return;
    }

    setScheduleExportSelectedEventIds([]);
    setHoveredPrintableEventId(null);
  }, [isPrintModalOpen, scheduleEvents]);

  const schedulePrintableEvents = scheduleEvents.filter((event) => scheduleExportSelectedEventIds.includes(event.id));

  const toggleScheduleExportEvent = (eventId: number) => {
    setScheduleExportSelectedEventIds((current) => (
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    ));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
      : { r: 224, g: 242, b: 254 };
  };

  const lighten = (hex: string, amount: number) => {
    const { r, g, b } = hexToRgb(hex);
    const lr = Math.round(r + (255 - r) * amount);
    const lg = Math.round(g + (255 - g) * amount);
    const lb = Math.round(b + (255 - b) * amount);
    return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
  };

  const darken = (hex: string, amount: number) => {
    const { r, g, b } = hexToRgb(hex);
    const dr = Math.round(r * (1 - amount));
    const dg = Math.round(g * (1 - amount));
    const db = Math.round(b * (1 - amount));
    return `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`;
  };

  const filteredClasses = classes.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'Toutes' || 
                         (activeFilter === 'Actives' && c.status === 'ACTIVE') ||
                         (activeFilter === 'Archivées' && c.status === 'ARCHIVED');
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            {filteredClasses.length} classes enregistrées
          </p>
        </div>

        {/* Improved View Switcher Positioned in the Middle */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#f3f4f6', 
          padding: '4px', 
          borderRadius: '8px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              backgroundColor: viewMode === 'grid' ? 'white' : 'transparent',
              color: viewMode === 'grid' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <LayoutGrid size={16} />
            Grilles
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              backgroundColor: viewMode === 'calendar' ? 'white' : 'transparent',
              color: viewMode === 'calendar' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <CalendarIcon size={16} />
            Emploi du temps
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <PrimaryButton 
            label="Ajouter une classe" 
            icon={<Plus size={18} />} 
            onClick={() => handleOpenModal()} 
          />
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'var(--color-white)',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--color-border)',
        height: '68px', // Slightly decreased from 74px
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          <SearchInput 
            placeholder="Rechercher une classe..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {selectedIds.length > 0 ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px', 
              padding: '6px 6px 6px 20px', 
              backgroundColor: '#e6f3ef', 
              borderRadius: '10px',
              border: '1px solid rgba(5, 150, 105, 0.15)',
              animation: 'slideInRight 0.3s ease-out',
            }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#1a5c38' }}>
                {selectedIds.length} sélectionnée(s)
              </span>
              
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={handleExportSelected}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                    border: 'none', backgroundColor: '#065f46', 
                    color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                >
                  <Download size={16} /> Exporter
                </button>
                <button 
                  onClick={handleBatchArchive}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                    border: '1px solid #e5e7eb', backgroundColor: 'white', 
                    color: '#111827', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <Archive size={16} /> Archiver
                </button>
                <button 
                  onClick={clearSelection}
                  style={{ 
                    border: 'none', background: 'none', color: '#6b7280', 
                    cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                    padding: '0 10px'
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'calendar' && (
                <button 
                  onClick={() => setIsPrintModalOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#065f46',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                >
                  <Printer size={16} />
                  Exporter Emploi du Temps
                </button>
              )}
              {viewMode === 'grid' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Toutes', 'Actives', 'Archivées'].map(f => (
                    <FilterChip 
                      key={f} 
                      label={f} 
                      active={activeFilter === f} 
                      onClick={() => setActiveFilter(f)} 
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', position: 'relative' }}>
          {filteredClasses.filter(c => c.status === 'ACTIVE').length === 0 && <EmptyDataOverlay topOffset="48px" />}
          {/* Active Classes Section */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '24px' 
          }}>
            {filteredClasses.filter(c => c.status === 'ACTIVE').map((classe) => {
              const [current, max] = classe.capacity.split('/').map(Number);
              const isFull = current >= max;
              
              return (
                <div 
                  key={classe.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    border: '1px solid var(--color-border)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'box-shadow 0.2s',
                    boxShadow: 'var(--shadow-sm)',
                    cursor: 'default'
                  }}
                >
                  <div style={{ 
                    padding: '20px 24px', 
                    borderBottom: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px' 
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '10px', 
                        backgroundColor: 'var(--color-primary-light)', 
                        color: 'var(--color-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        fontWeight: 700, 
                        fontSize: '16px' 
                      }}>
                        {classe.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--color-text)' }}>
                          {classe.name}
                        </h3>
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                          {classe.subject} • {classe.level}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status="ACTIVE" />
                  </div>

                  <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
                      <Clock size={18} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ fontWeight: 600 }}>Horaire:</span> {classe.schedule}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
                      <Users size={18} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontSize: '14px', flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>Étudiants:</span> {classe.capacity}
                      </div>
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%',
                        border: '2px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: `conic-gradient(${isFull ? 'var(--color-danger)' : 'var(--color-primary)'} ${(current / max) * 100}%, transparent 0)`,
                          transform: 'rotate(-90deg)'
                        }} />
                        <div style={{
                          position: 'absolute',
                          width: '16px',
                          height: '16px',
                          borderRadius: '50%',
                          backgroundColor: 'white'
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
                      <GraduationCap size={18} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ fontWeight: 600 }}>Professeur:</span> {classe.teacher}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--color-text-secondary)' }}>
                      <DollarSign size={18} style={{ color: 'var(--color-primary)' }} />
                      <div style={{ fontSize: '14px' }}>
                        <span style={{ fontWeight: 600 }}>Tarif:</span> {classe.tarifAmount || 0} MAD / {classe.tarifPeriod === 'custom' ? classe.tarifCustomLabel || 'Personnalisé' : TARIF_PERIOD_OPTIONS.find(p => p.value === classe.tarifPeriod)?.label || classe.tarifPeriod}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#f9fafb', 
                    borderTop: '1px solid #f3f4f6',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px'
                  }}>
                    <button 
                      title="Modifier"
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(classe); }}
                      style={{ 
                        padding: '6px', 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: 'var(--color-primary)',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      title="Archiver"
                      onClick={(e) => { e.stopPropagation(); handleArchive(classe.id); }}
                      style={{ 
                        padding: '6px', 
                        border: 'none', 
                        background: 'transparent', 
                        cursor: 'pointer', 
                        color: 'var(--color-gray)',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-gray)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-gray)'}
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Archives Section */}
          {filteredClasses.filter(c => c.status === 'ARCHIVED').length > 0 && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '16px 24px',
                backgroundColor: '#f8fafc',
                borderRadius: '16px',
                border: '1px solid var(--color-border)',
                width: '100%'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-text-secondary)'
                  }}>
                    <Archive size={18} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>Archives</h3>
                    <span style={{ 
                      fontSize: '12px', 
                      backgroundColor: 'white', 
                      border: '1px solid var(--color-border)',
                      padding: '2px 10px', 
                      borderRadius: '20px', 
                      color: 'var(--color-text-secondary)',
                      fontWeight: 600
                    }}>
                      {filteredClasses.filter(c => c.status === 'ARCHIVED').length}
                    </span>
                    <ArchiveInfoTooltip />
                  </div>
                  <button
                    onClick={() => { setDeleteTarget('all'); setIsDeleteModalOpen(true); }}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid var(--color-gray)',
                      backgroundColor: 'transparent',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: 'var(--color-gray)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--color-danger)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-gray)'; e.currentTarget.style.borderColor = 'var(--color-gray)'; }}
                  >
                    <Trash2 size={14} />
                    Supprimer tout
                  </button>
                </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '24px' 
              }}>
                {filteredClasses.filter(c => c.status === 'ARCHIVED').map((classe) => (
                  <div 
                    key={classe.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      border: '1px solid var(--color-border)',
                      padding: '20px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      opacity: 0.85,
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
                          {classe.name}
                        </h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--color-gray)' }}>
                          {classe.subject} • {classe.level}
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <StatusBadge status="DROPPED" />
                        <button
                          onClick={() => { setDeleteTarget(classe.id); setIsDeleteModalOpen(true); }}
                          style={{
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: '1px solid var(--color-danger)',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger)'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-danger)'; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-gray)' }}>
                        Prof: {classe.teacher}
                      </span>
                      <button 
                        onClick={() => handleArchive(classe.id)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          border: '1px solid var(--color-primary)', 
                          backgroundColor: 'transparent',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          color: 'var(--color-primary)',
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }}
                      >
                        Restaurer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <ScheduleCalendar
          events={scheduleEvents}
          onCreateSession={handleCreateClassFromCell}
          onEditSession={handleEditScheduleEvent}
          onArchiveSession={handleArchiveSession}
          onDeleteArchivedEvent={handleDeleteArchivedEvent}
          onDeleteAllArchived={handleDeleteAllArchived}
        />
      )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={requestCloseClassModal} 
        title={editingClasse ? "Modifier la classe" : "Ajouter une classe"}
        width="880px"
        footer={
          <>
            <PrimaryButton label="Enregistrer" onClick={handleSave} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
          {scheduleContext === 'cell' && !isExistingClassMode && (
            <div style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', borderRadius: '12px', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                Ajouter un créneau à une classe existante ?
              </span>
              <button
                type="button"
                onClick={() => setIsExistingClassMode(true)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: '1px solid #6b7280',
                  backgroundColor: 'white', fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', color: '#374151', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#374151'; e.currentTarget.style.color = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#374151'; }}
              >
                Ajouter
              </button>
            </div>
          )}

          {scheduleContext === 'cell' && isExistingClassMode && (
            <div style={{ padding: '12px 16px', backgroundColor: '#f3f4f6', borderRadius: '12px', border: '1px solid #d1d5db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                  Sélectionnez une classe existante
                </span>
                <button
                  type="button"
                  onClick={() => { setIsExistingClassMode(false); setSelectedExistingClassId(null); handleCreateClassFromCell({
                    day: Number(formData.day),
                    startTime: dayConfigs[formData.day.split(',').filter(d => d)[0]]?.startTime || '08:00',
                    endTime: dayConfigs[formData.day.split(',').filter(d => d)[0]]?.endTime || '10:00',
                  }); }}
                  style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', color: '#374151', fontSize: '12px', fontWeight: 500 }}
                >
                  Annuler
                </button>
              </div>
              <select
                value={selectedExistingClassId || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) handleSelectExistingClass(Number(val));
                }}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--color-border)', fontSize: 'var(--text-base)',
                  outline: 'none', backgroundColor: 'white'
                }}
              >
                <option value="">Choisir une classe...</option>
                {classes.filter(c => c.status === 'ACTIVE').map((c) => (
                  <option key={c.id} value={c.id}>{c.name} - {c.subject}</option>
                ))}
              </select>

              {selectedExistingClassId && (() => {
                const existingEvents = scheduleEvents.filter(
                  e => e.classId === selectedExistingClassId && e.status !== 'ARCHIVED'
                );
                if (existingEvents.length === 0) return null;
                return (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Créneaux existants
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {existingEvents.map((ev) => {
                        const dayLabel = DAY_OPTIONS.find(d => d.value === String(ev.day))?.label || '?';
                        return (
                          <div key={ev.id} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '6px 10px', borderRadius: '8px',
                            backgroundColor: 'white', border: '1px solid var(--color-border)',
                            fontSize: '12px', color: 'var(--color-text)'
                          }}>
                            <div style={{
                              width: '8px', height: '8px', borderRadius: '50%',
                              backgroundColor: ev.color || '#e5e7eb', flexShrink: 0
                            }} />
                            <span style={{ fontWeight: 600, minWidth: '60px' }}>{dayLabel}</span>
                            <span style={{ color: 'var(--color-gray)' }}>{ev.startTime} - {ev.endTime}</span>
                            <span style={{ color: 'var(--color-gray)', marginLeft: 'auto' }}>{ev.teacher}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {!isExistingClassMode && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
                <div>
                  <FormInput 
                    label="Nom de la classe" 
                    value={formData.name} 
                    onChange={(e) => handleClassFieldChange('name', e.target.value)} 
                    required 
                    placeholder="ex: G1"
                  />
                </div>
                <div>
                  <FormInput 
                    label="Matière" 
                    value={formData.subject} 
                    onChange={(e) => handleClassFieldChange('subject', e.target.value)} 
                    required 
                    placeholder="ex: Anglais"
                  />
                </div>

                <div>
                  <FormInput 
                    label="Niveau (Optionnel)" 
                    value={formData.level} 
                    onChange={(e) => handleClassFieldChange('level', e.target.value)} 
                    placeholder="ex: B2"
                  />
                </div>
                <div>
                  <FormInput 
                    label="Professeur" 
                    value={formData.teacher} 
                    onChange={(e) => handleClassFieldChange('teacher', e.target.value)} 
                    required 
                    placeholder="Nom du professeur"
                  />
                </div>

                <div>
                  <FormInput 
                    label="Capacité Max" 
                    type="number"
                    value={formData.maxCapacity} 
                    onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })} 
                    min={1}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <FormInput 
                      label="Montant du tarif (MAD)"
                      type="number"
                      value={formData.tarifAmount}
                      onChange={(e) => setFormData({ ...formData, tarifAmount: parseInt(e.target.value) || 0 })}
                      min={0}
                      placeholder="ex: 300"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <FormInput
                      label="Période"
                      type="select"
                      value={formData.tarifPeriod}
                      onChange={(e) => setFormData({ ...formData, tarifPeriod: e.target.value })}
                      options={TARIF_PERIOD_OPTIONS}
                    />
                  </div>
                </div>
                <div>
                  <FormInput
                    label="Statut"
                    type="select"
                    value={formData.status}
                    onChange={(e) => handleClassFieldChange('status', e.target.value)}
                    options={STATUS_OPTIONS}
                  />
                </div>
                {isExistingClassMode ? (
                  <div style={{ marginRight: '24px' }}>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', backgroundColor: 'var(--color-gray-bg)' }}>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                        Couleur
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#e5e7eb', border: '2px solid #9ca3af', boxShadow: '0 0 0 3px rgba(107, 114, 128, 0.14)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--color-gray)' }}>Neutre (défaut)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ marginRight: '24px' }}>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', backgroundColor: 'var(--color-gray-bg)' }}>
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
                        Couleur
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px', alignItems: 'center' }}>
                        {SESSION_COLOR_OPTIONS.map((option) => {
                          const isSelected = formData.color === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              aria-label={option.label}
                              title={option.label}
                              onClick={() => handleClassFieldChange('color', option.value)}
                              style={{
                                width: '34px', height: '34px', borderRadius: '50%',
                                border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                backgroundColor: option.value,
                                boxShadow: isSelected ? '0 0 0 3px rgba(5, 150, 105, 0.14)' : 'none',
                                cursor: 'pointer',
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                              }}
                              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            />
                          );
                        })}
                        <button
                          type="button"
                          aria-label="Couleur personnalisée"
                          title="Couleur personnalisée"
                          onClick={() => colorInputRef.current?.click()}
                          style={{
                            width: '34px', height: '34px', borderRadius: '50%',
                            border: '2px dashed var(--color-text-secondary)',
                            backgroundColor: 'white',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'transform 0.15s ease',
                            color: 'var(--color-text-secondary)',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <Palette size={16} />
                        </button>
                        <input
                          ref={colorInputRef}
                          type="color"
                          value={formData.color}
                          onChange={(e) => handleClassFieldChange('color', e.target.value)}
                          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
                        />
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: formData.color, border: '1px solid rgba(15, 23, 42, 0.1)' }} />
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Couleur sélectionnée</span>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '18px' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Planification des séances
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', width: '100%' }}>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', backgroundColor: 'var(--color-white)', width: 'fit-content', minWidth: '380px', alignSelf: 'flex-start', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <div style={{ width: '3px', height: '16px', borderRadius: '2px', backgroundColor: 'var(--color-primary)' }} />
                  <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-primary)' }}>
                    Jours de la semaine
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {DAY_OPTIONS.map((option) => {
                    const selectedDays = formData.day ? formData.day.split(',') : [];
                    const isSelected = selectedDays.includes(option.value);
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => toggleDay(option.value)}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                          backgroundColor: isSelected ? 'var(--color-primary-light)' : 'var(--color-gray-bg)',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                          fontWeight: isSelected ? 600 : 450,
                          fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 2px 6px rgba(5, 150, 105, 0.12)' : 'none',
                          outline: 'none',
                          letterSpacing: '0.01em',
                          flex: '0 0 auto',
                        }}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {formData.day && (
                  <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', opacity: 1 }} />
                    <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                      {formData.day.split(',').length} jour(s) sélectionné(s)
                    </span>
                  </div>
                )}
              </div>

              {formData.day && formData.day.split(',').filter(d => d).map((dayValue) => {
                const dayLabel = DAY_OPTIONS.find(o => o.value === dayValue)?.label || dayValue;
                const config = dayConfigs[dayValue] || DEFAULT_DAY_CONFIG;
                const colorSet = {
                  bg: lighten(formData.color, 0.85),
                  border: lighten(formData.color, 0.6),
                  accent: darken(formData.color, 0.3),
                };
                return (
                  <div key={dayValue} style={{ border: `1px solid ${colorSet.border}`, borderRadius: '14px', padding: '16px', backgroundColor: colorSet.bg, width: '100%', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <div style={{ width: '3px', height: '14px', borderRadius: '2px', backgroundColor: colorSet.accent }} />
                      <p style={{ margin: 0, fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: colorSet.accent }}>
                        {dayLabel}
                      </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px' }}>
                      <FormInput 
                        label="Début" 
                        type="time"
                        value={config.startTime}
                        onChange={(e) => updateDayConfig(dayValue, 'startTime', e.target.value)}
                        placeholder="08:00"
                      />
                      <FormInput 
                        label="Fin" 
                        type="time"
                        value={config.endTime}
                        onChange={(e) => updateDayConfig(dayValue, 'endTime', e.target.value)}
                        placeholder="10:00"
                      />
                      <FormInput
                        label="Durée (min)"
                        type="number"
                        value={config.durationMinutes}
                        onChange={(e) => updateDayConfig(dayValue, 'durationMinutes', e.target.value)}
                        placeholder="120"
                        min={MIN_SESSION_DURATION}
                        max={getAvailableMinutes(config.startTime)}
                        step={5}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                );
              })}


            </div>
          </div>
        </div>
      </Modal>

      <UnsavedChangesModal
        isOpen={isDiscardChangesModalOpen}
        onKeepEditing={() => setIsDiscardChangesModalOpen(false)}
        onDiscard={closeClassModal}
      />

      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Exporter Documents"
        width="95vw"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => {
                downloadPDF(
                  <ScheduleExportPDF events={schedulePrintableEvents} centerName={centerName} />,
                  'emploi-du-temps.pdf'
                );
                setIsPrintModalOpen(false);
              }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                border: 'none', backgroundColor: '#064e3b', 
                color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Download size={18} /> Télécharger PDF
            </button>
            <button 
              onClick={() => {
                window.print();
                setIsPrintModalOpen(false);
              }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                border: '1px solid #e5e7eb', backgroundColor: 'white', 
                color: '#111827', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <Printer size={18} /> Imprimer
            </button>
          </div>
        }
      >
        <div style={{
          position: 'relative',
          padding: '32px',
          backgroundColor: '#f1f5f9',
          minHeight: 'calc(100vh - 180px)', // ensure it fills the modal
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          borderRadius: '16px', // regular border radius for background
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.08)',
          width: 'fit-content',
          minWidth: '100%',
        }} className="receipts-container">
          {/* Document Preview Area */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            minWidth: 'fit-content',
            padding: '20px',
            marginBottom: 0,
            width: '100%',
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'transparent',
            zIndex: 2
          }}>
            <div className="print-area" style={{ 
              color: 'black', 
              backgroundColor: 'white', 
              width: '1200px',
              minHeight: '842px',
              padding: '60px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
              flexShrink: 0,
              borderRadius: '4px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                borderBottom: '2px solid #5c5c5c', // dark gray
                paddingBottom: '16px',
                marginBottom: '24px'
              }}>
                <div>
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>EDUCENTER</h1>
                  <p style={{ margin: '4px 0', fontSize: '14px', visibility: 'hidden' }}>Placeholder</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>EMPLOI DU TEMPS</h2>
                </div>
              </div>

              <div style={{ position: 'relative', border: '1px solid #000', marginTop: '40px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                  <tbody>
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((day, dayIdx) => (
                      <tr key={day} style={{ minHeight: '120px' }}>
                        <td style={{ 
                          width: '120px',
                          border: '1px solid #000', 
                          backgroundColor: '#f8fafc', 
                          padding: '12px', 
                          fontWeight: 'bold', 
                          fontSize: '13px',
                          textAlign: 'center'
                        }}>
                          {day}
                        </td>
                        <td style={{ border: '1px solid #000', position: 'relative', padding: '0px' }}>
                          <div style={{ display: 'flex', minHeight: '120px' }}>
                            {[0, 1, 2, 3, 4].map((colIdx) => (
                              <div key={colIdx} style={{ 
                                flex: 1, 
                                borderRight: colIdx < 4 ? '1px solid #e2e8f0' : 'none',
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                position: 'relative'
                              }}>
                                {/* Event placement in columns (mock logic or based on data) */}
                                {scheduleEvents.filter((e) => e.day === dayIdx && ((colIdx === 0 && e.startTime <= '10:00') || (colIdx === 1 && e.startTime > '10:00' && e.startTime <= '13:00') || (colIdx === 2 && e.startTime > '13:00' && e.startTime <= '16:00') || (colIdx === 3 && e.startTime > '16:00' && e.startTime <= '19:00') || (colIdx === 4 && e.startTime > '19:00'))).map((event) => {
                                  const isSelected = scheduleExportSelectedEventIds.includes(event.id);

                                  return (
                                  <div
                                    key={event.id}
                                    onMouseEnter={() => setHoveredPrintableEventId(event.id)}
                                    onMouseLeave={() => setHoveredPrintableEventId((current) => (current === event.id ? null : current))}
                                    style={{
                                    backgroundColor: event.color || '#e0f2fe',
                                    borderLeft: '4px solid #064e3b',
                                    padding: '10px',
                                    fontSize: '11px',
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    gap: '2px',
                                    border: '1px solid rgba(0,0,0,0.05)',
                                    width: '100%',
                                    maxWidth: '220px',
                                    alignSelf: 'center',
                                    height: '100%',
                                    position: 'relative',
                                    opacity: 1,
                                    filter: isSelected ? 'none' : 'saturate(0.45) brightness(1.08)',
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease'
                                  }}>
                                    <button
                                      type="button"
                                      title={isSelected ? 'Exclure cette timeline' : 'Inclure cette timeline'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleScheduleExportEvent(event.id);
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        width: '26px',
                                        height: '26px',
                                        borderRadius: '999px',
                                        border: '1px solid rgba(15, 23, 42, 0.14)',
                                        backgroundColor: hoveredPrintableEventId === event.id ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.84)',
                                        color: isSelected ? '#0f172a' : '#2563eb',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        opacity: hoveredPrintableEventId === event.id ? 1 : 0,
                                        pointerEvents: hoveredPrintableEventId === event.id ? 'auto' : 'none',
                                        transition: 'opacity 0.15s ease, transform 0.15s ease, background-color 0.15s ease',
                                      }}
                                    >
                                      {isSelected ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                    <div style={{ fontWeight: 'bold', color: isSelected ? '#111827' : '#7c8b9a', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.name}</div>
                                    <div style={{ fontSize: '10px', color: isSelected ? '#064e3b' : '#7a8a98', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Clock size={10} /> {event.startTime} - {event.endTime}
                                    </div>
                                    <div style={{ fontSize: '10px', color: isSelected ? '#4b5563' : '#94a3b8' }}>{event.teacher}</div>
                                  </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>Administration</p>
                  <div style={{ borderBottom: '1px solid #000' }}></div>
                </div>
                <div style={{ textAlign: 'center', width: '200px' }}>
                  <p style={{ fontWeight: 'bold', marginBottom: '40px' }}>Cachet de l'École</p>
                  <div style={{ borderBottom: '1px solid #000' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Export Modal for Selected Classes */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exporter Documents"
        width="600px"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => {
                const selectedClassesData = classes.filter(c => selectedIds.includes(c.id));
                downloadPDF(
                  <ClassExportPDF classes={selectedClassesData} />,
                  'liste-classes.pdf'
                );
                setShowExportModal(false);
                clearSelection();
              }}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                border: 'none', backgroundColor: '#064e3b', 
                color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <Download size={18} /> Télécharger PDF
            </button>
            <button 
              onClick={() => setShowExportModal(false)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', 
                border: '1px solid #e5e7eb', backgroundColor: 'white', 
                color: '#111827', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <Printer size={18} /> Imprimer
            </button>
          </div>
        }
      >
        <div style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ minWidth: '500px' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '16px',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: '#e6f3ef', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}>
                <Download size={32} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
                  Prêt pour l'exportation
                </h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  {selectedIds.length} classe(s) sélectionnée(s) pour l'exportation.
                </p>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'var(--color-gray-bg)', 
              borderRadius: '12px', 
              padding: '16px',
              border: '1px solid var(--color-border)'
            }}>
              <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
                Aperçu de la sélection
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {classes.filter(c => selectedIds.includes(c.id)).map(c => (
                  <div key={c.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    border: '1px solid #eee'
                  }}>
                    <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{c.name}</span>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{c.teacher}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Modal>

    {/* Confirmation Modal */}
    <Modal
      isOpen={isConfirmModalOpen}
      onClose={handleCloseConfirmModal}
      title="Confirmation"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={handleCloseConfirmModal}
            style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            onClick={handleConfirmArchive}
            style={{ 
              padding: '10px 20px', backgroundColor: 'var(--color-primary)', 
              color: 'white', borderRadius: '8px', border: 'none', 
              cursor: 'pointer', fontWeight: 600 
            }}
          >
            Oui, archiver
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '8px' }}>
          {pendingScheduleArchiveId !== null
            ? 'Êtes-vous sûr de vouloir archiver cette classe ?'
            : archiveTarget === 'batch' 
            ? `Êtes-vous sûr de vouloir archiver ces ${selectedIds.length} classes ?`
            : "Êtes-vous sûr de vouloir archiver cette classe ?"}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          {pendingScheduleArchiveId !== null
            ? 'Elle sera déplacée vers la section des archives.'
            : 'Elle sera déplacée vers la section des archives.'}
        </p>
      </div>
    </Modal>

    {/* Delete Confirmation Modal */}
    <Modal
      isOpen={isDeleteModalOpen}
      onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
      title="Confirmation"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
            style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (deleteTarget === 'all') {
                setClasses(classes.filter(c => c.status !== 'ARCHIVED'));
              } else {
                setClasses(classes.filter(c => c.id !== deleteTarget));
              }
              setIsDeleteModalOpen(false);
              setDeleteTarget(null);
            }}
            style={{
              padding: '10px 20px', backgroundColor: 'var(--color-danger)',
              color: 'white', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            Supprimer
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', margin: 0, lineHeight: 1.6 }}>
          {deleteTarget === 'all'
            ? 'Êtes-vous sûr de vouloir supprimer définitivement toutes les classes archivées ?'
            : 'Êtes-vous sûr de vouloir supprimer définitivement cette classe ?'}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
          Cette action est irréversible.
        </p>
      </div>
    </Modal>

    {/* Delete Archived Event Confirmation Modal */}
    <Modal
      isOpen={isDeleteArchivedEventModalOpen}
      onClose={() => { setIsDeleteArchivedEventModalOpen(false); setDeleteArchivedEventId(null); }}
      title="Confirmation"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => { setIsDeleteArchivedEventModalOpen(false); setDeleteArchivedEventId(null); }}
            style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            onClick={() => {
              if (deleteArchivedEventId === 'all') {
                setScheduleEvents((current) => current.filter(e => e.status !== 'ARCHIVED'));
              } else if (deleteArchivedEventId !== null) {
                setScheduleEvents((current) => current.filter(e => e.id !== deleteArchivedEventId));
              }
              setIsDeleteArchivedEventModalOpen(false);
              setDeleteArchivedEventId(null);
            }}
            style={{
              padding: '10px 20px', backgroundColor: 'var(--color-danger)',
              color: 'white', borderRadius: '8px', border: 'none',
              cursor: 'pointer', fontWeight: 600
            }}
          >
            Supprimer
          </button>
        </div>
      }
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', margin: 0, lineHeight: 1.6 }}>
          {deleteArchivedEventId === 'all'
            ? 'Êtes-vous sûr de vouloir supprimer définitivement toutes les séances archivées ?'
            : 'Êtes-vous sûr de vouloir supprimer définitivement cette séance ?'}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
          Cette action est irréversible.
        </p>
      </div>
    </Modal>
  </div>
  );
};

export default ClassesList;


