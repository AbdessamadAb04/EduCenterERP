export function toDateInput(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatMAD(amount: number): string {
  return `${(Number(amount) || 0).toLocaleString('fr-FR')} MAD`;
}
