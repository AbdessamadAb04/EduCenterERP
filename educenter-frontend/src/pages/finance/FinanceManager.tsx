import React, { useState } from 'react';
import { Plus, Download, Printer, Archive, Edit2 } from 'lucide-react';
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

// Dummy Data
const initialPayments = [
  { id: 1, student: 'Karim Idrissi', amount: 450, dueDate: '2026-03-26', paymentDate: '', method: 'Espèces', status: 'OVERDUE', daysLate: 5, phone: '0661234567' },
  { id: 2, student: 'Sara Benali', amount: 300, dueDate: '2026-03-19', paymentDate: '', method: 'CIH', status: 'OVERDUE', daysLate: 12, phone: '0667654321' },
  { id: 3, student: 'Nadia Ouali', amount: 600, dueDate: '2026-03-28', paymentDate: '2026-03-28', method: 'Virement', status: 'PAID', daysLate: 0, phone: '0660123456' },
  { id: 4, student: 'Youssef Ait Brahim', amount: 450, dueDate: '2026-04-05', paymentDate: '', method: 'Espèces', status: 'PENDING', daysLate: 0, phone: '0661112233' },
  { id: 5, student: 'Imane Filali', amount: 300, dueDate: '2026-03-15', paymentDate: '2026-03-12', method: 'Attijari', status: 'PAID', daysLate: 0, phone: '0664445566' },
  { id: 6, student: 'Ahmed Mansouri', amount: 450, dueDate: '2026-01-15', paymentDate: '2026-01-14', method: 'Espèces', status: 'ARCHIVED', daysLate: 0, phone: '0661122334' },
  { id: 7, student: 'Salma El Fassi', amount: 600, dueDate: '2025-12-20', paymentDate: '2025-12-20', method: 'Virement', status: 'ARCHIVED', daysLate: 0, phone: '0665566778' },
  { id: 8, student: 'Omar Bennani', amount: 300, dueDate: '2025-11-10', paymentDate: '2025-11-12', method: 'CIH', status: 'ARCHIVED', daysLate: 2, phone: '0669988776' },
];

const FinanceManager: React.FC = () => {
  const [payments, setPayments] = useState(initialPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<number | 'batch' | null>(null);
  const { selectedPaymentIds, setSelectedPaymentIds, showReceiptModal, setShowReceiptModal, clearSelection } = usePaymentSelection();

  const [formData, setFormData] = useState({
    student: '',
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    method: 'Espèces',
  });

  const [markPaidData, setMarkPaidData] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    method: 'Espèces'
  });

  const handleSavePayment = () => {
    const newPayment = {
      id: Date.now(),
      ...formData,
      paymentDate: '',
      status: 'PENDING',
      daysLate: 0,
      phone: '0660000000' // Mock phone
    };
    setPayments([...payments, newPayment as any]);
    setIsModalOpen(false);
  };

  const handleMarkAsPaid = () => {
    setPayments(payments.map(p =>
      p.id === selectedPayment.id
        ? { ...p, status: 'PAID', paymentDate: markPaidData.paymentDate, method: markPaidData.method, daysLate: 0 }
        : p
    ));
    setIsMarkPaidModalOpen(false);
  };

  const handleDownloadReceipt = (payment: any) => {
    downloadPDF(
      <BulkPaymentReceiptsPDF payments={[payment]} />,
      `recu-${payment.student.toLowerCase().replace(/\s+/g, '-')}-${payment.id}.pdf`
    );
  };

  const selectedPaymentsData = payments.filter(p => selectedPaymentIds.includes(p.id));
  const totalSelectedAmount = selectedPaymentsData.reduce((sum, p) => sum + p.amount, 0);

  // Group payments into batches of 5 for pagination
  const paymentBatches = [];
  for (let i = 0; i < selectedPaymentsData.length; i += 5) {
    paymentBatches.push(selectedPaymentsData.slice(i, i + 5));
  }

  const handleOpenConfirmModal = (id: number | 'batch') => {
    setArchiveTarget(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmArchive = () => {
    if (archiveTarget === 'batch') {
      setPayments(payments.map(p => selectedPaymentIds.includes(p.id) ? { ...p, status: 'ARCHIVED' } : p));
      clearSelection();
    } else if (archiveTarget !== null) {
      setPayments(payments.map(p => p.id === archiveTarget ? { ...p, status: 'ARCHIVED' } : p));
    }
    setIsConfirmModalOpen(false);
    setArchiveTarget(null);
  };

  const handleBatchArchive = () => {
    handleOpenConfirmModal('batch');
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.student.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'Tous' ||
      (activeFilter === 'Payés' && p.status === 'PAID') ||
      (activeFilter === 'En attente' && p.status === 'PENDING') ||
      (activeFilter === 'En retard' && p.status === 'OVERDUE') ||
      (activeFilter === 'Archivés' && p.status === 'ARCHIVED');
    return matchesSearch && matchesFilter;
  });

  const columns: Column<any>[] = [
    { header: 'Étudiant', key: 'student' },
    { header: 'Montant (MAD)', key: 'amount', render: (row) => <span style={{ fontWeight: 600 }}>{row.amount} MAD</span> },
    { header: 'Échéance', key: 'dueDate' },
    { header: 'Paiement', key: 'paymentDate', render: (row) => row.paymentDate || '---' },
    {
      header: 'Statut',
      key: 'status',
      render: (row) => (
        <div
          onClick={(e) => {
            if (row.status !== 'PAID') {
              e.stopPropagation();
              setSelectedPayment(row);
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
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#047857'; // Darker green
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-primary)';
              }}
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
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }}
              title="Modifier"
              style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '4px', display: 'flex', alignItems: 'center' }}
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (row.status === 'ARCHIVED') {
                  setPayments(payments.map(p => p.id === row.id ? { ...p, status: 'PENDING' } : p));
                } else {
                  handleOpenConfirmModal(row.id);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {/* Metrics Section */}
        <div style={{ display: 'flex', gap: '24px' }}>
          <MetricCard label="Total encaissé (Mars)" value="15 600" color="success" />
          <MetricCard label="Étudiants à jour" value="124" color="default" />
          <MetricCard label="Paiements en attente" value="8" color="warning" />
          <MetricCard label="Paiements en retard" value="3" color="danger" />
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
              onClick={() => setIsModalOpen(true)}
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
                  gap: '20px', // Increased gap between sections
                  padding: '8px 24px', // More generous horizontal padding
                  backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(5, 150, 105, 0.2)',
                  animation: 'slideInRight 0.3s ease-out',
                  minWidth: '420px' // Significantly increased width
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
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#047857';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                      }}
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
                        padding: '8px 16px', // Larger buttons
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <DataTable
              columns={columns}
              data={filteredPayments.filter(p => p.status !== 'ARCHIVED')}
              selectable
              selectedIds={selectedPaymentIds}
              onSelectionChange={(ids) => setSelectedPaymentIds(ids as number[])}
            />

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
                  </div>
                </div>

                <DataTable
                  columns={columns.map(col => col.key === 'actions' ? ({
                    ...col,
                    render: (row: any) => (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPayments(payments.map(p => p.id === row.id ? { ...p, status: 'PENDING' } : p)); }}
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
        width="800px" // Wider for better visuality
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
              {/* Receipt Header */}
              <div style={{ borderBottom: '2px solid var(--color-primary)', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '24px', fontWeight: 800 }}>CENTRE CASABLANCA</h2>
                  <p style={{ margin: '4px 0', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Apprentissage & Excellence</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--color-text)', fontSize: '14px', fontWeight: 800 }}>
                    ÉTAT DE PAIEMENTS
                  </div>
                  <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--color-gray)' }}>Page {batchIndex + 1} / {paymentBatches.length}</p>
                  <p style={{ marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>Date: {new Date().toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {/* Recipient Info */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-gray)', margin: '0 0 8px 0' }}>Bénéficiaire</h4>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '16px' }}>
                  {[...new Set(batch.map(p => p.student))].length === 1
                    ? batch[0].student
                    : "Regroupement de Paiements"}
                </p>
              </div>

              {/* Table with max 5 rows */}
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

                  {/* Total on the last page only */}
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

              {/* Footer */}
              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-border)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-gray)', margin: '0 0 4px 0' }}>Centre Casablanca</h4>
                  <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5' }}>
                    Angle Bd Casablanca et Rue 15<br />
                    Casablanca, Maroc
                  </p>
                </div>
                <div style={{ flex: 1, textAlign: 'center' }}>
                  <h4 style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--color-gray)', margin: '0 0 4px 0' }}>Contact</h4>
                  <p style={{ margin: 0, fontSize: '11px', lineHeight: '1.5' }}>
                    Tél: +212 522 00 00 00<br />
                    Email: contact@casacentre.ma
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
        onClose={() => setIsModalOpen(false)}
        title="Enregistrer un nouveau paiement"
        footer={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
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
          onChange={(e) => setFormData({ ...formData, student: e.target.value })}
          placeholder="Sélectionner un étudiant"
          options={[
            { label: 'Karim Idrissi', value: 'Karim Idrissi' },
            { label: 'Sara Benali', value: 'Sara Benali' },
            { label: 'Nadia Ouali', value: 'Nadia Ouali' },
          ]}
          required
        />
        <div style={{ display: 'flex', gap: '16px' }}>
          <FormInput
            label="Montant (MAD)"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) })}
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
          options={[
            { label: 'Espèces', value: 'Espèces' },
            { label: 'CIH / BMCE', value: 'CIH' },
            { label: 'Virement', value: 'Virement' },
            { label: 'Autre', value: 'Autre' },
          ]}
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
          options={[
            { label: 'Espèces', value: 'Espèces' },
            { label: 'CIH / BMCE', value: 'CIH' },
            { label: 'Virement', value: 'Virement' },
            { label: 'Autre', value: 'Autre' },
          ]}
          required
        />
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
            ? `Êtes-vous sûr de vouloir archiver ces ${selectedPaymentIds.length} paiements ?`
            : "Êtes-vous sûr de vouloir archiver ce paiement ?"}
        </p>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
          Ils seront déplacés vers la section des archives.
        </p>
      </div>
    </Modal>
    </div>
  );
};

export default FinanceManager;


