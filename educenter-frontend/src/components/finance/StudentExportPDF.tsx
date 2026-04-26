import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Font 
} from '@react-pdf/renderer';

// Register Helvetica Bold for better visuals
Font.register({
  family: 'Helvetica-Bold',
  src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica-bold@1.0.4/Helvetica-Bold.ttf'
});

export interface StudentExportProps {
  students: {
    id: number;
    name: string;
    phone: string;
    class: string;
    enrollmentDate: string;
    status: string;
  }[];
  title?: string;
  isAbsenceList?: boolean;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2pt solid #1a5c38',
    paddingBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    color: '#1a5c38',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  date: {
    fontSize: 9,
    color: '#666',
    textAlign: 'right',
  },
  table: {
    display: 'flex',
    width: 'auto',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
    height: 30,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#4b5563',
    padding: 5,
  },
  tableCell: {
    fontSize: 9,
    padding: 5,
  },
  colId: { width: '8%', textAlign: 'center' },
  colName: { width: '30%' },
  colPhone: { width: '15%' },
  colClass: { width: '20%' },
  colStatus: { width: '12%' },
  colAbsence: { width: '25%', textAlign: 'center' }, // For absence list
  absenceBox: {
    width: 15,
    height: 15,
    border: '1pt solid #9ca3af',
    marginHorizontal: 'auto',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '0.5pt solid #e5e7eb',
    paddingTop: 10,
  }
});

export const StudentExportPDF: React.FC<StudentExportProps> = ({ students, title = "Liste des Étudiants", isAbsenceList = false }) => {
  const currentDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>EduCenter ERP - Système de Gestion Scolaire</Text>
          </View>
          <Text style={styles.date}>Date: {currentDate}</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCellHeader, styles.colId]}>ID</Text>
            <Text style={[styles.tableCellHeader, styles.colName]}>Nom complet</Text>
            {isAbsenceList ? (
              <>
                <Text style={[styles.tableCellHeader, styles.colAbsence]}>Émargement (Présence)</Text>
                <Text style={[styles.tableCellHeader, styles.colAbsence]}>Observations</Text>
              </>
            ) : (
              <>
                <Text style={[styles.tableCellHeader, styles.colPhone]}>Téléphone</Text>
                <Text style={[styles.tableCellHeader, styles.colClass]}>Classe</Text>
                <Text style={[styles.tableCellHeader, styles.colStatus]}>Statut</Text>
              </>
            )}
          </View>

          {/* Table Body */}
          {students.map((student, index) => (
            <View key={student.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colId]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colName]}>{student.name}</Text>
              {isAbsenceList ? (
                <>
                  <View style={styles.colAbsence}>
                    <View style={styles.absenceBox} />
                  </View>
                  <Text style={[styles.tableCell, styles.colAbsence]}>-</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.tableCell, styles.colPhone]}>{student.phone}</Text>
                  <Text style={[styles.tableCell, styles.colClass]}>{student.class}</Text>
                  <Text style={[styles.tableCell, styles.colStatus]}>{student.status}</Text>
                </>
              )}
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Ce document a été généré automatiquement par EduCenter ERP.</Text>
        </View>
      </Page>
    </Document>
  );
};
