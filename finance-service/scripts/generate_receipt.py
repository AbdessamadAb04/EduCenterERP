import sys
import json
import os
from reportlab.lib.pagesizes import A5
from reportlab.pdfgen import canvas
from reportlab.lib import colors

def generate_receipt(data, output_path):
    c = canvas.Canvas(output_path, pagesize=A5)
    width, height = A5

    # Title
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(width / 2, height - 50, "RECU DE PAIEMENT")
    
    # Border
    c.setStrokeColor(colors.black)
    c.rect(20, 20, width - 40, height - 40)

    # Content
    c.setFont("Helvetica", 11)
    y = height - 100
    
    fields = [
        ("N° Reçu:", str(data.get('id', 'N/A'))),
        ("Étudiant:", data.get('student', 'N/A')),
        ("Date de paiement:", data.get('paymentDate', 'N/A')),
        ("Montant:", f"{data.get('amount', '0')} MAD"),
        ("Méthode:", data.get('method', 'Espèces')),
        ("Statut:", "PAYÉ")
    ]

    for label, value in fields:
        c.drawString(50, y, label)
        c.drawString(180, y, value)
        y -= 25

    # Footer
    c.setFont("Helvetica-Oblique", 9)
    c.drawCentredString(width / 2, 50, "Merci pour votre confiance - EduCenter ERP")

    c.save()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_receipt.py '<json_data>' <output_path>")
        sys.exit(1)

    try:
        data_json = sys.argv[1]
        output_file = sys.argv[2]
        data = json.loads(data_json)
        generate_receipt(data, output_file)
        print(f"Receipt generated at: {output_file}")
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)
