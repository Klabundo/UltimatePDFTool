# The Ultimate PDF Tool

Ein leistungsstarkes und einfaches Tool zur Bearbeitung von PDF-Dateien, sowohl lokal (über die CLI/GUI) als auch über ein modernes Web-Frontend und FastAPI Backend.

## Dokumentation

Alle ausführlichen Dokumentationen für dieses Projekt befinden sich im Verzeichnis [`docs/`](docs/):

- [Allgemeine Projekt-Dokumentation (README)](docs/README.md)
- [Frontend Dokumentation](docs/frontend_README.md)
- [API Dokumentation](docs/API_DOCUMENTATION.md) (Endpunkte des FastAPI Backends)
- [Architektur & Aufbau](docs/ARCHITECTURE.md) (Übersicht der Komponenten)

## Installation & Schnellstart

Dieses Tool verfügt über ein modernes Web-Frontend (mit React gebaut) und ein Python Backend (FastAPI).

1. Stelle sicher, dass **Python (>=3.8)** und **Node.js (>=18)** installiert sind.
2. Klicke doppelt auf die Start-Datei für dein Betriebssystem (diese installiert automatisch fehlende Abhängigkeiten und öffnet die Server):
   - **Windows:** Führe `start.bat` aus (z.B. per Doppelklick).
   - **Linux/macOS:** Führe `./start.sh` im Terminal aus.

Sobald die Skripte laufen, öffnet sich dein Webbrowser mit der React-Benutzeroberfläche (standardmäßig unter `http://localhost:5173`), während die API im Hintergrund auf Port `8000` läuft.

Für Details zur CLI und zur alten Desktop-App siehe [docs/README.md](docs/README.md).
