# The Ultimate PDF Tool

Ein leistungsstarkes und einfaches Kommandozeilen-Tool zur Bearbeitung von PDF-Dateien. Dieses Tool ermöglicht es dir, PDFs ähnlich wie bei bekannten Online-Tools zu manipulieren, jedoch vollständig lokal und offline.

## Installation

1. Stelle sicher, dass Python (>=3.8) installiert ist.
2. Installiere die Abhängigkeiten mit `pip`:
   ```bash
   pip install -r requirements.txt
   ```

## Nutzung

Die grundlegende Syntax lautet:
```bash
python pdf_tool.py [BEFEHL] [OPTIONEN]
```

### 1. PDFs zusammenfügen (`merge`)
Fügt mehrere PDF-Dateien in der angegebenen Reihenfolge zu einer einzigen PDF zusammen.

**Syntax:**
```bash
python pdf_tool.py merge -i [Eingabedateien...] -o [Ausgabedatei]
```

**Beispiel:**
```bash
python pdf_tool.py merge -i document1.pdf document2.pdf -o merged_output.pdf
```

### 2. PDFs aufteilen (`split`)
Trennt ein PDF-Dokument in einzelne Seiten auf und speichert diese in ein Verzeichnis.

**Syntax:**
```bash
python pdf_tool.py split -i [Eingabedatei] -o [Ausgabeverzeichnis]
```

**Beispiel:**
```bash
python pdf_tool.py split -i document.pdf -o split_pages_folder/
```

### 3. Seiten löschen (`delete`)
Löscht bestimmte Seiten (basierend auf 1-basierten Seitenzahlen) aus einem PDF-Dokument.

**Syntax:**
```bash
python pdf_tool.py delete -i [Eingabedatei] -o [Ausgabedatei] -p [Seitenzahlen...]
```

**Beispiel:**
```bash
# Löscht Seite 2 und 4
python pdf_tool.py delete -i document.pdf -o cleaned.pdf -p 2 4
```

### 4. Seiten drehen (`rotate`)
Dreht bestimmte Seiten um einen bestimmten Winkel (90, 180 oder 270 Grad). Du kannst eine Liste von Seiten angeben oder `all` verwenden.

**Syntax:**
```bash
python pdf_tool.py rotate -i [Eingabedatei] -o [Ausgabedatei] -a [Winkel] -p [Seitenzahlen... oder all]
```

**Beispiel:**
```bash
# Dreht alle Seiten um 90 Grad
python pdf_tool.py rotate -i document.pdf -o rotated.pdf -a 90 -p all

# Dreht nur Seite 1 und 3 um 180 Grad
python pdf_tool.py rotate -i document.pdf -o rotated.pdf -a 180 -p 1 3
```

### 5. Seiten neu anordnen (`reorder`)
Ändert die Reihenfolge der Seiten in einem PDF. Die gewünschte Reihenfolge muss angegeben werden (1-basierte Seitenzahlen).

**Syntax:**
```bash
python pdf_tool.py reorder -i [Eingabedatei] -o [Ausgabedatei] -p [Neue Reihenfolge...]
```

**Beispiel:**
```bash
# Ändert die Reihenfolge, sodass Seite 3 zuerst, dann 1, dann 2 kommt.
python pdf_tool.py reorder -i document.pdf -o reordered.pdf -p 3 1 2
```
