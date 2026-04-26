import React, { useState } from 'react';
import { Plus, Edit2, Trash2, List, LayoutGrid, Printer, Download, Archive, X } from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PrimaryButton from '../../components/common/PrimaryButton';
import SearchInput from '../../components/common/SearchInput';
import FilterChip from '../../components/common/FilterChip';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import StudentsByClass from './StudentsByClass';
import { useStudentSelection } from '../../context/StudentSelectionContext';
import { StudentExportPDF } from '../../components/finance/StudentExportPDF';
import { downloadPDF } from '../../utils/exporterUtils';

// Dummy Data
const initialStudents = [
  { id: 1, name: 'Karim Idrissi', phone: '0661234567', class: 'Anglais B2', enrollmentDate: '2026-03-28', status: 'ACTIVE' },
  { id: 2, name: 'Sara Benali', phone: '0667654321', class: 'Français A1', enrollmentDate: '2026-03-25', status: 'ON_HOLD' },
  { id: 3, name: 'Nadia Ouali', phone: '0660123456', class: 'Allemand B1', enrollmentDate: '2026-03-20', status: 'ACTIVE' },
  { id: 4, name: 'Youssef Ait Brahim', phone: '0661112233', class: 'Anglais B2', enrollmentDate: '2026-03-15', status: 'ACTIVE' },
  { id: 5, name: 'Imane Filali', phone: '0664445566', class: 'Français A1', enrollmentDate: '2026-03-10', status: 'DROPPED' },
];

const StudentsList: React.FC = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'by-class'>('list');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<number | 'batch' | null>(null);
  const { selectedIds, setSelectedIds, showExportModal, setShowExportModal, clearSelection } = useStudentSelection();

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    class: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });

  const handleOpenModal = (student: any = null) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        name: student.name,
        phone: student.phone,
        class: student.class,
        enrollmentDate: student.enrollmentDate,
        status: student.status
      });
    } else {
      setEditingStudent(null);
      setFormData({
        name: '',
        phone: '',
        class: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
    } else {
      setStudents([...students, { id: Date.now(), ...formData }]);
    }
    setIsModalOpen(false);
  };

  const handleOpenConfirmModal = (id: number | 'batch') => {
    setArchiveTarget(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (archiveTarget === 'batch') {
      setStudents(students.map(s => selectedIds.includes(s.id) ? { ...s, status: 'DROPPED' } : s));
      clearSelection();
    } else if (archiveTarget !== null) {
      setStudents(students.map(s => s.id === archiveTarget ? { ...s, status: 'DROPPED' } : s));
    }
    setIsConfirmModalOpen(false);
    setArchiveTarget(null);
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = viewMode === 'list'
      ? (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm))
      : s.class.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = activeFilter === 'Tous' ||
      (activeFilter === 'Actifs' && s.status === 'ACTIVE') ||
      (activeFilter === 'En attente' && s.status === 'ON_HOLD') ||
      ((activeFilter === 'Abandonnés' || activeFilter === 'Archivés') && s.status === 'DROPPED');
    return matchesSearch && matchesFilter;
  });

  const columns: Column<any>[] = [
    { header: 'Nom complet', key: 'name' },
    { header: 'Téléphone', key: 'phone' },
    { header: 'Classe assignée', key: 'class' },
    { header: 'Date d\'inscription', key: 'enrollmentDate' },
    {
      header: 'Statut',
      key: 'status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenModal(row); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-primary)' }}
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleOpenConfirmModal(row.id); }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray)' }}
            title="Archiver"
          >
            <Archive size={16} />
          </button>
        </div>
      )
    }
  ];

  const handleBatchArchive = () => {
    handleOpenConfirmModal('batch');
  };

  const handleExportSelected = () => {
    setShowExportModal(true);
  };

  const selectedStudentsData = students.filter(s => selectedIds.includes(s.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
              {students.filter(s => s.status !== 'DROPPED').length} étudiants actifs
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
              onClick={() => setViewMode('list')}
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
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <List size={16} />
              Liste
            </button>
            <button
              onClick={() => setViewMode('by-class')}
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
                backgroundColor: viewMode === 'by-class' ? 'white' : 'transparent',
                color: viewMode === 'by-class' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'by-class' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <LayoutGrid size={16} />
              Par classe
            </button>
          </div>

          <PrimaryButton
            label="Ajouter un étudiant"
            icon={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          />
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
              placeholder={viewMode === 'list' ? "Rechercher un étudiant..." : "Rechercher une classe..."}
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
                  {selectedIds.length} sélectionné(s)
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
                {viewMode === 'list' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['Tous', 'Actifs', 'En attente', 'Archivés'].map(f => (
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

        {viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <DataTable
              columns={columns}
              data={filteredStudents.filter(s => s.status !== 'DROPPED')}
              selectable={true}
              selectedIds={selectedIds}
              onSelectionChange={(ids) => setSelectedIds(ids as number[])}
            />

            {/* Archives Section */}
            {students.filter(s => s.status === 'DROPPED').length > 0 && (
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
                      {students.filter(s => s.status === 'DROPPED').length}
                    </span>
                  </div>
                </div>

                <DataTable
                  columns={columns.map(col => col.key === 'actions' ? ({
                    ...col,
                    render: (row: any) => (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setStudents(students.map(s => s.id === row.id ? { ...s, status: 'ACTIVE' } : s)); }}
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
                    )
                  } as Column<any>) : col)}
                  data={students.filter(s => s.status === 'DROPPED' && (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm)))}
                  selectable={false}
                  hideHeader={true}
                  showCheckboxPlaceholder={true}
                  rowStyle={{
                    opacity: 0.7,
                    backgroundColor: '#f9fafb',
                    fontSize: '13px',
                    color: '#64748b'
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <StudentsByClass
            students={filteredStudents}
            onEdit={handleOpenModal}
            onArchive={(id) => handleOpenConfirmModal(id as any)}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
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
        <FormInput
          label="Nom complet"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="ex: Karim Idrissi"
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <FormInput
            label="Téléphone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
            placeholder="06XXXXXXXX"
            className="flex-1"
          />
          <FormInput
            label="Date d'inscription"
            type="date"
            value={formData.enrollmentDate}
            onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
            required
            className="flex-1"
          />
        </div>
        <FormInput
          label="Classe"
          type="select"
          value={formData.class}
          onChange={(e) => setFormData({ ...formData, class: e.target.value })}
          placeholder="Choisir une classe"
          options={[
            { label: 'Anglais B2', value: 'Anglais B2' },
            { label: 'Français A1', value: 'Français A1' },
            { label: 'Allemand B1', value: 'Allemand B1' },
          ]}
          required
        />
        <FormInput
          label="Statut"
          type="select"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          options={[
            { label: 'Actif', value: 'ACTIVE' },
            { label: 'En attente', value: 'ON_HOLD' },
            { label: 'Archivé', value: 'DROPPED' },
          ]}
          required
        />
      </Modal>

      {/* Export Student List Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exporter Documents"
        width="800px"
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
            <PrimaryButton
              label="Télécharger PDF"
              icon={<Download size={18} />}
              onClick={() => {
                downloadPDF(
                  <StudentExportPDF students={selectedStudentsData} />,
                  'liste-etudiants.pdf'
                );
                setShowExportModal(false);
                clearSelection();
              }}
            />
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'white',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-bg)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <Printer size={18} /> Imprimer
            </button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            liste des étudiants ({selectedStudentsData.length})
          </h4>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '30px',
          backgroundColor: '#f1f5f9',
          borderRadius: '12px'
        }} className="receipts-container">
          <div className="print-area" style={{
            backgroundColor: 'white',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '40px',
            borderRadius: '4px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minHeight: '842px',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Document Header */}
            <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '24px', fontWeight: 800 }}>CENTRE CASABLANCA</h2>
                <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Apprentissage & Excellence</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: 800 }}>
                  LISTE DES ÉTUDIANTS
                </div>
                <p style={{ marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>Date: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            {/* Content Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Étudiant</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Téléphone</th>
                  <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Classe</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudentsData.map((student, idx) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontSize: '12px', fontWeight: 600 }}>{student.name}</td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px' }}>{student.phone}</td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px' }}>{student.class}</td>
                    <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '11px', fontWeight: 700 }}>{student.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-gray)' }}>
                EduCenter ERP - Système de Gestion Scolaire
              </div>
              <div style={{ fontSize: '10px', fontWeight: 600 }}>
                Signature & Cachet
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Print/PDF Export Modal for Attendance Management */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Exporter Liste d'Émargement"
        width="1000px"
        className="attendance-export-modal"
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-start' }}>
            <PrimaryButton
              label="Télécharger en PDF"
              icon={<Download size={18} />}
              onClick={() => window.print()}
            />
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'white',
                color: 'var(--color-text)',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              <Printer size={18} /> Imprimer
            </button>
          </div>
        }
      >
        <div style={{ padding: '0', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden' }} className="receipts-container">
          <div className="receipt-page" style={{
            backgroundColor: 'white',
            padding: '40px',
            minHeight: '842px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--color-primary)', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '20px', fontWeight: 800 }}>CENTRE CASABLANCA</h2>
                <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>Gestion des Absences & Émargement</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: 800 }}>FEUILLE DE PRÉSENCE</div>
                <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-gray)' }}>Généré le: {new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px', border: '1px solid var(--color-primary)' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                CRITÈRES: {activeFilter === 'Tous' ? 'Tous les étudiants' : `Filtre: ${activeFilter}`} | Total: {filteredStudents.length}
              </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-gray-bg)', borderTop: '1px solid var(--color-border)', borderBottom: '2px solid var(--color-primary)' }}>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', width: '25%' }}>ÉTUDIANT</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left', fontSize: '10px', width: '20%' }}>CLASSE</th>
                  {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'].map(day => (
                    <th key={day} style={{ padding: '10px 4px', textAlign: 'center', fontSize: '9px', borderLeft: '1px solid var(--color-border)' }}>{day}</th>
                  ))}
                  <th style={{ padding: '10px 8px', textAlign: 'center', fontSize: '10px', borderLeft: '1px solid var(--color-border)', width: '15%' }}>NOTE</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 8px', fontSize: '12px', fontWeight: 600 }}>{student.name}</td>
                    <td style={{ padding: '12px 8px', fontSize: '11px', color: 'var(--color-text-secondary)' }}>{student.class}</td>
                    {[1, 2, 3, 4, 5, 6].map(d => (
                      <td key={d} style={{ padding: '12px 0', borderLeft: '1px solid var(--color-border)', textAlign: 'center' }}>
                        <div style={{ width: '14px', height: '14px', border: '1px solid #ccc', margin: '0 auto', borderRadius: '2px' }}></div>
                      </td>
                    ))}
                    <td style={{ borderLeft: '1px solid var(--color-border)', height: '40px' }}></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '10px', fontStyle: 'italic', color: 'var(--color-gray)' }}>
                * Légal: Signature du professeur obligatoire à la fin de chaque séance.
              </div>
              <div style={{ textAlign: 'right', minWidth: '150px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, margin: '0 0 40px 0' }}>Visa Direction / Professeur</p>
                <div style={{ borderBottom: '1px solid var(--color-border)', width: '100%' }}></div>
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
            ? `Êtes-vous sûr de vouloir archiver ces ${selectedIds.length} étudiants ?`
            : "Êtes-vous sûr de vouloir archiver cet étudiant ?"}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Ils seront déplacés vers la section des archives.
        </p>
      </div>
    </Modal>
  </div>
  );
};

export default StudentsList;


