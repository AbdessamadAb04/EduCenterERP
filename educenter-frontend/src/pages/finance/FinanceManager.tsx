import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Plus, Download, Printer, Archive, Edit2, Trash2, Calendar, X, ChevronLeft, ChevronRight, List } from 'lucide-react';
import DataTable, { type Column } from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import MetricCard from '../../components/common/MetricCard';
import PrimaryButton from '../../components/common/PrimaryButton';
import SearchInput from '../../components/common/SearchInput';
import FilterChip from '../../components/common/FilterChip';
import Modal from '../../components/common/Modal';
import FormInput from '../../components/common/FormInput';
import WhatsAppButton from '../../components/common/WhatsAppButton';
import { usePaymentSelection } from '../../context/PaymentSelectionContext';
import { BulkPaymentReceiptsPDF } from '../../components/finance/BulkPaymentReceiptsPDF';
import { downloadPDF } from '../../utils/exporterUtils';
import ArchiveInfoTooltip from '../../components/common/ArchiveInfoTooltip';
import UnsavedChangesModal from '../../components/common/UnsavedChangesModal';
import { usePaymentData as useSupabasePaymentData } from '../../context/PaymentDataContext';
import { studentsService } from '../../api/supabaseService';
import { classesService } from '../../api/supabaseService';

const monthsFR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const FinanceManager: React.FC = () => {
  const { etablissementId } = useParams<{ etablissementId: string }>();
  const [searchParams] = useSearchParams();
  const base = `/mes-etablissements/etablissement/${etablissementId}`;
  const { payments, loading, handleCreatePayment: ctxCreatePayment, handleUpdatePayment: ctxUpdatePayment, handleDeletePayment: ctxDeletePayment, handleMarkAsPaid: ctxMarkAsPaid, handleArchivePayment: ctxArchivePayment, refreshPayments } = useSupabasePaymentData();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<number | 'all' | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<number | 'batch' | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isDiscardChangesModalOpen, setIsDiscardChangesModalOpen] = useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const monthPickerRef = React.useRef<HTMLDivElement>(null);
  const monthCardRefs = React.useRef<Record<string, HTMLDivElement | null>>({});
  const formSnapshot = React.useRef(JSON.stringify({ student: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], method: 'Espèces' }));

  const { selectedPaymentIds, setSelectedPaymentIds, showReceiptModal, setShowReceiptModal, clearSelection } = usePaymentSelection();

  const MONTH_CARD_WIDTH = 160;
  const MONTH_GAP = 16;

  const [formData, setFormData] = useState({
    student: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    method: 'Espèces',
  });

  const [editFormData, setEditFormData] = useState({
    student: '',
    amount: 0,
    dueDate: '',
    method: 'Espèces',
  });

  const [markPaidData, setMarkPaidData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'Espèces'
  });

  const [toleranceDays, setToleranceDays] = useState(7);
  const [periodLabel, setPeriodLabel] = useState('');
  const [periodStartDate, setPeriodStartDate] = useState('');
  const [periodEndDate, setPeriodEndDate] = useState('');

  const isFormDirty = JSON.stringify(formData) !== formSnapshot.current;

  const showMonthNav = () => {
    const el = scrollRef.current;
    if (!el) return;
    const hasOverflow = el.scrollWidth > el.clientWidth + 1;
    setHoverLeft(hasOverflow && el.scrollLeft > 1);
    setHoverRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  };

  const clearMonthNavHover = () => {
    setHoverLeft(false);
    setHoverRight(false);
  };

  const scrollMonths = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const step = el.clientWidth;
    el.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  };

  const getPaymentMonthInfo = React.useCallback((dueDate: string) => {
    const d = new Date(dueDate + 'T00:00:00');
    const year = d.getFullYear();
    const month = d.getMonth();
    return {
      key: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: monthsFR[month],
      year,
    };
  }, []);

  const monthOptions = React.useMemo(() => {
    const monthsMap = new Map<string, { label: string; key: string }>();
    for (const p of payments) {
      if (!p.dueDate) continue;
      const info = getPaymentMonthInfo(p.dueDate);
      if (!monthsMap.has(info.key)) {
        monthsMap.set(info.key, { label: info.label, key: info.key });
      }
    }
    const months = Array.from(monthsMap.values());
    months.sort((a, b) => b.key.localeCompare(a.key));
    return months;
  }, [payments, getPaymentMonthInfo]);

  const availableYears = React.useMemo(() => {
    const years = new Set<number>();
    for (const p of payments) {
      if (!p.dueDate) continue;
      years.add(new Date(p.dueDate + 'T00:00:00').getFullYear());
    }
    return [...years].sort((a, b) => b - a);
  }, [payments]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      setHoverLeft(hasOverflow && el.scrollLeft > 1);
      setHoverRight(hasOverflow && el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target as Node)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenPaymentModal = () => {
    const emptyForm = { student: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], method: 'Espèces' };
    if (isFormDirty) {
      setIsDiscardChangesModalOpen(true);
      return;
    }
    setFormData(emptyForm);
    formSnapshot.current = JSON.stringify(emptyForm);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenPaymentModal();
      window.history.replaceState(null, '', `${base}/finance`);
    }
  }, []);

  const closePaymentModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setIsDiscardChangesModalOpen(false);
    resetPaymentForm();
  };

  const requestCloseAddPaymentModal = () => {
    if (isFormDirty) {
      setIsDiscardChangesModalOpen(true);
      return;
    }
    closePaymentModal();
  };

  const resetPaymentForm = () => {
    const emptyForm = { student: '', amount: 0, dueDate: new Date().toISOString().split('T')[0], method: 'Espèces' };
    setFormData(emptyForm);
    formSnapshot.current = JSON.stringify(emptyForm);
    setToleranceDays(7);
    setPeriodLabel('');
    setPeriodStartDate('');
    setPeriodEndDate('');
  };

  const PAYMENT_METHOD_OPTIONS = [
    { label: 'Espèces', value: 'Espèces' },
    { label: 'Virement', value: 'Virement' },
  ];

  const periodLabels: Record<string, string> = {
    mensuel: 'Mensuel',
    trimestrial: 'Trimestriel',
    annuelle: 'Annuel',
  };

  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [allClasses, setAllClasses] = useState<any[]>([]);
  const toleranceByPeriod: Record<string, number> = {
    mensuel: 7,
    trimestrial: 15,
    annuelle: 30,
  };

  useEffect(() => {
    if (etablissementId) {
      studentsService.list(etablissementId).then(setAllStudents).catch(() => {});
      classesService.list(etablissementId).then(setAllClasses).catch(() => {});
    }
  }, [etablissementId]);

  const getStudentTariffInfo = (studentName: string) => {
    const student = allStudents.find(s => s.full_name === studentName || s.name === studentName);
    if (!student) return null;

    const classeId = student.classe_id || student.class;
    const studentClass = allClasses.find(c => c.id === classeId || c.name === classeId);
    if (!studentClass) return null;

    const period = studentClass.tarif_period || studentClass.tarifPeriod || 'mensuel';
    const today = new Date();
    const due = new Date(today);

    switch (period) {
      case 'mensuel': due.setMonth(due.getMonth() + 1); break;
      case 'trimestrial': due.setMonth(due.getMonth() + 3); break;
      case 'annuelle': due.setFullYear(due.getFullYear() + 1); break;
    }

    return {
      amount: studentClass.tarif_amount || studentClass.tarifAmount || 0,
      period,
      dueDate: due.toISOString().split('T')[0],
      tolerance: toleranceByPeriod[period] || 7,
    };
  };

  const handleStudentChange = (studentName: string) => {
    const info = getStudentTariffInfo(studentName);
    if (info) {
      const today = new Date().toISOString().split('T')[0];
      setFormData({ ...formData, student: studentName, amount: info.amount, dueDate: info.dueDate });
      setToleranceDays(info.tolerance);
      setPeriodLabel(periodLabels[info.period] || info.period);
      setPeriodStartDate(today);
      setPeriodEndDate(info.dueDate);
    } else {
      setFormData({ ...formData, student: studentName });
      setToleranceDays(7);
      setPeriodLabel('');
      setPeriodStartDate('');
      setPeriodEndDate('');
    }
  };

  const handleSavePayment = async () => {
    try {
      await ctxCreatePayment({
        student_id: '',
        amount: formData.amount,
        due_date: formData.dueDate,
        method: formData.method,
        payment_category: 'TUITION',
        period_start_date: periodStartDate || undefined,
        period_end_date: periodEndDate || undefined,
        notes: '',
      });
    } catch (err: any) {
      setErrorState(err.message);
    }
    resetPaymentForm();
    setIsModalOpen(false);
  };

  const handleEditPayment = async () => {
    if (!selectedPayment) return;
    try {
      await ctxUpdatePayment(selectedPayment.id, {
        method: editFormData.method,
        due_date: editFormData.dueDate,
        amount: editFormData.amount,
      });
    } catch (err: any) {
      setErrorState(err.message);
    }
    setIsEditModalOpen(false);
    setSelectedPayment(null);
  };

  const handleMarkAsPaid = async () => {
    if (!selectedPayment) return;
    try {
      await ctxMarkAsPaid(selectedPayment.id, markPaidData.paymentDate, markPaidData.method);
    } catch (err: any) {
      setErrorState(err.message);
    }
    setIsMarkPaidModalOpen(false);
  };

  const handleConfirmArchive = async () => {
    try {
      if (archiveTarget === 'batch') {
        for (const pid of selectedPaymentIds) {
          await ctxArchivePayment(pid);
        }
        clearSelection();
      } else if (archiveTarget !== null) {
        await ctxArchivePayment(archiveTarget);
      }
    } catch (err: any) {
      setErrorState(err.message);
    }
    setIsConfirmModalOpen(false);
    setArchiveTarget(null);
  };

  const handleBatchArchive = () => {
    setArchiveTarget('batch');
    setIsConfirmModalOpen(true);
  };

  const handleDeletePayment = async () => {
    try {
      if (deleteTarget === 'all') {
        const archived = payments.filter(p => p.status === 'ARCHIVED');
        for (const p of archived) {
          await ctxDeletePayment(p.id);
        }
      } else if (deleteTarget !== null) {
        await ctxDeletePayment(deleteTarget);
      }
    } catch (err: any) {
      setErrorState(err.message);
    }
    setIsDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleDownloadReceipt = (payment: any) => {
    downloadPDF(
      <BulkPaymentReceiptsPDF payments={[payment]} />,
      `recu-${payment.student.toLowerCase().replace(/\s+/g, '-')}-${payment.id}.pdf`
    );
  };

  const selectedPaymentsData = payments.filter(p => selectedPaymentIds.includes(p.id));
  const totalSelectedAmount = selectedPaymentsData.reduce((sum, p) => sum + p.amount, 0);

  const paymentBatches = [];
  for (let i = 0; i < selectedPaymentsData.length; i += 5) {
    paymentBatches.push(selectedPaymentsData.slice(i, i + 5));
  }

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.student.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      (activeFilter === 'Tous') ||
      (activeFilter === 'Payés' && p.status === 'PAID') ||
      (activeFilter === 'En attente' && p.status === 'PENDING') ||
      (activeFilter === 'En retard' && p.status === 'OVERDUE') ||
      (activeFilter === 'Archivés' && p.status === 'ARCHIVED');
    const matchesMonth = !selectedMonth || (p.dueDate && getPaymentMonthInfo(p.dueDate).key === selectedMonth);
    return matchesSearch && matchesFilter && matchesMonth;
  });

  const statusOrder: Record<string, number> = { OVERDUE: 0, PENDING: 1, PAID: 2 };
  const activePayments = filteredPayments
    .filter(p => p.status !== 'ARCHIVED')
    .sort((a, b) => (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99));
  const displayedPayments = activePayments.slice(0, visibleCount);
  const hasMore = activePayments.length > visibleCount;

  useEffect(() => {
    setVisibleCount(10);
  }, [searchTerm, activeFilter, selectedMonth]);

  const columns: Column<any>[] = [
    { header: 'Étudiant', key: 'student' },
    {
      header: 'Montant (MAD)',
      key: 'amount',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.amount} MAD</span>
    },
    { header: 'Échéance', key: 'dueDate' },
    {
      header: 'Paiement',
      key: 'paymentDate',
      render: (row) => row.paymentDate || '---'
    },
    {
      header: 'Statut',
      key: 'status',
      render: (row) => (
        <div
          onClick={(e) => {
            if (row.status !== 'PAID') {
              e.stopPropagation();
              setSelectedPayment(row);
              setMarkPaidData({
                paymentDate: new Date().toISOString().split('T')[0],
                method: row.method || 'Espèces'
              });
              setIsMarkPaidModalOpen(true);
            }
          }}
          style={{ cursor: row.status !== 'PAID' ? 'pointer' : 'default' }}
        >
          <StatusBadge status={row.status} />
        </div>
      )
    },
    {
      header: 'Documents',
      key: 'documents',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {row.status === 'PAID' ? (
            <button
              onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(row); }}
              title="Exporter le reçu"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                color: 'white',
                backgroundColor: 'var(--color-primary)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
            >
              <Download size={14} /> Exporter
            </button>
          ) : (
            <span style={{ color: 'var(--color-gray)', fontSize: '11px', fontStyle: 'italic' }}>Aucun</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPayment(row);
                setEditFormData({
                  student: row.student,
                  amount: row.amount,
                  dueDate: row.dueDate,
                  method: row.method,
                });
                setIsEditModalOpen(true);
              }}
              title="Modifier"
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (row.status === 'ARCHIVED') {
                  ctxUpdatePayment(row.id, { status: 'PENDING' });
                } else {
                  setArchiveTarget(row.id);
                  setIsConfirmModalOpen(true);
                }
              }}
              title={row.status === 'ARCHIVED' ? "Restaurer" : "Archiver"}
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray)', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <Archive size={16} />
            </button>
          </div>

          {row.status === 'OVERDUE' && (
            <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '8px' }}>
              <WhatsAppButton
                phone={row.phone}
                studentName={row.student}
                amount={row.amount}
                dueDate={row.dueDate}
              />
            </div>
          )}
        </div>
      )
    }
  ];

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const now = new Date();
  const currentMonthLabel = monthNames[now.getMonth()];
  const totalCollected = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingPayments = payments.filter(p => p.status === 'PENDING').length;
  const overdueCount = payments.filter(p => p.status === 'PENDING' && (p.daysLate || 0) > 0).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Metrics Section */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <MetricCard label={`Total encaissé (${currentMonthLabel})`} value={totalCollected.toLocaleString()} color="success" solid />
          <MetricCard label="Étudiants à jour" value={String(payments.filter(p => p.status === 'PAID').length)} color="default" />
          <MetricCard label="Paiements en attente" value={String(pendingPayments)} color="warning" />
          <MetricCard label="Paiements en retard" value={String(overdueCount)} color="danger" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
                {filteredPayments.length} paiements enregistrés
              </p>
            </div>
            <PrimaryButton
              label="Enregistrer un paiement"
              icon={<Plus size={18} />}
              onClick={handleOpenPaymentModal}
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
            height: '68px',
            boxSizing: 'border-box'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
              <SearchInput
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {selectedPaymentIds.length > 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '8px 24px',
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(5, 150, 105, 0.2)',
                  animation: 'slideInRight 0.3s ease-out',
                  minWidth: '420px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                    {selectedPaymentIds.length} sélectionné(s)
                  </span>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={() => setShowReceiptModal(true)}
                      title="Exporter les reçus"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#047857'; }}
                      onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; }}
                    >
                      <Download size={16} /> Exporter
                    </button>

                    <button
                      onClick={handleBatchArchive}
                      title="Archiver"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'white',
                        color: 'var(--color-text)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                    >
                      <Archive size={16} /> Archiver
                    </button>
                  </div>

                  <button
                    onClick={clearSelection}
                    style={{
                      fontSize: '12px',
                      color: 'var(--color-gray)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      whiteSpace: 'nowrap',
                      marginLeft: 'auto',
                      fontWeight: 500
                    }}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                ['Tous', 'Payés', 'En attente', 'En retard', 'Archivés'].map(f => (
                  <FilterChip
                    key={f}
                    label={f}
                    active={activeFilter === f}
                    onClick={() => setActiveFilter(f)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Month Filter Cards */}
          {monthOptions.length > 0 && (
          <section style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
            <div
              onClick={() => setSelectedMonth(null)}
              style={{
                padding: '14px 20px',
                borderRadius: '12px',
                border: selectedMonth === null ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                backgroundColor: selectedMonth === null ? 'rgba(5, 150, 105, 0.08)' : 'var(--color-white)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                fontSize: '13px',
                color: selectedMonth === null ? 'var(--color-primary)' : 'var(--color-gray)',
                transition: 'all 0.2s',
                userSelect: 'none',
                width: '100px',
                minHeight: '80px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (selectedMonth !== null) { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; } }}
              onMouseLeave={(e) => { if (selectedMonth !== null) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-gray)'; } }}
            >
              <List size={20} />
              <span style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1 }}>Tous</span>
            </div>

            <div
              style={{ position: 'relative', flex: 1, minWidth: 0, overflow: 'hidden' }}
              onMouseEnter={showMonthNav}
              onMouseLeave={clearMonthNavHover}
            >
              <button
                type="button"
                aria-label="Mois plus récents"
                onClick={() => scrollMonths('left')}
                style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10, width: '38px', height: '38px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.96)',
                  color: 'var(--color-text)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  opacity: hoverLeft ? 1 : 0, pointerEvents: 'auto',
                  transition: 'opacity 0.25s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={() => setHoverLeft(true)}
                onMouseLeave={clearMonthNavHover}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="Mois précédents"
                onClick={() => scrollMonths('right')}
                style={{
                  position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                  zIndex: 10, width: '38px', height: '38px', borderRadius: '50%',
                  border: '1px solid var(--color-border)', backgroundColor: 'rgba(255,255,255,0.96)',
                  color: 'var(--color-text)', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  opacity: hoverRight ? 1 : 0, pointerEvents: 'auto',
                  transition: 'opacity 0.25s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={() => setHoverRight(true)}
                onMouseLeave={clearMonthNavHover}
              >
                <ChevronRight size={18} />
              </button>
              <div
                ref={scrollRef}
                className="month-scroll-container"
                style={{
                  display: 'flex', gap: `${MONTH_GAP}px`, alignItems: 'center', justifyContent: 'center',
                  overflowX: 'auto', overflowY: 'hidden', scrollBehavior: 'smooth',
                  padding: '4px 0',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {monthOptions.slice(0, 6).map((m, idx, arr) => {
                  const monthPayments = payments.filter(p => p.dueDate && getPaymentMonthInfo(p.dueDate).key === m.key);
                  const totalRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                  const statusCircles: { color: string }[] = [];
                  const overdueCount = monthPayments.filter(p => p.status === 'OVERDUE').length;
                  const pendingCount = monthPayments.filter(p => p.status === 'PENDING').length;
                  if (overdueCount > 0) statusCircles.push({ color: 'rgba(239, 68, 68, 0.75)' });
                  if (pendingCount > 0) statusCircles.push({ color: 'rgba(234, 179, 8, 0.75)' });
                  const circlesToShow = statusCircles.slice(0, 2);
                  const isFirst = idx === 0;
                  const isLast = idx === arr.length - 1;
                  return (
                    <div
                      key={m.key}
                      ref={(el) => { monthCardRefs.current[m.key] = el; }}
                      onClick={() => setSelectedMonth(selectedMonth === m.key ? null : m.key)}
                      onMouseEnter={(e) => {
                        if (isFirst) setHoverLeft(true);
                        if (isLast) setHoverRight(true);
                        if (selectedMonth !== m.key) {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.color = 'var(--color-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isFirst) setHoverLeft(false);
                        if (isLast) setHoverRight(false);
                        if (selectedMonth !== m.key) {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.color = 'var(--color-text)';
                        }
                      }}
                      style={{
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: selectedMonth === m.key ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: selectedMonth === m.key ? 'rgba(5, 150, 105, 0.08)' : 'var(--color-white)',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        fontWeight: 600,
                        fontSize: '13px',
                        color: selectedMonth === m.key ? 'var(--color-primary)' : 'var(--color-text)',
                        transition: 'all 0.2s',
                        userSelect: 'none',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        position: 'relative',
                        flexShrink: 0,
                        minHeight: '80px',
                        width: `${MONTH_CARD_WIDTH}px`,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{m.label}</span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-gray)' }}>
                        {totalRevenue.toLocaleString()} MAD
                      </span>
                      {circlesToShow.length > 0 && (
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          right: '8px',
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          {circlesToShow.map((c, ci) => (
                            <div
                              key={ci}
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: c.color,
                                flexShrink: 0,
                                marginLeft: ci > 0 ? '-3px' : '0',
                                border: '1px solid var(--color-white)',
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              ref={monthPickerRef}
              style={{
                flexShrink: 0,
                width: '100px',
                minHeight: '80px',
                position: 'relative',
              }}
            >
              <button
                onClick={() => {
                  setShowMonthPicker(p => !p);
                  if (!showMonthPicker) {
                    if (selectedMonth) setPickerYear(parseInt(selectedMonth.split('-')[0]));
                    else if (availableYears.length > 0) setPickerYear(availableYears[0]);
                  }
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '80px',
                  borderRadius: '12px',
                  border: showMonthPicker ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: showMonthPicker ? 'rgba(5, 150, 105, 0.08)' : 'var(--color-white)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  color: showMonthPicker ? 'var(--color-primary)' : 'var(--color-gray)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { if (!showMonthPicker) { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; } }}
                onMouseLeave={(e) => { if (!showMonthPicker) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-gray)'; } }}
              >
                <Calendar size={20} />
                <span style={{ fontSize: '11px', fontWeight: 600, lineHeight: 1 }}>Calendrier</span>
              </button>
              {showMonthPicker && (
                <div
                  onClick={() => setShowMonthPicker(false)}
                  style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                  }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      backgroundColor: 'var(--color-white)',
                      borderRadius: '16px',
                      boxShadow: '0 12px 48px rgba(0,0,0,0.2)',
                      padding: '28px',
                      minWidth: '580px',
                      position: 'relative',
                    }}
                  >
                    <button
                      onClick={() => setShowMonthPicker(false)}
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--color-gray)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-gray)'; }}
                    >
                      <X size={18} />
                    </button>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '20px',
                      marginBottom: '28px',
                      marginTop: '4px',
                    }}>
                      <button
                        onClick={() => {
                          const idx = availableYears.indexOf(pickerYear);
                          if (idx < availableYears.length - 1) setPickerYear(availableYears[idx + 1]);
                        }}
                        disabled={availableYears.indexOf(pickerYear) >= availableYears.length - 1}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          cursor: availableYears.indexOf(pickerYear) >= availableYears.length - 1 ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          color: availableYears.indexOf(pickerYear) >= availableYears.length - 1 ? 'var(--color-gray)' : 'var(--color-text)',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 600,
                          opacity: availableYears.indexOf(pickerYear) >= availableYears.length - 1 ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          const disabled = availableYears.indexOf(pickerYear) >= availableYears.length - 1;
                          if (!disabled) { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }
                        }}
                        onMouseLeave={(e) => {
                          const disabled = availableYears.indexOf(pickerYear) >= availableYears.length - 1;
                          if (!disabled) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }
                        }}
                      >
                        &lt;
                      </button>
                      <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '0.5px' }}>
                        {pickerYear}
                      </span>
                      <button
                        onClick={() => {
                          const idx = availableYears.indexOf(pickerYear);
                          if (idx > 0) setPickerYear(availableYears[idx - 1]);
                        }}
                        disabled={availableYears.indexOf(pickerYear) <= 0}
                        style={{
                          background: 'none',
                          border: '1px solid var(--color-border)',
                          borderRadius: '10px',
                          padding: '8px 14px',
                          cursor: availableYears.indexOf(pickerYear) <= 0 ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          color: availableYears.indexOf(pickerYear) <= 0 ? 'var(--color-gray)' : 'var(--color-text)',
                          display: 'flex',
                          alignItems: 'center',
                          fontWeight: 600,
                          opacity: availableYears.indexOf(pickerYear) <= 0 ? 0.4 : 1,
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          const disabled = availableYears.indexOf(pickerYear) <= 0;
                          if (!disabled) { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }
                        }}
                        onMouseLeave={(e) => {
                          const disabled = availableYears.indexOf(pickerYear) <= 0;
                          if (!disabled) { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }
                        }}
                      >
                        &gt;
                      </button>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '14px',
                    }}>
                      {monthsFR.map((monthName, idx) => {
                        const key = `${pickerYear}-${String(idx + 1).padStart(2, '0')}`;
                        const now = new Date();
                        const isFuture = pickerYear > now.getFullYear() ||
                          (pickerYear === now.getFullYear() && idx > now.getMonth());
                        const monthPayments = payments.filter(p => p.dueDate && getPaymentMonthInfo(p.dueDate).key === key);
                        const hasPayments = monthPayments.length > 0;
                        const totalRevenue = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                        const statusCircles: { color: string; label: string }[] = [];
                        const overdueCount = monthPayments.filter(p => p.status === 'OVERDUE').length;
                        const pendingCount = monthPayments.filter(p => p.status === 'PENDING').length;
                        if (overdueCount > 0) statusCircles.push({ color: 'rgba(239, 68, 68, 0.75)', label: `${overdueCount} en retard` });
                        if (pendingCount > 0) statusCircles.push({ color: 'rgba(234, 179, 8, 0.75)', label: `${pendingCount} en attente` });
                        const circlesToShow = statusCircles.slice(0, 2);
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              if (isFuture || !hasPayments) return;
                              setSelectedMonth(key);
                              setShowMonthPicker(false);
                            }}
                            style={{
                              padding: '20px 12px 16px',
                              borderRadius: '14px',
                              cursor: (!hasPayments || isFuture) ? 'not-allowed' : 'pointer',
                              fontSize: '14px',
                              fontWeight: selectedMonth === key ? 700 : 600,
                              color: !hasPayments
                                ? 'var(--color-gray)'
                                : isFuture
                                  ? 'var(--color-gray)'
                                  : selectedMonth === key
                                    ? 'var(--color-primary)'
                                    : 'var(--color-text)',
                              backgroundColor: selectedMonth === key
                                ? 'rgba(5, 150, 105, 0.1)'
                                : 'var(--color-white)',
                              textAlign: 'center',
                              border: selectedMonth === key
                                ? '1.5px solid var(--color-primary)'
                                : '1.5px solid var(--color-border)',
                              boxShadow: selectedMonth === key
                                ? '0 2px 8px rgba(5, 150, 105, 0.15)'
                                : hasPayments && !isFuture
                                  ? '0 1px 3px rgba(0,0,0,0.06)'
                                  : 'none',
                              opacity: (!hasPayments || isFuture) ? 0.3 : 1,
                              transition: 'all 0.2s',
                              userSelect: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              position: 'relative',
                              minHeight: '100px',
                            }}
                            onMouseEnter={(e) => {
                              if (!hasPayments || isFuture) return;
                              e.currentTarget.style.backgroundColor = 'rgba(5, 150, 105, 0.06)';
                              e.currentTarget.style.borderColor = 'var(--color-primary)';
                              e.currentTarget.style.boxShadow = '0 2px 8px rgba(5, 150, 105, 0.12)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              if (!hasPayments || isFuture) return;
                              const isSelected = selectedMonth === key;
                              e.currentTarget.style.backgroundColor = isSelected ? 'rgba(5, 150, 105, 0.1)' : 'var(--color-white)';
                              e.currentTarget.style.borderColor = isSelected ? 'var(--color-primary)' : 'var(--color-border)';
                              e.currentTarget.style.boxShadow = isSelected
                                ? '0 2px 8px rgba(5, 150, 105, 0.15)'
                                : '0 1px 3px rgba(0,0,0,0.06)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            <span style={{ fontWeight: 700, fontSize: '15px' }}>{monthName}</span>
                            {hasPayments && (
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray)' }}>
                                {totalRevenue.toLocaleString()} MAD
                              </span>
                            )}
                            {circlesToShow.length > 0 && (
                              <div style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '10px',
                                display: 'flex',
                                alignItems: 'center',
                              }}>
                                {circlesToShow.map((c, ci) => (
                                  <div
                                    key={ci}
                                    title={c.label}
                                    style={{
                                      width: '9px',
                                      height: '9px',
                                      borderRadius: '50%',
                                      backgroundColor: c.color,
                                      flexShrink: 0,
                                      marginLeft: ci > 0 ? '-3px' : '0',
                                      border: '1.5px solid var(--color-white)',
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
          )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
            <DataTable
              columns={columns}
              data={displayedPayments}
              selectable
              selectedIds={selectedPaymentIds}
              onSelectionChange={(ids) => setSelectedPaymentIds(ids as number[])}
            />

            {hasMore && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-8px' }}>
                <button
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  style={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'white',
                    color: 'var(--color-primary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = 'var(--color-border)'; }}
                >
                  <Plus size={18} /> Afficher plus
                </button>
              </div>
            )}

            {/* Archives Section */}
            {payments.filter(p => p.status === 'ARCHIVED').length > 0 && (
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
                      {payments.filter(p => p.status === 'ARCHIVED').length}
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

                <DataTable
                  columns={columns.map(col => col.key === 'actions' ? ({
                    ...col,
                    render: (row: any) => (
                      <div style={{ display: 'flex', gap: '16px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); ctxUpdatePayment(row.id, { status: 'PENDING' }); }}
                          style={{
                            padding: '6px 14px',
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
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(row.id); setIsDeleteModalOpen(true); }}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '8px',
                            border: '1px solid var(--color-danger)',
                            backgroundColor: 'transparent',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: 'var(--color-danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger)'; e.currentTarget.style.color = 'white'; }}
                          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-danger)'; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  } as Column<any>) : col)}
                  data={payments.filter(p => p.status === 'ARCHIVED' && p.student.toLowerCase().includes(searchTerm.toLowerCase()))}
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
        </div>
      </div>

      {/* Recap Modal for Selection */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        title="Exporter Documents"
        width="800px"
        className="receipt-modal"
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
            <PrimaryButton
              label="Télécharger PDF"
              icon={<Download size={18} />}
              onClick={() => {
                downloadPDF(
                  <BulkPaymentReceiptsPDF payments={selectedPaymentsData} />,
                  'reçus-paiements.pdf'
                );
                setShowReceiptModal(false);
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
        <div style={{ marginBottom: '16px' }} className="no-print">
          <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            documents de paiements ({selectedPaymentsData.length})
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
          {paymentBatches.map((batch, batchIndex) => (
            <div
              key={batchIndex}
              className={`receipt-page ${batchIndex < paymentBatches.length - 1 ? 'print-page-break' : ''}`}
              style={{
                backgroundColor: 'white',
                width: '100%',
                maxWidth: '600px',
                margin: '0 auto 24px auto',
                padding: '40px',
                borderRadius: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minHeight: '842px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '24px', fontWeight: 800 }}>EDUCENTER</h2>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: 800 }}>
                    ÉTAT DE PAIEMENTS
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-gray)' }}>Page {batchIndex + 1} / {paymentBatches.length}</p>
                  <p style={{ marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>Date: {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-gray)', margin: '0 0 8px 0' }}>Bénéficiaire</h4>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '16px' }}>
                  {[...new Set(batch.map(p => p.student))].length === 1
                    ? batch[0].student
                    : "Regroupement de Paiements"}
                </p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Description / Étudiant</th>
                    <th style={{ textAlign: 'center', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Échéance</th>
                    <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {batch.map(payment => (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '14px 8px', fontSize: '13px' }}>
                        <div style={{ fontWeight: 600 }}>{payment.student}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                          Mensualité {new Date(payment.dueDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', padding: '14px 8px', fontSize: '13px' }}>
                        {payment.dueDate}
                      </td>
                      <td style={{ textAlign: 'right', padding: '14px 8px', fontSize: '13px', fontWeight: 600 }}>
                        {payment.amount}.00 MAD
                      </td>
                    </tr>
                  ))}

                  {batchIndex === paymentBatches.length - 1 && (
                    <tr>
                      <td colSpan={2} style={{ padding: '24px 8px 16px', fontSize: '16px', fontWeight: 800, color: 'var(--color-text)' }}>
                        TOTAL GÉNÉRAL
                      </td>
                      <td style={{ textAlign: 'right', padding: '24px 8px 16px', fontSize: '18px', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {totalSelectedAmount}.00 MAD
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-gray)', margin: '0 0 4px 0' }}>Établissement</h4>
                  <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5' }}>
                    EduCenter ERP<br />
                    Gestion Scolaire
                  </p>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-gray)', margin: '0 0 4px 0' }}>Signature & Cachet</h4>
                  <div style={{ height: '60px' }}></div>
                </div>
              </div>
            </div>
          ))}

          {selectedPaymentsData.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-gray)', backgroundColor: 'white', borderRadius: '8px' }}>
              Aucun paiement sélectionné
            </div>
          )}
        </div>
      </Modal>

      {/* Add Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={requestCloseAddPaymentModal}
        title="Enregistrer un nouveau paiement"
        footer={
          <>
            <button
              onClick={requestCloseAddPaymentModal}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <PrimaryButton label="Enregistrer" onClick={handleSavePayment} />
          </>
        }
      >
        <FormInput
          label="Étudiant"
          type="select"
          value={formData.student}
          onChange={(e) => handleStudentChange(e.target.value)}
          placeholder="Sélectionner un étudiant"
          options={allStudents.map(s => ({ label: s.full_name || s.name, value: s.full_name || s.name }))}
          required
        />
        {periodLabel && (
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--color-primary-light)', borderRadius: '10px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary)' }}>
                Période {periodLabel}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-primary)', opacity: 0.8 }}>
                Du {periodStartDate} au {periodEndDate}
              </span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-primary)', backgroundColor: 'white', padding: '4px 10px', borderRadius: '6px' }}>
              Toléré: {toleranceDays} jours
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '16px' }}>
          <FormInput
            label="Montant (MAD)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            min={0}
            required
            className="flex-1"
          />
          <FormInput
            label="Date d'échéance"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            className="flex-1"
          />
        </div>
        <FormInput
          label="Méthode de paiement prévue"
          type="select"
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          options={PAYMENT_METHOD_OPTIONS}
        />
      </Modal>

      {/* Edit Payment Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Modifier le paiement"
        footer={
          <>
            <button
              onClick={() => setIsEditModalOpen(false)}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <PrimaryButton label="Enregistrer" onClick={handleEditPayment} />
          </>
        }
      >
        <FormInput
          label="Étudiant"
          type="select"
          value={editFormData.student}
          onChange={(e) => setEditFormData({ ...editFormData, student: e.target.value })}
          options={allStudents.map(s => ({ label: s.full_name || s.name, value: s.full_name || s.name }))}
          required
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <FormInput
            label="Montant (MAD)"
            type="number"
            value={editFormData.amount}
            onChange={(e) => setEditFormData({ ...editFormData, amount: parseInt(e.target.value) || 0 })}
            min={0}
            required
            className="flex-1"
          />
          <FormInput
            label="Date d'échéance"
            type="date"
            value={editFormData.dueDate}
            onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
            required
            className="flex-1"
          />
        </div>
        <FormInput
          label="Méthode de paiement prévue"
          type="select"
          value={editFormData.method}
          onChange={(e) => setEditFormData({ ...editFormData, method: e.target.value })}
          options={PAYMENT_METHOD_OPTIONS}
        />
      </Modal>

      {/* Mark as Paid Modal */}
      <Modal
        isOpen={isMarkPaidModalOpen}
        onClose={() => setIsMarkPaidModalOpen(false)}
        title="Confirmer le paiement"
        footer={
          <>
            <button
              onClick={() => setIsMarkPaidModalOpen(false)}
              style={{ padding: '10px 20px', backgroundColor: 'transparent', border: 'none', color: 'var(--color-gray)', cursor: 'pointer' }}
            >
              Annuler
            </button>
            <PrimaryButton label="Confirmer le paiement" onClick={handleMarkAsPaid} />
          </>
        }
      >
        {selectedPayment && (
          <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: 'var(--color-primary-light)', borderRadius: '8px' }}>
            <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-primary)' }}>
              Étudiant: {selectedPayment.student}
            </p>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary)' }}>
              Montant à régler: {selectedPayment.amount} MAD
            </p>
          </div>
        )}
        <FormInput
          label="Date de paiement"
          type="date"
          value={markPaidData.paymentDate}
          onChange={(e) => setMarkPaidData({ ...markPaidData, paymentDate: e.target.value })}
          required
        />
        <FormInput
          label="Méthode de paiement"
          type="select"
          value={markPaidData.method}
          onChange={(e) => setMarkPaidData({ ...markPaidData, method: e.target.value })}
          options={PAYMENT_METHOD_OPTIONS}
          required
        />
      </Modal>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={isDiscardChangesModalOpen}
        onKeepEditing={() => setIsDiscardChangesModalOpen(false)}
        onDiscard={closePaymentModal}
      />

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
              ? `Êtes-vous sûr de vouloir archiver ces ${selectedPaymentIds.length} paiements ?`
              : "Êtes-vous sûr de vouloir archiver ce paiement ?"}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Ils seront déplacés vers la section des archives.
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
              onClick={handleDeletePayment}
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
              ? 'Êtes-vous sûr de vouloir supprimer définitivement tous les paiements archivés ?'
              : 'Êtes-vous sûr de vouloir supprimer définitivement ce paiement ?'}
          </p>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginTop: '8px' }}>
            Cette action est irréversible.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default FinanceManager;
