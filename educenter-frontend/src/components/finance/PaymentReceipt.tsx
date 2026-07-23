import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  PDFViewer, 
  PDFDownloadLink 
} from '@react-pdf/renderer';

// --- INTERFACES ---
export interface PaymentReceiptProps {
  centerName?: string;
  centerAddress?: string;
  centerPhone?: string;
  centerEmail?: string;
  receiptNumber?: string;
  receiptDate?: string;
  studentName?: string;
  studentPhone?: string;
  className?: string;
  subject?: string;
  amount?: number;
  paymentMethod?: string;
  paymentDate?: string;
  dueDate?: string;
  periodLabel?: string;
  notes?: string;
}

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#fff',
  },
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a5c38',
    marginBottom: 4,
  },
  centerDetail: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 2,
  },
  headerRight: {
    textAlign: 'right',
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  receiptNumber: {
    fontSize: 12,
    color: '#1a5c38',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  receiptDate: {
    fontSize: 9,
    color: '#6b7280',
  },
  // Sections
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1a5c38',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  infoBox: {
    backgroundColor: '#f0f7f4',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 4,
    flexDirection: 'row',
  },
  infoLabel: {
    color: '#6b7280',
    width: 80,
  },
  infoValue: {
    fontWeight: 'bold',
  },
  // Table
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    padding: 10,
  },
  tableRowAlternate: {
    backgroundColor: '#f9f9f9',
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableLabel: {
    flex: 1,
    color: '#6b7280',
  },
  tableValue: {
    flex: 1,
    textAlign: 'right',
  },
  tableValueBold: {
    fontWeight: 'bold',
    color: '#111827',
  },
  // Total Box
  totalBox: {
    marginTop: 20,
    backgroundColor: '#1a5c38',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalAmountText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Notes
  notesBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#fffdf0',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 8,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#6b7280',
  },
  // Footer
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerTextContainer: {
    flex: 1,
  },
  footerLine: {
    fontSize: 8,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  signatureBox: {
    width: 150,
    textAlign: 'center',
  },
  signatureTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  }
});

// --- HELPER ---
const formatCurrency = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " MAD";
};

// --- PDF DOCUMENT ---
export const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  centerName = "EDUCENTER",
  centerAddress = "",
  centerPhone = "",
  centerEmail = "",
  receiptNumber = "",
  receiptDate = "",
  studentName = "",
  studentPhone = "",
  className = "",
  subject = "",
  amount = 0,
  paymentMethod = "",
  paymentDate = "",
  dueDate = "",
  periodLabel = "",
  notes = ""
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.centerName}>{centerName}</Text>
          <Text style={styles.centerDetail}>{centerAddress}</Text>
          <Text style={styles.centerDetail}>{centerPhone}</Text>
          {centerEmail && <Text style={styles.centerDetail}>{centerEmail}</Text>}
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.receiptTitle}>REÇU DE PAIEMENT</Text>
          <Text style={styles.receiptNumber}>{receiptNumber}</Text>
          <Text style={styles.receiptDate}>{receiptDate}</Text>
        </View>
      </View>

      {/* Student section */}
      <Text style={styles.sectionTitle}>INFORMATIONS DE L'ÉTUDIANT</Text>
      <View style={styles.infoBox}>
        <View style={styles.infoCol}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nom complet:</Text>
            <Text style={styles.infoValue}>{studentName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoValue}>{studentPhone}</Text>
          </View>
        </View>
        <View style={styles.infoCol}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Classe:</Text>
            <Text style={styles.infoValue}>{className}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Matière:</Text>
            <Text style={styles.infoValue}>{subject}</Text>
          </View>
        </View>
      </View>

      {/* Payment details */}
      <Text style={styles.sectionTitle}>DÉTAILS DU PAIEMENT</Text>
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableRowAlternate]}>
          <Text style={styles.tableLabel}>Désignation</Text>
          <Text style={[styles.tableValue, styles.tableValueBold]}>{periodLabel}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Montant</Text>
          <Text style={[styles.tableValue, styles.tableValueBold]}>{formatCurrency(amount)}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlternate]}>
          <Text style={styles.tableLabel}>Date d'échéance</Text>
          <Text style={styles.tableValue}>{dueDate}</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableLabel}>Date de paiement</Text>
          <Text style={styles.tableValue}>{paymentDate}</Text>
        </View>
        <View style={[styles.tableRow, styles.tableRowAlternate, styles.tableRowLast]}>
          <Text style={styles.tableLabel}>Mode de paiement</Text>
          <Text style={styles.tableValue}>{paymentMethod}</Text>
        </View>
      </View>

      {/* Total Box */}
      <View style={styles.totalBox}>
        <Text style={styles.totalLabel}>TOTAL PAYÉ</Text>
        <Text style={styles.totalAmountText}>{formatCurrency(amount)}</Text>
      </View>

      {/* Notes section */}
      {notes && notes.length > 0 && (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>REMARQUES</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTextContainer}>
          <Text style={styles.footerLine}>Ce reçu a été généré par EduCenter v0.1</Text>
          <Text style={styles.footerLine}>Gardez ce document comme preuve de paiement.</Text>
        </View>
        <View style={styles.signatureBox}>
          <Text style={styles.signatureTitle}>Signature & Cachet du Centre</Text>
          <View style={styles.signatureLine} />
        </View>
      </View>
    </Page>
  </Document>
);

// --- PREVIEW ---
export const PaymentReceiptPreview: React.FC<PaymentReceiptProps> = (props) => (
  <PDFViewer width="100%" height="600px" style={{ border: 'none' }}>
    <PaymentReceipt {...props} />
  </PDFViewer>
);

// --- DOWNLOAD BUTTON ---
export const DownloadReceiptButton: React.FC<{ props: PaymentReceiptProps; label?: string }> = ({ props, label = "Télécharger PDF" }) => (
  <PDFDownloadLink
    document={<PaymentReceipt {...props} />}
    fileName={`recu-${props.studentName || 'etudiant'}-${props.receiptNumber || '0000'}.pdf`}
    style={{
      textDecoration: 'none',
      padding: '10px 20px',
      color: '#fff',
      backgroundColor: '#1a5c38',
      borderRadius: '8px',
      fontWeight: 'bold',
      display: 'inline-flex',
      alignItems: 'center',
    }}
  >
    {({ loading }) => (loading ? 'Préparation...' : label)}
  </PDFDownloadLink>
);
