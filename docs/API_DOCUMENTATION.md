# API Documentation

The Ultimate PDF Tool stellt eine FastAPI-basierte RESTful API zur Verfügung, die standardmäßig auf Port `8000` läuft.

Die Basis-URL lautet: `http://localhost:8000/api`

## Endpunkte

Alle Endpunkte werden über die HTTP-Methode `POST` angesprochen.

### 1. `/api/merge`
Fügt mehrere PDF-Dateien in der übergebenen Reihenfolge zu einer einzigen PDF-Datei zusammen.
* **Methode:** POST
* **Payload:** Liste von Dateien (`files`) vom Typ `multipart/form-data`.
* **Rückgabe:** Eine `application/pdf`-Datei mit dem zusammengefügten Inhalt.

### 2. `/api/split`
Teilt ein mehrseitiges PDF-Dokument in einzelne Seiten oder isoliert bestimmte Seiten auf.
* **Methode:** POST
* **Payload:**
  * `file` (`multipart/form-data`): Die PDF-Datei, die geteilt werden soll.
  * `pages` (`form-data`, optional): Liste der Seiten, die entnommen werden sollen (z.B. `"1 3"`).
* **Rückgabe:** Ein ZIP-Archiv (`application/zip`) mit den entsprechenden PDF-Dateien.

### 3. `/api/delete`
Löscht angegebene Seiten aus einer PDF-Datei.
* **Methode:** POST
* **Payload:**
  * `file` (`multipart/form-data`): Die Ziel-PDF-Datei.
  * `pages` (`form-data`): Eine durch Leerzeichen getrennte Liste von Seitenzahlen, die gelöscht werden sollen (z.B. `"2 4"`).
* **Rückgabe:** Eine `application/pdf`-Datei, die die übrigen Seiten enthält.

### 4. `/api/rotate`
Dreht ausgewählte Seiten in der PDF-Datei um einen angegebenen Winkel.
* **Methode:** POST
* **Payload:**
  * `file` (`multipart/form-data`): Die zu drehende PDF-Datei.
  * `pages` (`form-data`): Entweder `"all"` für alle Seiten oder durch Leerzeichen getrennte Liste spezifischer Seiten (z.B. `"1 2"`).
  * `angle` (`form-data`): Der Drehwinkel in Grad (nur `90`, `180` oder `270`).
* **Rückgabe:** Eine `application/pdf`-Datei mit den entsprechend gedrehten Seiten.

### 5. `/api/reorder`
Ordnet die Seiten eines PDF-Dokuments in einer neuen, vom Nutzer definierten Reihenfolge an.
* **Methode:** POST
* **Payload:**
  * `file` (`multipart/form-data`): Die PDF-Datei.
  * `order` (`form-data`): Eine durch Leerzeichen getrennte Folge von 1-basierten Seitenzahlen (z.B. `"3 1 2"`).
* **Rückgabe:** Eine neu angeordnete `application/pdf`-Datei.

### 6. `/api/deskew`
Richtet den Schiefstand von Seiten in einer PDF-Datei aus (Drehung korrigieren).
* **Methode:** POST
* **Payload:**
  * `file` (`multipart/form-data`): Die zu korrigierende PDF-Datei.
  * `pages` (`form-data`): Entweder `"all"` für das gesamte Dokument oder durch Leerzeichen getrennte Liste spezifischer Seiten (z.B. `"1 2"`).
* **Rückgabe:** Eine `application/pdf`-Datei mit korrigierten und wieder gerade ausgerichteten Seiten.

> **Hinweis:** Eine interaktive und automatisch generierte Swagger/OpenAPI-Dokumentation findest du, wenn das Backend läuft, unter `http://localhost:8000/docs`.
