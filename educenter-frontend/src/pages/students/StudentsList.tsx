import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, List, LayoutGrid, Download, Archive, Info, Printer } from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import PrimaryButton from '../../components/common/PrimaryButton';
import SearchInput from '../../components/common/SearchInput';
import FilterChip from '../../components/common/FilterChip';
import Modal from '../../components/common/Modal';
import ArchiveInfoTooltip from '../../components/common/ArchiveInfoTooltip';
import FormInput from '../../components/common/FormInput';
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal';
import StudentsByClass from './StudentsByClass';
import { useStudentSelection } from '../../context/StudentSelectionContext';
import { StudentExportPDF } from '../../components/finance/StudentExportPDF';
import { downloadPDF } from '../../utils/exporterUtils';
import { studentsService, classesService, paymentsService } from '../../api/supabaseService';

const periodLabels: Record<string, string> = {
  mensuel: 'mois',
  trimestrial: 'trimestre',
  annuelle: 'an',
  custom: '',
};

const initialStudentFormData = {
  full_name: '',
  phone: '',
  classe_id: '',
  enrollment_date: new Date().toISOString().split('T')[0],
  status: 'ACTIVE' as string,
  tuition_fee: 0,
  tuition_fee_status: 'PENDING' as string,
  registration_fee: 200,
  registration_fee_paid: 'PENDING' as string,
  notes: '',
  email: '',
};

const StudentsList: React.FC = () => {
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const base = `/mes-etablissements/etablissement/${etablissementId}`;

  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'list' | 'by-class'>('list');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<string | 'batch' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | 'all' | null>(null);
  const { selectedIds, setSelectedIds, showExportModal, setShowExportModal, clearSelection } = useStudentSelection();

  const [formData, setFormData] = useState(initialStudentFormData);
  const [formSnapshot, setFormSnapshot] = useState(initialStudentFormData);

  const [searchParams] = useSearchParams();

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(formSnapshot);

  const loadData = async () => {
    if (!etablissementId) return;
    try {
      const [studentData, classData] = await Promise.all([
        studentsService.list(etablissementId),
        classesService.list(etablissementId),
      ]);
      setStudents(studentData);
      setClasses(classData);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [etablissementId]);

  const handleSave = async () => {
    if (!etablissementId) return;
    try {
      if (editingStudent) {
        await studentsService.update(editingStudent.id, {
          full_name: formData.full_name,
          phone: formData.phone,
          status: formData.status,
          tuition_fee: formData.tuition_fee,
          tuition_fee_status: formData.tuition_fee_status,
          registration_fee: parseInt(String(formData.registration_fee)) || 0,
          registration_fee_paid: formData.registration_fee_paid,
          email: formData.email,
          notes: formData.notes,
          classe_id: formData.classe_id,
          enrollment_date: formData.enrollment_date,
        });
      } else {
        const newStudent = await studentsService.create({
          full_name: formData.full_name,
          phone: formData.phone,
          classe_id: formData.classe_id,
          enrollment_date: formData.enrollment_date,
          tuition_fee: formData.tuition_fee || 0,
          registration_fee: formData.registration_fee || 0,
          notes: formData.notes,
          email: formData.email,
          etablissement_id: etablissementId,
        });
        if (formData.tuition_fee_status === 'PAID') {
          await paymentsService.create({
            student_id: newStudent.id,
            amount: formData.tuition_fee,
            due_date: new Date().toISOString().split('T')[0],
            method: 'Espèces',
          });
        }
      }
      await loadData();
      closeStudentModal();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleOpenConfirmModal = (id: string | 'batch') => {
    setArchiveTarget(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmArchive = async () => {
    try {
      if (archiveTarget === 'batch') {
        if (!selectedIds) return;
        for (const sid of selectedIds) {
          await studentsService.softDelete(sid as string);
        }
        clearSelection();
      } else if (archiveTarget) {
        await studentsService.softDelete(archiveTarget);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
    setIsConfirmModalOpen(false);
    setArchiveTarget(null);
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget === 'all') {
        const droppedStudents = students.filter(s => s.status === 'DROPPED');
        for (const s of droppedStudents) {
          await studentsService.remove(s.id);
        }
      } else if (deleteTarget) {
        await studentsService.remove(deleteTarget);
      }
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleRestore = async (id: string) => {
    await studentsService.update(id, { status: 'ACTIVE' });
    await loadData();
  };

  const closeStudentModal = () => {
    setIsModalOpen(false);
    setIsDiscardModalOpen(false);
    setEditingStudent(null);
  };

  const requestCloseStudentModal = () => {
    if (isFormDirty) {
      setIsDiscardModalOpen(true);
      return;
    }
    closeStudentModal();
  };

  const handleOpenModal = (student: any = null) => {
    setIsDiscardModalOpen(false);
    if (student) {
      setEditingStudent(student);
      const nextForm = {
        full_name: student.full_name,
        phone: student.phone,
        classe_id: student.classe_id,
        enrollment_date: student.enrollment_date,
        status: student.status,
        tuition_fee: student.tuition_fee || 0,
        tuition_fee_status: student.tuition_fee_status || 'PENDING',
        registration_fee: student.registration_fee || 0,
        registration_fee_paid: student.registration_fee_paid || 'PENDING',
        notes: student.notes || '',
        email: student.email || '',
      };
      setFormData(nextForm);
      setFormSnapshot(nextForm);
    } else {
      setEditingStudent(null);
      const nextForm = { ...initialStudentFormData };
      setFormData(nextForm);
      setFormSnapshot(nextForm);
    }
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenModal();
      window.history.replaceState(null, '', `${base}/students`);
    }
  }, [searchParams, base]);

  const filteredStudents = students.filter(s => {
    const val = searchTerm.toLowerCase();
    const matchesSearch = viewMode === 'list'
      ? (s.full_name.toLowerCase().includes(val) || s.phone.includes(searchTerm))
      : (s.class_name || s.classes?.name || '').toLowerCase().includes(val);
    const matchesFilter = activeFilter === 'Tous' ||
      (activeFilter === 'Actifs' && s.status === 'ACTIVE') ||
      (activeFilter === 'En attente' && s.status === 'ON_HOLD') ||
      (activeFilter === 'Archivés' && s.status === 'DROPPED');
    return matchesSearch && matchesFilter;
  });

  const columns: Column<any>[] = [
    { header: 'Nom complet', key: 'full_name' },
    { header: 'Téléphone', key: 'phone' },
    { 
      header: 'Classe assignée', 
      key: 'classe_id',
      render: (row) => row.class_name || 'Pas de classe'
    },
    { header: "Date d'inscription", key: 'enrollment_date' },
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

  const handleBatchArchive = () => handleOpenConfirmModal('batch');

  const handleExportSelected = () => setShowExportModal(true);

  const selectedStudentsData = students.filter(s => selectedIds.includes(s.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
            {loading ? 'Chargement...' : `${filteredStudents.length} étudiants enregistrés`}
          </p>
          {error && <p style={{ color: 'red', fontSize: '0.85rem' }}>{error}</p>}

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
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none',
                borderRadius: '6px', cursor: 'pointer', fontSize: 'var(--text-sm)',
                fontWeight: 600,
                backgroundColor: viewMode === 'list' ? 'white' : 'transparent',
                color: viewMode === 'list' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <List size={16} /> Liste
            </button>
            <button
              onClick={() => setViewMode('by-class')}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: 'none',
                borderRadius: '6px', cursor: 'pointer', fontSize: 'var(--text-sm)',
                fontWeight: 600,
                backgroundColor: viewMode === 'by-class' ? 'white' : 'transparent',
                color: viewMode === 'by-class' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                boxShadow: viewMode === 'by-class' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <LayoutGrid size={16} /> Par classe
            </button>
          </div>

          <PrimaryButton
            label="Ajouter un étudiant"
            icon={<Plus size={18} />}
            onClick={() => handleOpenModal()}
          />
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--color-white)', padding: '16px', borderRadius: '12px',
          boxShadow: 'var(--shadow-sm)', border: '1px solid var(--color-border)', height: '68px', boxSizing: 'border-box'
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
                display: 'flex', alignItems: 'center', gap: '20px',
                padding: '6px 6px 6px 20px', backgroundColor: '#e6f3ef',
                borderRadius: '10px', border: '1px solid rgba(5, 150, 105, 0.15)',
                animation: 'slideInRight 0.3s ease-out'
              }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: '#1a5c38' }}>
                  {selectedIds.length} sélectionné(s)
                </span>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button onClick={handleExportSelected}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px',
                      border: 'none', backgroundColor: '#065f46', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: 600
                    }}>
                    <Download size={16} /> Exporter
                  </button>
                  <button onClick={handleBatchArchive}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px',
                      border: '1px solid #e5e7eb', backgroundColor: 'white', color: '#111827', cursor: 'pointer',
                      fontSize: '13px', fontWeight: 600, boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                    <Archive size={16} /> Archiver
                  </button>
                  <button onClick={clearSelection}
                    style={{ border: 'none', background: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '13px' }}>
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>{viewMode === 'list' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['Tous', 'Actifs', 'En attente', 'Archivés'].map(f => (
                    <FilterChip key={f} label={f} active={activeFilter === f} onClick={() => setActiveFilter(f)} />
                  ))}
                </div>
              )}</>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-gray)' }}>Chargement...</div>
        ) : viewMode === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
            <DataTable
              columns={columns}
              data={filteredStudents.filter(s => s.status !== 'DROPPED')}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={(ids) => setSelectedIds(ids as number[])}
            />
            {students.filter(s => s.status === 'DROPPED').length > 0 && (
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '16px 24px', backgroundColor: '#f8fafc', borderRadius: '16px',
                  border: '1px solid var(--color-border)', width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'white',
                      border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--color-text-secondary)'
                    }}><Archive size={18} /></div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-secondary)', margin: 0 }}>Archives</h3>
                    <span style={{
                      fontSize: '12px', backgroundColor: 'white', border: '1px solid var(--color-border)',
                      padding: '2px 10px', borderRadius: '20px', color: 'var(--color-text-secondary)', fontWeight: 600
                    }}>{students.filter(s => s.status === 'DROPPED').length}</span>
                    <ArchiveInfoTooltip />
                  </div>
                  <button onClick={() => { setDeleteTarget('all'); setIsDeleteModalOpen(true); }}
                    style={{
                      padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--color-gray)',
                      backgroundColor: 'transparent', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                      color: 'var(--color-gray)', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                    <Trash2 size={14} /> Supprimer tout
                  </button>
                </div>

                <DataTable
                  columns={columns.map(col => col.key === 'actions' ? ({
                    ...col,
                    render: (row: any) => (
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button onClick={() => handleRestore(row.id)} style={{
                          padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-primary)',
                          backgroundColor: 'transparent', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                          color: 'var(--color-primary)'
                        }}>Restaurer</button>
                        <button onClick={() => { setDeleteTarget(row.id); setIsDeleteModalOpen(true); }} style={{
                          padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--color-danger)',
                          backgroundColor: 'transparent', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                          color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '4px'
                        }}><Trash2 size={12} /></button>
                      </div>
                    )
                  } as Column<any>) : col)}
                  data={students.filter(s => s.status === 'DROPPED' && (!searchTerm || s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || s.phone.includes(searchTerm)))}
                  selectable={false}
                  hideHeader
                  showCheckboxPlaceholder
                  rowStyle={{ opacity: 0.7, backgroundColor: '#f9fafb', fontSize: '13px', color: '#64748b' }}
                />
              </div>
            )}
          </div>
        ) : (
          <StudentsByClass
            students={filteredStudents}
            onEdit={handleOpenModal}
            onArchive={(id) => handleOpenConfirmModal(id)}
            classes={classes}
          />
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={requestCloseStudentModal}
        title={editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}
        width="700px"
        footer={<PrimaryButton label="Enregistrer" onClick={handleSave} />}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>Informations personnelles</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-text)' }} />
        </div>
        <FormInput
          label="Nom complet"
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          required
          placeholder="ex: Karim Idrissi"
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: '0.9' }}>
            <FormInput label="Téléphone" value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required placeholder="06XXXXXXXX" />
          </div>
          <div style={{ flex: '1.1' }}>
            <FormInput label="Date d'inscription" type="date" value={formData.enrollment_date}
              onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })} required />
          </div>
        </div>
        <FormInput
          label="Statut"
          type="select"
          value={formData.status}
          onChange={(e) => {
            const val = e.target.value;
            setFormData({
              ...formData,
              status: val,
              tuition_fee_status: val === 'ACTIVE' && formData.tuition_fee_status === 'PAID' ? 'PAID' : 'PENDING',
            });
          }}
          options={[
            { label: 'Actif', value: 'ACTIVE' },
            { label: 'En attente', value: 'ON_HOLD' },
          ]}
          required
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '32px 0 16px' }}>
          <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>Inscription</span>
          <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--color-text)' }} />
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: '1.2' }}>
            <FormInput
              label="Classe"
              type="select"
              value={formData.classe_id}
              onChange={(e) => {
                const val = e.target.value;
                const c = classes.find(x => x.id === val);
                const fee = c ? (c.tarif_amount || 0) : 0;
                setFormData({ ...formData, classe_id: val, tuition_fee: fee });
              }}
              placeholder={formData.classe_id ? '' : 'Choisir une classe'}
              options={classes.filter(c => c.status === 'ACTIVE').map(c => ({ label: c.name, value: c.id }))}
              required
            />
          </div>
          <div style={{ flex: '1.2' }}>
            <FormInput
              label={`Tarif - ${formData.tuition_fee} MAD`}
              type="number"
              value={formData.tuition_fee}
              onChange={(e) => setFormData({ ...formData, tuition_fee: parseInt(e.target.value) || 0 })}
              min={0}
            />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer', marginLeft: '8px' }}>
          <input
            type="checkbox"
            checked={formData.tuition_fee_status === 'PAID'}
            onChange={(e) => setFormData({
              ...formData,
              tuition_fee_status: e.target.checked ? 'PAID' : 'PENDING'
            })}
            style={{ accentColor: 'var(--color-primary)', width: '16px', marginTop: '2px' }}
          />
          <span>Marquer le tarif périodique comme payé.</span>
        </label>
        <div style={{ marginTop: '20px', width: '40%' }}>
          <FormInput
            label="Frais d'inscription (MAD)"
            type="number"
            value={formData.registration_fee}
            onChange={(e) => setFormData({ ...formData, registration_fee: parseInt(e.target.value) || 0 })}
            min={0}
            placeholder="Optionnel"
          />
        </div>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', cursor: 'pointer', marginTop: '12px', marginLeft: '8px' }}>
          <input
            type="checkbox"
            checked={formData.registration_fee_paid !== 'PENDING'}
            onChange={(e) => setFormData({ ...formData, registration_fee_paid: e.target.checked ? 'PAID' : 'PENDING' })}
            style={{ accentColor: 'var(--color-primary)', width: '16px', marginTop: '2px' }}
          />
          <span>Marquer les frais d'inscription comme payés.</span>
        </label>
      </Modal>

      <UnsavedChangesModal
        isOpen={isDiscardModalOpen}
        onKeepEditing={() => setIsDiscardModalOpen(false)}
        onDiscard={closeStudentModal}
      />

      {/* Export Student List Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exporter Documents"
        width="800px"
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
            <PrimaryButton
              label="Télécharger PDF" icon={<Download size={18} />}
              onClick={() => {
                downloadPDF(<StudentExportPDF students={selectedStudentsData} />, 'liste-etudiants.pdf');
                setShowExportModal(false);
                clearSelection();
              }}
            />
            <button onClick={() => window.print()} style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px',
              border: '1px solid var(--color-border)', backgroundColor: 'white', color: 'var(--color-text)',
              cursor: 'pointer', fontWeight: 600
            }}><Printer size={18} /> Imprimer</button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            liste étudiants ({selectedStudentsData.length})
          </h4>
        </div>
        <div style={{ padding: '30px', backgroundColor: '#f1f5f9', borderRadius: '12px' }} className="receipts-container">
          <div className="print-area" style={{
            backgroundColor: 'white', width: '100%', maxWidth: '600px', margin: '0 auto',
            padding: '40px', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            minHeight: '842px', border: '1px solid var(--color-border)'
          }}>
            <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
              <div><h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '24px', fontWeight: 800 }}>EDUCENTER</h2></div>
              <div><span style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: 800 }}>LISTE ÉTUDIANTS</span></div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Étudiant</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Téléphone</th>
                <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Classe</th>
              </tr></thead>
              <tbody>{selectedStudentsData.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 8px', fontSize: '12px' }}>{s.full_name}</td>
                  <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px' }}>{s.phone}</td>
                  <td style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px' }}>{s.class_name}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Print Attendance Modal */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Exporter Liste Émargement"
        width="1000px"
        footer={<PrimaryButton label="Télécharger PDF" icon={<Download size={18} />} onClick={() => window.print()} />}
      >
        <div style={{ padding: '0', backgroundColor: '#f1f5f9', borderRadius: '12px' }} className="receipts-container">
          <div className="receipt-page" style={{ backgroundColor: 'white', padding: '40px', minHeight: '842px' }}>
            <div style={{ borderBottom: '2px solid var(--color-primary)', marginBottom: '24px', paddingBottom: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: 800 }}>FEUILLE DE PRÉSENCE</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '2px solid var(--color-primary)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px' }}>ÉTUDIANT</th>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontSize: '10px' }}>CLASSE</th>
                {['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'].map(d => (
                  <th key={d} style={{ padding: '10px 4px', textAlign: 'center', fontSize: '9px' }}>{d}</th>
                ))}
              </tr></thead>
              <tbody>{filteredStudents.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 8px', fontSize: '12px' }}>{s.full_name}</td>
                  <td style={{ padding: '12px 8px', fontSize: '11px' }}>{s.class_name}</td>
                  {[1, 2, 3, 4, 5, 6].map(d => (
                    <td key={d} style={{ textAlign: 'center' }}><div style={{ width: '14px', height: '14px', border: '1px solid #ccc', margin: '0 auto' }} /></td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Confirmation Archive Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setArchiveTarget(null); }}
        title="Confirmation"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsConfirmModalOpen(false)} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleConfirmArchive} style={{ padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Confirmer</button>
          </div>
        }
      >
        <p>{archiveTarget === 'batch' ? `Archiver ${selectedIds.length} étudiants ?` : "Archiver cet étudiant ?"}</p>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }}
        title="Confirmation"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setIsDeleteModalOpen(false); setDeleteTarget(null); }} style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}>Annuler</button>
            <button onClick={handleDelete} style={{ padding: '10px 20px', backgroundColor: 'var(--color-danger)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Supprimer</button>
          </div>
        }
      >
        <p>{deleteTarget === 'all' ? 'Supprimer tous les étudiants archivés ?' : 'Supprimer cet étudiant ?'}</p>
      </Modal>
    </div>
  );
};

export default StudentsList;
