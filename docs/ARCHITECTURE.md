# Architektur & Komponenten

Das Projekt "The Ultimate PDF Tool" besteht aus drei wesentlichen Komponenten, die flexibel zusammenarbeiten:

## 1. Python CLI und Core Logic
Die Kernlogik für die PDF-Verarbeitung (Zusammenfügen, Aufteilen, Drehen, Löschen, Neu anordnen und Deskew) befindet sich im Hauptverzeichnis.
* `pdf_tool.py`: Beinhaltet die eigentlichen Operationen unter Verwendung der `pypdf`-Bibliothek. Hier werden die Aufgaben effizient und speicherschonend gelöst. Es kann auch direkt als CLI-Tool verwendet werden.
* `gui.py`: Stellt optional eine ältere Tkinter-Oberfläche (Desktop) bereit.

## 2. FastAPI Backend
Das Backend (`server.py`) stellt die CLI-Befehle als API über das HTTP-Protokoll zur Verfügung. Es empfängt Anfragen aus dem Frontend, verarbeitet die Dateien im Hintergrund und sendet die fertigen PDFs als Antwort zurück.
* Verwendet `FastAPI` für asynchrone Hochleistungs-Webdienste.
* Läuft standardmäßig auf Port `8000`.
* Ermöglicht das Testen und Verwalten von APIs (sowie Swagger-Dokumentation direkt auf `/docs`).

## 3. React Frontend
Das Frontend (`frontend/`) ist eine moderne Web-Benutzeroberfläche, die mit `React`, `Vite` und `Tailwind CSS` erstellt wurde.
* Stellt eine benutzerfreundliche Schnittstelle zur Verfügung.
* Verwendet `react-pdf` zur Vorschau und `HTML5 APIs` für interaktives Drag-and-Drop direkt im Browser.
* Kommuniziert über HTTP mit dem FastAPI Backend auf Port `8000` (`http://localhost:8000/api`).

## Start & Deployment
* Das System kann über die bereitgestellten Shell- und Batch-Skripte (`start.sh`, `start.bat`) auf Windows, Linux und macOS komfortabel durch einen einfachen Befehl oder Klick gestartet werden, ohne Backend und Frontend einzeln verwalten zu müssen.
