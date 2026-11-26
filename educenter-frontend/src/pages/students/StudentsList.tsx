import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, List, LayoutGrid, Download, Archive, Printer } from 'lucide-react';
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
import { studentsService, paymentsService, classesService, type MappedStudent } from '../../api/apiService';
import { getItem } from '../../utils/storage';
import { toDateInput } from '../../utils/date';

interface ClassRow {
  id: string;
  name: string;
  subject?: string;
  level?: string;
  teacher?: string;
  max_capacity?: number;
  maxCapacity?: number;
  status?: string;
  tarif_amount?: number;
  tarifAmount?: number;
  tarif_period?: string;
  tarifPeriod?: string;
  tarifCustomLabel?: string;
  tarif?: number;
  capacity?: string;
  color?: string;
}

const initialStudentFormData = {
  full_name: '',
  phone: '',
  classe_id: '',
  enrollment_date: toDateInput(),
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

  const [students, setStudents] = useState<MappedStudent[]>([]);
  const [classes, setClasses] = useState<ClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<MappedStudent | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'by-class'>('list');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<string | 'batch' | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | 'all' | null>(null);
  const { selectedIds, setSelectedIds, showExportModal, setShowExportModal, clearSelection } = useStudentSelection();

  const [formData, setFormData] = useState(initialStudentFormData);
  const [formSnapshot, setFormSnapshot] = useState(initialStudentFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [searchParams] = useSearchParams();

  const isFormDirty = JSON.stringify(formData) !== JSON.stringify(formSnapshot);

  const clearFieldError = (field: string) => {
    setFormErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  useEffect(() => {
    if (Object.keys(formErrors).length > 0) {
      const firstErrorField = Object.keys(formErrors)[0];
      const el = document.getElementById(`field-${firstErrorField}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [formErrors]);

  const loadData = useCallback(async () => {
    if (!etablissementId) return;
    try {
      const [studentData, apiClasses] = await Promise.all([
        studentsService.list(etablissementId),
        classesService.list(etablissementId).catch(() => []),
      ]);
      const storedClasses = getItem<ClassRow[]>(`classes_${etablissementId ?? 'default'}`, []);
      setStudents(studentData);
      setClasses(apiClasses.length > 0
        ? apiClasses
        : (Array.isArray(storedClasses) ? storedClasses : []));
    } catch (err) {
      console.error(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [etablissementId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getClassTarif = (c: ClassRow): number => Number(c?.tarifAmount ?? c?.tarif_amount ?? c?.tarif ?? 0) || 0;

  const getClassPeriodLabel = (c: ClassRow | null): string => {
    if (!c) return '';
    const labels: Record<string, string> = {
      mensuel: 'Mensuel',
      trimestriel: 'Trimestriel',
      trimestrial: 'Trimestriel',
      annuel: 'Annuel',
      annuelle: 'Annuel',
    };
    const period = c.tarifPeriod || c.tarif_period || '';
    if (period === 'custom') return c.tarifCustomLabel || 'Personnalisé';
    return labels[period] || period || '';
  };

  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      errors.full_name = 'Le nom est requis';
    } else if (formData.full_name.trim().length < 3) {
      errors.full_name = 'Minimum 3 caractères';
    } else if (formData.full_name.trim().length > 100) {
      errors.full_name = 'Maximum 100 caractères';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Le téléphone est requis';
    } else if (!/^0[5-7]\d{8}$/.test(formData.phone.trim())) {
      errors.phone = 'Format invalide (ex: 06XXXXXXXX)';
    }

    if (!formData.enrollment_date) {
      errors.enrollment_date = "La date d'inscription est requise";
    }

    if (!formData.classe_id) {
      errors.classe_id = 'La classe est requise';
    }

    if (!formData.tuition_fee || formData.tuition_fee <= 0) {
      errors.tuition_fee = 'Le tarif doit être > 0';
    }

    if (formData.registration_fee < 0) {
      errors.registration_fee = 'Le montant ne peut pas être négatif';
    }

    return errors;
  };

  const getClassPeriod = (c: ClassRow | null): string => c?.tarif_period || c?.tarifPeriod || 'mensuel';

  const getPeriodDueDate = (period: string): string => {
    const due = new Date();
    if (period === 'mensuel') due.setMonth(due.getMonth() + 1);
    else if (period === 'trimestriel' || period === 'trimestrial') due.setMonth(due.getMonth() + 3);
    else if (period === 'annuel' || period === 'annuelle') due.setFullYear(due.getFullYear() + 1);
    else due.setMonth(due.getMonth() + 1);
    return toDateInput(due);
  };

  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const resolveClassId = async (classId: string): Promise<string> => {
    if (UUID_REGEX.test(classId)) return classId;

    const localClass = classes.find(c => String(c.id) === String(classId));
    if (!localClass || !etablissementId) return classId;

    const apiClasses = await classesService.list(etablissementId);
    const existing = apiClasses.find(c => c.name === localClass.name);
    if (existing) return existing.id;

    const created = await classesService.create({
      name: localClass.name,
      subject: localClass.subject || '',
      level: localClass.level || '',
      teacher: localClass.teacher || '',
      max_capacity: parseInt(String(localClass.capacity ?? '').split('/')[1], 10) || Number(localClass.maxCapacity) || 0,
      tarif_amount: Number(localClass.tarifAmount) || 0,
      tarif_period: localClass.tarifPeriod || 'mensuel',
      color: localClass.color || '#e0f2fe',
      etablissement_id: etablissementId,
      status: localClass.status || 'ACTIVE',
    });
    return created.id;
  };

  const createTuitionPayment = async (studentId: string) => {
    if (formData.tuition_fee_status !== 'PAID' || !formData.tuition_fee || formData.tuition_fee <= 0) return;
    const today = toDateInput();
    const studentClass = classes.find(c => String(c.id) === String(formData.classe_id));
    const dueDate = getPeriodDueDate(getClassPeriod(studentClass ?? null));
    await paymentsService.create({
      student_id: studentId,
      amount: formData.tuition_fee,
      due_date: dueDate,
      method: 'Espèces',
      payment_category: 'TUITION',
      status: 'PAID',
      payment_date: today,
      period_start_date: today,
      period_end_date: dueDate,
    });
  };

  const createRegistrationPayment = async (studentId: string) => {
    if (formData.registration_fee_paid !== 'PAID' || !formData.registration_fee || formData.registration_fee <= 0) return;
    const paymentDate = formData.enrollment_date || toDateInput();
    await paymentsService.create({
      student_id: studentId,
      amount: formData.registration_fee,
      due_date: paymentDate,
      method: 'Espèces',
      payment_category: 'REGISTRATION',
      status: 'PAID',
      payment_date: paymentDate,
    });
  };

  const handleSave = async () => {
    if (!etablissementId) return;
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }
    try {
      const resolvedClassId = await resolveClassId(formData.classe_id);
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
          classe_id: resolvedClassId,
          enrollment_date: formData.enrollment_date,
        });
        if (formData.tuition_fee_status === 'PAID' && editingStudent.tuition_fee_status !== 'PAID') {
          await createTuitionPayment(editingStudent.id);
        }
        if (formData.registration_fee_paid === 'PAID' && editingStudent.registration_fee_paid !== 'PAID') {
          await createRegistrationPayment(editingStudent.id);
        }
      } else {
        const newStudent = await studentsService.create({
          full_name: formData.full_name,
          phone: formData.phone,
          classe_id: resolvedClassId,
          enrollment_date: formData.enrollment_date,
          status: formData.status,
          tuition_fee: formData.tuition_fee || 0,
          tuition_fee_status: formData.tuition_fee_status,
          registration_fee: formData.registration_fee || 0,
          registration_fee_paid: formData.registration_fee_paid,
          notes: formData.notes,
          email: formData.email,
        });
        await createTuitionPayment(newStudent.id);
        await createRegistrationPayment(newStudent.id);
      }
      await loadData();
      closeStudentModal();
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
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
          await studentsService.softDelete(sid);
        }
        clearSelection();
      } else if (archiveTarget) {
        await studentsService.softDelete(archiveTarget);
      }
      await loadData();
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
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
    } catch (err) {
      console.error(err instanceof Error ? err.message : err);
      alert(err instanceof Error ? err.message : 'Impossible de supprimer cet étudiant.');
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
    setFormErrors({});
  };

  const requestCloseStudentModal = () => {
    if (isFormDirty) {
      setIsDiscardModalOpen(true);
      return;
    }
    closeStudentModal();
  };

  const handleOpenModal = (student: MappedStudent | null = null) => {
    setIsDiscardModalOpen(false);
    setFormErrors({});
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

  const columns: Column<MappedStudent>[] = [
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
          backgroundColor: 'var(--color-white)', padding: '16px', borderRadius: '0px',
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
              onSelectionChange={(ids) => setSelectedIds(ids as string[])}
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
                    render: (row: MappedStudent) => (
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
                  } as Column<MappedStudent>) : col)}
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
            students={filteredStudents.filter(s => s.status !== 'DROPPED')}
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
        <FormInput
          label="Nom complet"
          value={formData.full_name}
          onChange={(e) => { setFormData({ ...formData, full_name: e.target.value }); clearFieldError('full_name'); }}
          required
          placeholder="ex: Karim Idrissi"
          inputId="field-full_name"
          error={formErrors.full_name}
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: '0.9' }}>
            <FormInput label="Téléphone" value={formData.phone}
              onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearFieldError('phone'); }} required placeholder="06XXXXXXXX"
              inputId="field-phone" error={formErrors.phone} />
          </div>
          <div style={{ flex: '1.1' }}>
            <FormInput label="Date d'inscription" type="date" value={formData.enrollment_date}
              onChange={(e) => { setFormData({ ...formData, enrollment_date: e.target.value }); clearFieldError('enrollment_date'); }} required
              inputId="field-enrollment_date" error={formErrors.enrollment_date} />
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

        <div style={{ borderTop: '1px solid #d1d5db', marginTop: '24px', paddingTop: '18px' }}>
          <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px', textTransform: 'uppercase' }}>
            Inscription
          </p>
          </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: '1.2' }}>
            <FormInput
              label="Classe"
              type="select"
              value={formData.classe_id}
              onChange={(e) => {
                const val = e.target.value;
                const c = classes.find(x => String(x.id) === val);
                const fee = c ? getClassTarif(c) : 0;
                setFormData({ ...formData, classe_id: val, tuition_fee: fee });
                clearFieldError('classe_id');
                clearFieldError('tuition_fee');
              }}
              placeholder={formData.classe_id ? '' : 'Choisir une classe'}
              options={classes.filter(c => c.status === 'ACTIVE').map(c => ({ label: c.name, value: c.id }))}
              required
              inputId="field-classe_id"
              error={formErrors.classe_id}
            />
          </div>
          <div style={{ flex: '1.2' }}>
            <FormInput
              label={`Tarif - ${formData.tuition_fee} MAD / ${getClassPeriodLabel(classes.find(x => String(x.id) === formData.classe_id) ?? null)}`}
              type="number"
              value={formData.tuition_fee}
              onChange={(e) => { setFormData({ ...formData, tuition_fee: parseInt(e.target.value) || 0 }); clearFieldError('tuition_fee'); }}
              min={0}
              inputId="field-tuition_fee"
              error={formErrors.tuition_fee}
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
            onChange={(e) => { setFormData({ ...formData, registration_fee: parseInt(e.target.value) || 0 }); clearFieldError('registration_fee'); }}
            min={0}
            placeholder="Optionnel"
            inputId="field-registration_fee"
            error={formErrors.registration_fee}
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
