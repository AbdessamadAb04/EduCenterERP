import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet 
} from '@react-pdf/renderer';

// Re-using styles from PaymentReceipt.tsx for consistency
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    backgroundColor: '#fff',
  },
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
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
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

const formatCurrency = (val: number) => {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " MAD";
};

export interface BulkReceiptsProps {
  payments: any[];
}

export const BulkPaymentReceiptsPDF: React.FC<BulkReceiptsProps> = ({ payments }) => (
  <Document>
    {payments.map((payment, index) => (
      <Page key={payment.id || index} size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.centerName}>Centre Casablanca</Text>
            <Text style={styles.centerDetail}>23 Rue Ibn Batouta, Maarif, Casablanca</Text>
            <Text style={styles.centerDetail}>0522 48 XX XX</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptTitle}>REÇU DE PAIEMENT</Text>
            <Text style={styles.receiptNumber}>REC-2026-{String(payment.id).padStart(4, '0')}</Text>
            <Text style={styles.receiptDate}>{payment.paymentDate || new Date().toLocaleDateString('fr-FR')}</Text>
          </View>
        </View>

        {/* Student section */}
        <Text style={styles.sectionTitle}>INFORMATIONS DE L'ÉTUDIANT</Text>
        <View style={styles.infoBox}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nom complet:</Text>
              <Text style={styles.infoValue}>{payment.student}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Téléphone:</Text>
              <Text style={styles.infoValue}>{payment.phone || 'N/A'}</Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Classe:</Text>
              <Text style={styles.infoValue}>{payment.class || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Payment details */}
        <Text style={styles.sectionTitle}>DÉTAILS DU PAIEMENT</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableRowAlternate]}>
            <Text style={styles.tableLabel}>Désignation</Text>
            <Text style={[styles.tableValue, styles.tableValueBold]}>Mensualité</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Montant</Text>
            <Text style={[styles.tableValue, styles.tableValueBold]}>{formatCurrency(payment.amount)}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowAlternate]}>
            <Text style={styles.tableLabel}>Date d'échéance</Text>
            <Text style={styles.tableValue}>{payment.dueDate}</Text>
          </View>
          <View style={[styles.tableRow, styles.tableRowLast]}>
            <Text style={styles.tableLabel}>Mode de paiement</Text>
            <Text style={styles.tableValue}>{payment.method || 'Espèces'}</Text>
          </View>
        </View>

        {/* Total Box */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>TOTAL PAYÉ</Text>
          <Text style={styles.totalAmountText}>{formatCurrency(payment.amount)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flex: 1 }}>
            <Text style={styles.footerLine}>Ce reçu a été généré par EduCenter v0.1</Text>
            <Text style={styles.footerLine}>Gardez ce document comme preuve de paiement.</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>Signature & Cachet du Centre</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    ))}
  </Document>
);
