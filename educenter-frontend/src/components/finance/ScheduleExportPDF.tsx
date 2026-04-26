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

export interface ScheduleEvent {
  id: number;
  name: string;
  subject: string;
  teacher: string;
  day: number;
  startTime: string;
  endTime: string;
  color?: string;
}

export interface ScheduleExportProps {
  events: ScheduleEvent[];
  title?: string;
  academicYear?: string;
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
    borderBottom: '2pt solid #5c5c5c',
    paddingBottom: 10,
  },
  centerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  rightHeader: {
    textAlign: 'right',
  },
  moduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  academicYear: {
    fontSize: 10,
    color: '#666',
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  dayLabel: {
    width: 100,
    backgroundColor: '#f8fafc',
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontWeight: 'bold',
    fontSize: 11,
  },
  slotsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  slot: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    padding: 4,
    gap: 4,
  },
  eventBox: {
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#064e3b',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  eventName: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  eventTime: {
    fontSize: 7,
    color: '#064e3b',
    fontWeight: 'bold',
  },
  eventTeacher: {
    fontSize: 7,
    color: '#4b5563',
  },
  footer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  signatureArea: {
    width: 150,
    textAlign: 'center',
  },
  signatureTitle: {
    fontWeight: 'bold',
    fontSize: 10,
    marginBottom: 40,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  }
});

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export const ScheduleExportPDF: React.FC<ScheduleExportProps> = ({ 
  events, 
  title = "EMPLOI DU TEMPS",
  academicYear = "Année Scolaire: 2025/2026"
}) => {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.centerName}>EduSpace Casablanca</Text>
            <Text style={styles.subtitle}>Système de Gestion Scolaire</Text>
          </View>
          <View style={styles.rightHeader}>
            <Text style={styles.moduleTitle}>{title}</Text>
            <Text style={styles.academicYear}>{academicYear}</Text>
          </View>
        </View>

        {/* Schedule Grid */}
        <View style={styles.table}>
          {DAYS.map((day, dayIdx) => (
            <View key={day} style={styles.tableRow}>
              <View style={styles.dayLabel}>
                <Text style={styles.dayText}>{day}</Text>
              </View>
              <View style={styles.slotsContainer}>
                {[0, 1, 2, 3, 4].map((colIdx) => (
                  <View key={colIdx} style={[styles.slot, colIdx === 4 ? { borderRightWidth: 0 } : {}]}>
                    {events
                      .filter(e => e.day === dayIdx && (
                        (colIdx === 0 && e.startTime <= '10:00') || 
                        (colIdx === 1 && e.startTime > '10:00' && e.startTime <= '13:00') || 
                        (colIdx === 2 && e.startTime > '13:00' && e.startTime <= '16:00') || 
                        (colIdx === 3 && e.startTime > '16:00' && e.startTime <= '19:00') || 
                        (colIdx === 4 && e.startTime > '19:00')
                      ))
                      .map(event => (
                        <View key={event.id} style={[styles.eventBox, { backgroundColor: event.color || '#e0f2fe' }]}>
                          <Text style={styles.eventName}>{event.name}</Text>
                          <Text style={styles.eventTime}>{event.startTime} - {event.endTime}</Text>
                          <Text style={styles.eventTeacher}>{event.teacher}</Text>
                        </View>
                      ))
                    }
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Signature Area */}
        <View style={styles.footer}>
          <View style={styles.signatureArea}>
            <Text style={styles.signatureTitle}>Administration</Text>
            <View style={styles.signatureLine} />
          </View>
          <View style={styles.signatureArea}>
            <Text style={styles.signatureTitle}>Cachet de l'École</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>
      </Page>
    </Document>
  );
};
