import React, { useState } from 'react';
import { Plus, Edit2, Archive, Users, LayoutGrid, Calendar as CalendarIcon, Printer, Download, X, Clock, GraduationCap, Search } from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PrimaryButton from '../../components/common/PrimaryButton';
import SearchInput from '../../components/common/SearchInput';
import FilterChip from '../../components/common/FilterChip';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import ScheduleCalendar from './ScheduleCalendar';
import { useClassSelection } from '../../context/ClassSelectionContext';
import { ClassExportPDF } from '../../components/finance/ClassExportPDF';
import { ScheduleExportPDF } from '../../components/finance/ScheduleExportPDF';
import { downloadPDF } from '../../utils/exporterUtils';

// Dummy Data
const initialClasses = [
  { id: 1, name: 'Anglais B2 Soir', subject: 'Anglais', level: 'B2', schedule: 'Soir', teacher: 'Prof. Ahmed', capacity: '8/15', status: 'ACTIVE' },
  { id: 2, name: 'Français A1 Matin', subject: 'Français', level: 'A1', schedule: 'Matin', teacher: 'Mme. Sarah', capacity: '12/12', status: 'ACTIVE' },
  { id: 3, name: 'Allemand B1 Weekend', subject: 'Allemand', level: 'B1', schedule: 'Soir', teacher: 'Prof. Müller', capacity: '5/10', status: 'ACTIVE' },
  { id: 4, name: 'Espagnol A2 Soir', subject: 'Espagnol', level: 'A2', schedule: 'Soir', teacher: 'Mme. Elena', capacity: '4/12', status: 'ARCHIVED' },
];

const dummyScheduleEvents = [
  { id: 1, name: 'Anglais B2', subject: 'Anglais', teacher: 'Prof. Ahmed', day: 0, startTime: '18:00', endTime: '20:00', color: '#e0f2fe' },
  { id: 2, name: 'Anglais B2', subject: 'Anglais', teacher: 'Prof. Ahmed', day: 2, startTime: '18:00', endTime: '20:00', color: '#e0f2fe' },
  { id: 3, name: 'Français A1', subject: 'Français', teacher: 'Mme. Sarah', day: 1, startTime: '09:00', endTime: '11:00', color: '#fef3c7' },
  { id: 4, name: 'Français A1', subject: 'Français', teacher: 'Mme. Sarah', day: 3, startTime: '09:00', endTime: '11:00', color: '#fef3c7' },
  { id: 5, name: 'Allemand B1', subject: 'Allemand', teacher: 'Prof. Müller', day: 5, startTime: '14:00', endTime: '17:00', color: '#dcfce7' },
  { id: 6, name: 'Espagnol A2', subject: 'Espagnol', teacher: 'Mme. Elena', day: 0, startTime: '14:00', endTime: '15:30', color: '#f1f5f9' },
  { id: 7, name: 'Mathématiques', subject: 'Maths', teacher: 'M. Jean', day: 4, startTime: '10:00', endTime: '12:00', color: '#ede9fe' },
];

const ClassesList: React.FC = () => {
  const [classes, setClasses] = useState(initialClasses);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingClasse, setEditingClasse] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<number | 'batch' | null>(null);
  const { selectedIds, setSelectedIds, showExportModal, setShowExportModal, clearSelection } = useClassSelection();

  const getTimeStyles = (startTime: string, endTime: string) => {
    // This helper is no longer used for the 5-column grid layout, 
    // but kept for compatibility or future reference if needed.
    return { position: 'relative' as const };
  };

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    level: '',
    schedule: 'Matin',
    teacher: '',
    maxCapacity: 15,
    status: 'ACTIVE',
    day: '0',
    startTime: '08:00',
    endTime: '10:00'
  });

  const handleOpenModal = (classe: any = null) => {
    if (classe) {
      setEditingClasse(classe);
      setFormData({
        name: classe.name,
        subject: classe.subject,
        level: classe.level,
        schedule: classe.schedule,
        teacher: classe.teacher,
        maxCapacity: parseInt(classe.capacity.split('/')[1]),
        status: classe.status,
        day: '0',
        startTime: '08:00',
        endTime: '10:00'
      });
    } else {
      setEditingClasse(null);
      setFormData({
        name: '',
        subject: '',
        level: '',
        schedule: 'Matin',
        teacher: '',
        maxCapacity: 15,
        status: 'ACTIVE',
        day: '0',
        startTime: '08:00',
        endTime: '10:00'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingClasse) {
      setClasses(classes.map(c => c.id === editingClasse.id ? { ...c, ...formData, capacity: `0/${formData.maxCapacity}` } : c));
    } else {
      setClasses([...classes, { id: Date.now(), ...formData, capacity: `0/${formData.maxCapacity}` }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenConfirmModal = (id: number | 'batch') => {
    setArchiveTarget(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (archiveTarget === 'batch') {
      setClasses(classes.map(c => selectedIds.includes(c.id) ? { ...c, status: 'ARCHIVED' } : c));
      clearSelection();
    } else if (archiveTarget !== null) {
      setClasses(classes.map(c => c.id === archiveTarget ? { ...c, status: 'ARCHIVED' } : c));
    }
    setIsConfirmModalOpen(false);
    setArchiveTarget(null);
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

  const filteredClasses = classes.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'Toutes' || 
                         (activeFilter === 'Actives' && c.status === 'ACTIVE') ||
                         (activeFilter === 'Archivées' && c.status === 'ARCHIVED');
    return matchesSearch && matchesFilter;
  });

  const columns: Column<any>[] = [
    { header: 'Nom de la classe', key: 'name' },
    { header: 'Matière', key: 'subject' },
    { 
      header: 'Horaire', 
      key: 'schedule',
      render: (row) => (
        <span style={{ 
          padding: '4px 8px', 
          backgroundColor: 'var(--color-primary-light)', 
          color: 'var(--color-primary)',
          borderRadius: '4px',
          fontSize: 'var(--text-xs)',
          fontWeight: 600
        }}>
          {row.schedule}
        </span>
      )
    },
    { header: 'Professeur', key: 'teacher' },
    { 
      header: 'Capacité', 
      key: 'capacity',
      render: (row) => {
        const [current, max] = row.capacity.split('/').map(Number);
        const isFull = current >= max;
        return (
          <span style={{ color: isFull ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 500 }}>
            {row.capacity}
          </span>
        );
      }
    },
    { 
      header: 'Statut', 
      key: 'status',
      render: (row) => (
        <StatusBadge status={row.status === 'ACTIVE' ? 'ACTIVE' : 'DROPPED'} /> // Mapping ARCHIVED to DROPPED style for now
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            title="Modifier"
            onClick={(e) => { e.stopPropagation(); handleOpenModal(row); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
          >
            <Edit2 size={16} />
          </button>
          <button 
            title={row.status === 'ACTIVE' ? "Archiver" : "Désarchiver"}
            onClick={(e) => { e.stopPropagation(); handleArchive(row.id); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray)' }}
          >
            <Archive size={16} />
          </button>
          <button 
            title="Voir liste"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-success)' }}
          >
            <Users size={16} />
          </button>
        </div>
      )
    }
  ];

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
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
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
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
                        background: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--color-primary)',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-light)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      title="Archiver"
                      onClick={(e) => { e.stopPropagation(); handleArchive(classe.id); }}
                      style={{ 
                        padding: '6px', 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer', 
                        color: 'var(--color-gray)',
                        borderRadius: '6px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                </div>
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
                      <StatusBadge status="DROPPED" />
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
        <ScheduleCalendar events={dummyScheduleEvents.filter(event => {
          const relatedClass = classes.find(c => event.name.startsWith(c.subject));
          return !relatedClass || relatedClass.status !== 'ARCHIVED';
        })} />
      )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingClasse ? "Modifier la classe" : "Ajouter une classe"}
        footer={
          <>
            <button 
              onClick={() => setIsModalOpen(false)}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <PrimaryButton label="Enregistrer" onClick={handleSave} />
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '400px' }}>
          <FormInput 
            label="Nom de la classe" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            required 
            placeholder="ex: Anglais B2 Soir"
          />
          <div style={{ display: 'flex', gap: '16px' }}>
            <FormInput 
              label="Matière" 
              value={formData.subject} 
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })} 
              required 
              placeholder="ex: Anglais"
              className="flex-1"
            />
            <FormInput 
              label="Niveau" 
              value={formData.level} 
              onChange={(e) => setFormData({ ...formData, level: e.target.value })} 
              placeholder="ex: B2"
              className="flex-1"
            />
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <FormInput 
              label="Professeur" 
              value={formData.teacher} 
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} 
              required 
              placeholder="Nom du professeur"
              className="flex-2"
            />
             <FormInput 
              label="Capacité Max" 
              type="number"
              value={formData.maxCapacity} 
              onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) })} 
              className="flex-1"
            />
          </div>
          
          <div style={{ borderTop: '1px solid #eee', marginTop: '8px', paddingTop: '16px' }}>
            <p style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Planification (Apparaîtra dans l'emploi du temps)
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
               <FormInput 
                label="Jour" 
                type="select"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                options={[
                  { label: 'Lundi', value: '0' },
                  { label: 'Mardi', value: '1' },
                  { label: 'Mercredi', value: '2' },
                  { label: 'Jeudi', value: '3' },
                  { label: 'Vendredi', value: '4' },
                  { label: 'Samedi', value: '5' },
                  { label: 'Dimanche', value: '6' },
                ]}
                className="flex-1"
              />
              <FormInput 
                label="Début" 
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                placeholder="08:00"
                className="flex-1"
              />
              <FormInput 
                label="Fin" 
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                placeholder="10:00"
                className="flex-1"
              />
            </div>
          </div>
        </div>
      </Modal>

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
                  <ScheduleExportPDF events={dummyScheduleEvents} />,
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
                  <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>EduSpace Casablanca</h1>
                  <p style={{ margin: '4px 0', fontSize: '14px', visibility: 'hidden' }}>Placeholder</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>EMPLOI DU TEMPS</h2>
                  <p style={{ margin: '4px 0', fontSize: '14px' }}>Année Scolaire: 2025/2026</p>
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
                                {dummyScheduleEvents.filter(e => e.day === dayIdx && ((colIdx === 0 && e.startTime <= '10:00') || (colIdx === 1 && e.startTime > '10:00' && e.startTime <= '13:00') || (colIdx === 2 && e.startTime > '13:00' && e.startTime <= '16:00') || (colIdx === 3 && e.startTime > '16:00' && e.startTime <= '19:00') || (colIdx === 4 && e.startTime > '19:00'))).map(event => (
                                  <div key={event.id} style={{
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
                                    height: '100%'
                                  }}>
                                    <div style={{ fontWeight: 'bold', color: '#111827', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.name}</div>
                                    <div style={{ fontSize: '10px', color: '#064e3b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <Clock size={10} /> {event.startTime} - {event.endTime}
                                    </div>
                                    <div style={{ fontSize: '10px', color: '#4b5563' }}>{event.teacher}</div>
                                  </div>
                                ))}
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
      onClose={() => setIsConfirmModalOpen(false)}
      title="Confirmation"
      footer={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setIsConfirmModalOpen(false)}
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
          {archiveTarget === 'batch' 
            ? `Êtes-vous sûr de vouloir archiver ces ${selectedIds.length} classes ?`
            : "Êtes-vous sûr de vouloir archiver cette classe ?"}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Elle sera déplacée vers la section des archives.
        </p>
      </div>
    </Modal>
  </div>
  );
};

export default ClassesList;


