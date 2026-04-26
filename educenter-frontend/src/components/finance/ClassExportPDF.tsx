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

export interface ClassExportProps {
  classes: {
    id: number;
    name: string;
    subject: string;
    level: string;
    schedule: string;
    teacher: string;
    capacity: string;
    status: string;
  }[];
  title?: string;
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
  colName: { width: '25%' },
  colSubject: { width: '15%' },
  colLevel: { width: '10%' },
  colSchedule: { width: '15%' },
  colTeacher: { width: '15%' },
  colCapacity: { width: '12%' },
});

export const ClassExportPDF: React.FC<ClassExportProps> = ({ classes, title = "Liste des Classes" }) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>EduCenter ERP - Système de Gestion Scolaire</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={styles.date}>Date d'exportation: {new Date().toLocaleDateString('fr-FR')}</Text>
            <Text style={styles.date}>Nombre total: {classes.length} classes</Text>
          </View>
        </View>

        {/* Table Section */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCellHeader, styles.colId]}>ID</Text>
            <Text style={[styles.tableCellHeader, styles.colName]}>Nom</Text>
            <Text style={[styles.tableCellHeader, styles.colSubject]}>Matière</Text>
            <Text style={[styles.tableCellHeader, styles.colLevel]}>Niveau</Text>
            <Text style={[styles.tableCellHeader, styles.colSchedule]}>Horaire</Text>
            <Text style={[styles.tableCellHeader, styles.colTeacher]}>Professeur</Text>
            <Text style={[styles.tableCellHeader, styles.colCapacity]}>Capacité</Text>
          </View>

          {/* Table Rows */}
          {classes.map((classe, index) => (
            <View key={classe.id || index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colId]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colName]}>{classe.name}</Text>
              <Text style={[styles.tableCell, styles.colSubject]}>{classe.subject}</Text>
              <Text style={[styles.tableCell, styles.colLevel]}>{classe.level}</Text>
              <Text style={[styles.tableCell, styles.colSchedule]}>{classe.schedule}</Text>
              <Text style={[styles.tableCell, styles.colTeacher]}>{classe.teacher}</Text>
              <Text style={[styles.tableCell, styles.colCapacity]}>{classe.capacity}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={{ position: 'absolute', bottom: 30, left: 30, right: 30, borderTop: '1pt solid #eee', paddingTop: 10 }}>
          <Text style={{ fontSize: 8, color: '#999', textAlign: 'center' }}>
            © {new Date().getFullYear()} EduCenter ERP. Tous droits réservés.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
