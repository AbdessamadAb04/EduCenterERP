import React from 'react';

export interface Column<T> {
  header: string;
  key: keyof T | string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  noBorderRadius?: boolean;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (ids: (string | number)[]) => void;
  rowStyle?: React.CSSProperties;
  hideHeader?: boolean;
  showCheckboxPlaceholder?: boolean;
}

const dtStyleId = "dt-empty-keyframes";
if (typeof document !== 'undefined' && !document.getElementById(dtStyleId)) {
  const s = document.createElement("style");
  s.id = dtStyleId;
  s.textContent = `@keyframes emptyFade { 0% { opacity: 0; } 100% { opacity: 1; } }`;
  document.head.appendChild(s);
}

const DataTable = <T extends { id?: string | number }>({ 
  columns, 
  data, 
  onRowClick, 
  noBorderRadius,
  selectable,
  selectedIds = [],
  onSelectionChange,
  rowStyle,
  hideHeader,
  showCheckboxPlaceholder
}: DataTableProps<T>) => {
  const [hoveredRowId, setHoveredRowId] = React.useState<string | number | null>(null);
  const isAnySelected = selectedIds.length > 0;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(data.filter(r => !(r as any).isEmpty).map(r => r.id!));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleSelectRow = (e: React.ChangeEvent<HTMLInputElement>, id: string | number) => {
    e.stopPropagation();
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange([...selectedIds, id]);
      } else {
        onSelectionChange(selectedIds.filter(itemId => itemId !== id));
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--color-white)',
      borderRadius: noBorderRadius ? '0' : '12px',
      boxShadow: noBorderRadius ? 'none' : 'var(--shadow-sm)',
      overflow: 'hidden',
      border: noBorderRadius ? 'none' : '1px solid var(--color-border)'
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
      }}>
        {!hideHeader && (
          <thead>
            <tr style={{
              backgroundColor: 'var(--color-gray-bg)',
              borderBottom: '1px solid var(--color-border)'
            }}>
              {(selectable || showCheckboxPlaceholder) && (
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  {selectable && (
                    <div style={{ 
                      opacity: isAnySelected ? 1 : 0, 
                      transition: 'opacity 0.2s ease',
                      visibility: isAnySelected ? 'visible' : 'hidden'
                    }}>
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={data.length > 0 && data.filter(r => !(r as any).isEmpty).every(r => selectedIds.includes(r.id!))}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </div>
                  )}
                </th>
              )}
              {columns.map((col, idx) => (
                <th key={idx} style={{
                  padding: '12px 16px',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={selectable ? columns.length + 1 : columns.length} style={{
                padding: '64px 16px',
                textAlign: 'center',
                verticalAlign: 'middle'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'rgba(255,255,255,0.85)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: 'var(--color-gray)',
                  animation: 'emptyFade 0.3s ease-out forwards'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35, flexShrink: 0 }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeDasharray="4 3" />
                    <line x1="8" y1="9" x2="16" y2="9" />
                    <line x1="8" y1="13" x2="13" y2="13" />
                  </svg>
                  Aucune donnée enregistrée
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => {
              const isSelected = row.id ? selectedIds.includes(row.id) : false;
              return (
                <tr 
                  key={row.id || rowIdx} 
                  onClick={(e) => {
                    // Only trigger onRowClick if the click wasn't on an interactive element
                    const isInteractive = (e.target as HTMLElement).closest('button, input, a, [role="button"]');
                    if (!isInteractive && onRowClick) {
                      onRowClick(row);
                    }
                  }}
                  style={{
                    height: '52px',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: isSelected || (hoveredRowId === (row.id || rowIdx) && !(row as any).isEmpty) ? 'var(--color-primary-light)' : 'transparent',
                    ...rowStyle
                  }}
                  onMouseEnter={() => {
                    setHoveredRowId(row.id || rowIdx);
                  }}
                  onMouseLeave={() => {
                    setHoveredRowId(null);
                  }}
                >
                  {(selectable || showCheckboxPlaceholder) && (
                    <td style={{ padding: '0 16px' }}>
                      {selectable && !(row as any).isEmpty && (
                        <div style={{ 
                          opacity: (isSelected || isAnySelected || hoveredRowId === (row.id || rowIdx)) ? 1 : 0,
                          transition: 'opacity 0.2s ease',
                          visibility: (isSelected || isAnySelected || hoveredRowId === (row.id || rowIdx)) ? 'visible' : 'hidden'
                        }}>
                          <input 
                            type="checkbox" 
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(e, row.id!)}
                            onClick={(e) => e.stopPropagation()}
                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                          />
                        </div>
                      )}
                    </td>
                  )}
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} style={{
                      padding: '0 16px',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text)',
                    }}>
                      {(row as any).isEmpty ? '' : (col.render ? col.render(row) : (row[col.key as keyof T] as unknown as React.ReactNode))}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
