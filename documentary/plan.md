You are a senior React + TypeScript developer building a PDF receipt component 
for EduCenter, a SaaS ERP targeting small language and educational centers 
in Casablanca, Morocco.

Build a React component called `PaymentReceipt.tsx` using `@react-pdf/renderer` 
that generates a professional A4 payment receipt in French.

---

CONTEXT & USERS:
- The receipt is printed or downloaded by a center secretary or director
- It is handed physically to the student or their parent as proof of payment
- Users are Moroccan, French-speaking, non-technical
- Centers are small private language schools (50–200 students)
- Receipts must look professional and official, not like a generic invoice

---

RECEIPT DATA (props interface):
```typescript
interface PaymentReceiptProps {
  // Center info
  centerName: string        // ex: "EduSpace Casablanca"
  centerAddress: string     // ex: "23 Rue Ibn Batouta, Maarif, Casablanca"
  centerPhone: string       // ex: "0522 XX XX XX"
  centerEmail?: string      // optional

  // Receipt metadata
  receiptNumber: string     // ex: "REC-2026-0042"
  receiptDate: string       // ex: "04 avril 2026"

  // Student info
  studentName: string       // ex: "Karim Idrissi"
  studentPhone: string      // ex: "0661234567"
  className: string         // ex: "Anglais B2 Soir"
  subject: string           // ex: "Anglais"

  // Payment info
  amount: number            // ex: 600
  paymentMethod: string     // ex: "Espèces" | "Virement CIH" | "Virement Attijari" | "Autre"
  paymentDate: string       // ex: "28 mars 2026"
  dueDate: string           // ex: "01 avril 2026"
  periodLabel: string       // ex: "Mensualité Mars 2026"
  notes?: string            // optional free text
}
```

---

RECEIPT VISUAL STRUCTURE (top to bottom, A4 portrait):

1. HEADER SECTION
   - Left side: Center name in large bold dark green (#1a5c38), 
     below it address, phone, email in small gray text
   - Right side: the word "REÇU DE PAIEMENT" in large uppercase 
     bold dark text, below it receipt number in green, 
     below it receipt date in gray
   - A horizontal divider line below the header

2. STUDENT INFO SECTION
   - Title: "INFORMATIONS DE L'ÉTUDIANT" in small uppercase 
     green label
   - Two columns:
     Left: Nom complet, Téléphone
     Right: Classe, Matière
   - Light gray background box, rounded, padding 12px

3. PAYMENT DETAILS SECTION
   - Title: "DÉTAILS DU PAIEMENT" in small uppercase green label
   - Clean table with 2 columns (label | value):
     Désignation     | [periodLabel]
     Montant         | [amount] MAD
     Date d'échéance | [dueDate]
     Date de paiement| [paymentDate]
     Mode de paiement| [paymentMethod]
   - Alternating row background: white and very light gray (#f9f9f9)
   - Bold the amount row to make it stand out

4. TOTAL BOX
   - Dark green background (#1a5c38)
   - White text: "TOTAL PAYÉ" on left, "[amount] MAD" on right
   - Large font, bold, full width

5. NOTES SECTION (only if notes prop is provided)
   - Title: "REMARQUES"
   - Light yellow background box with the notes text
   - Small italic gray font

6. FOOTER SECTION
   - Horizontal divider
   - Centered text: "Ce reçu a été généré par EduCenter v0.1"
   - Below: "Gardez ce document comme preuve de paiement."
   - Very small, gray, italic
   - Right side: a signature line "Signature & Cachet du Centre"
     with a blank line underneath for physical stamp

---

STYLING RULES:
- Primary color: #1a5c38 (dark green — matches EduCenter brand)
- Secondary color: #f0f7f4 (very light green for backgrounds)
- Text primary: #111827
- Text secondary: #6b7280
- Border color: #e5e7eb
- Font: use 'Helvetica' (available in react-pdf without imports)
- A4 page size, portrait orientation
- Page padding: 40px all sides
- All labels and text in FRENCH only
- Receipt number format: "REC-YYYY-XXXX" 
- Amount always displayed as "X XXX MAD" with space separator
- Dates in French format: "04 avril 2026" not "2026-04-04"

---

ADDITIONAL REQUIREMENTS:
- Export two things from the file:
  1. `PaymentReceipt` — the PDF Document component for download
  2. `PaymentReceiptPreview` — wrapped with PDFViewer for 
      in-browser preview (full width, 600px height)
- Add a `DownloadButton` component that uses PDFDownloadLink 
  with filename format: "recu-[studentName]-[receiptNumber].pdf"
- The component must work with dummy default prop values so it 
  renders correctly even without data passed (for development preview)

---

DUMMY DEFAULT VALUES for development:
  centerName: "Centre Casablanca"
  centerAddress: "23 Rue Ibn Batouta, Maarif, Casablanca"
  centerPhone: "0522 48 XX XX"
  centerEmail: "contact@centrecasablanca.ma"
  receiptNumber: "REC-2026-0042"
  receiptDate: "04 avril 2026"
  studentName: "Karim Idrissi"
  studentPhone: "0661 23 45 67"
  className: "Anglais B2 Soir"
  subject: "Anglais"
  amount: 600
  paymentMethod: "Espèces"
  paymentDate: "28 mars 2026"
  dueDate: "01 avril 2026"
  periodLabel: "Mensualité Mars 2026"
  notes: ""