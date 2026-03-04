from reportlab.pdfgen import canvas
from PyPDF2 import PdfReader
from pypdf import PdfWriter, PdfReader as newReader
import os

c = canvas.Canvas("test_skew.pdf")
# Add a string that is slanted
c.setFont("Helvetica", 20)
c.saveState()
c.translate(100, 400)
c.rotate(15) # slanted 15 degrees
c.drawString(0, 0, "This is slanted text.")
c.restoreState()
c.showPage()
c.save()

os.system("python pdf_tool.py deskew -i test_skew.pdf -o test_deskewed.pdf -p all")
