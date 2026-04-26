import React, { useState } from 'react';
import { User, Edit2, Trash2, Printer, Archive, CheckSquare, Square, Download } from 'lucide-react';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import PrimaryButton from '../../components/common/PrimaryButton';
import { StudentExportPDF } from '../../components/finance/StudentExportPDF';
import { downloadPDF } from '../../utils/exporterUtils';

export type StudentStatus = 'ACTIVE' | 'ON_HOLD' | 'DROPPED' | 'PAID' | 'PENDING' | 'OVERDUE';

export interface Student {
  id: number;
  name: string;
  phone: string;
  class: string;
  enrollmentDate: string;
  status: string; // Keep as string to avoid strict assignment issues from initialData, but cast where needed
}

interface StudentsByClassProps {
  students: any[]; // Use any[] temporarily to resolve the assignment error from StudentsList.tsx
  onEdit: (student: any) => void;
  onArchive: (id: number | number[]) => void;
}

const StudentsByClass: React.FC<StudentsByClassProps> = ({ students, onEdit, onArchive }) => {
  const [exportModalConfig, setExportModalConfig] = useState<{ isOpen: boolean, students: any[], className: string } | null>(null);

  const handleExportClass = (className: string, classStudents: any[]) => {
    setExportModalConfig({
      isOpen: true,
      students: classStudents,
      className: className
    });
  };

  // Group students by class
  const groupedStudents = (students || []).reduce((acc, student) => {
    const className = student.class || 'Sans classe';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {} as Record<string, any[]>);

  const classes = Object.keys(groupedStudents).sort();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {classes.map((className) => {
        const classStudents = groupedStudents[className] || [];

        return (
          <div 
            key={className}
            style={{ 
              backgroundColor: 'var(--color-white)', 
              borderRadius: '12px', 
              border: '1px solid var(--color-border)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {/* Class Header */}
            <div style={{ 
              padding: '16px 24px', 
              backgroundColor: '#f9fafb', 
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '8px', 
                  backgroundColor: 'var(--color-primary-light)', 
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {className.charAt(0)}
                </div>
                <h3 style={{ fontWeight: 600, color: 'var(--color-text)' }}>{className}</h3>
                <span style={{ 
                  fontSize: 'var(--text-xs)', 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: '#e5e7eb',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontWeight: 500
                }}>
                  {classStudents.length} Étudiants
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleExportClass(className, classStudents)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', 
                    border: 'none', backgroundColor: '#065f46', 
                    color: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#065f46'}
                >
                  <Printer size={14} /> Exporter liste
                </button>
              </div>
            </div>

            {/* Student List */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(classStudents as any[]).map((student: any, index: number) => {
                return (
                  <div 
                    key={student.id}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '14px 24px',
                      borderBottom: index === classStudents.length - 1 ? 'none' : '1px solid #f3f4f6',
                      transition: 'background-color 0.2s',
                      fontSize: '14px'
                    }}
                  >
                    {/* Nom complet */}
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        backgroundColor: '#f3f4f6', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--color-gray)',
                        flexShrink: 0
                      }}>
                        <User size={16} />
                      </div>
                      <span style={{ fontWeight: 500, color: 'var(--color-text)' }}>{student.name}</span>
                    </div>

                {/* Téléphone */}
                <div style={{ flex: 1.5, color: 'var(--color-text-secondary)' }}>
                  {student.phone}
                </div>

                {/* Classe assignée */}
                <div style={{ flex: 1.5 }}>
                  <span style={{ 
                    padding: '4px 8px', 
                    backgroundColor: 'var(--color-primary-light)', 
                    color: 'var(--color-primary)',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {student.class}
                  </span>
                </div>

                {/* Date d'inscription */}
                <div style={{ flex: 1.5, color: 'var(--color-text-secondary)' }}>
                  {student.enrollmentDate}
                </div>

                {/* Statut */}
                <div style={{ flex: 1 }}>
                  <StatusBadge status={student.status} />
                </div>

                  {/* Actions */}
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(student); }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-primary)', padding: '4px' }}
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onArchive(student.id); }}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-gray)', padding: '4px' }}
                      title="Archiver"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    })}

    {/* Export Class Students Modal */}
    {exportModalConfig && (
      <Modal
        isOpen={exportModalConfig.isOpen}
        onClose={() => setExportModalConfig(null)}
        title="Exporter Documents"
        width="800px"
        footer={
          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end' }}>
            <PrimaryButton 
              label="Télécharger PDF" 
              icon={<Download size={18} />} 
              onClick={() => {
                downloadPDF(
                  <StudentExportPDF 
                    students={exportModalConfig.students} 
                    title={`Liste des étudiants - ${exportModalConfig.className}`}
                  />,
                  `liste-etudiants-${exportModalConfig.className.toLowerCase().replace(/\s+/g, '-')}.pdf`
                );
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
            Liste des étudiants ({exportModalConfig.students.length}) - {exportModalConfig.className}
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
                <p style={{ marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>Classe: {exportModalConfig.className}</p>
                <p style={{ marginTop: '4px', fontSize: '11px', fontWeight: 600 }}>Année Scolaire: 2025/2026</p>
              </div>
            </div>

            {/* Students Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase', width: '40px' }}>#</th>
                  <th style={{ textAlign: 'left', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Nom Complet</th>
                  <th style={{ textAlign: 'right', padding: '12px 8px', fontSize: '11px', color: 'var(--color-gray)', textTransform: 'uppercase' }}>Téléphone</th>
                </tr>
              </thead>
              <tbody>
                {exportModalConfig.students.map((student: any, index: number) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>{index + 1}</td>
                    <td style={{ padding: '12px 8px', fontSize: '12px', fontWeight: 600 }}>{student.name}</td>
                    <td style={{ textAlign: 'right', padding: '12px 8px', fontSize: '12px' }}>{student.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-gray)' }}>
                Document généré le {new Date().toLocaleDateString('fr-FR')}
              </div>
              <div style={{ fontSize: '10px', fontWeight: 600 }}>
                Administration EduCenter
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )}
  </div>
);
};

export default StudentsByClass;
