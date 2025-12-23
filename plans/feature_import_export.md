# Feature Plan: Import/Export & Settings

## Ziele
1.  **Export/Import einzelner Items:** Nutzer können einzelne Rezepte und Öle als JSON-Dateien teilen/sichern.
2.  **Settings Page:** Zentraler Ort für App-Einstellungen.
3.  **Sprachwahl:** Manuelle Sprachumschaltung (DE/EN).
4.  **Full-Backup:** Vollständige Sicherung und Wiederherstellung aller App-Daten.

## Architektur

### 1. Services (`src/services/`)
*   **`DataService.ts` (Neu/Erweiterung):**
    *   Kapselt die Logik für Import/Export.
    *   **Export:** Konvertiert Objekte zu JSON und löst Download aus.
    *   **Import:** Liest Datei, parst JSON, validiert Schema.
*   **`StorageService.ts`:**
    *   Benötigt "Upsert"-Methoden (Update or Insert), um importierte Daten sicher zu speichern.
    *   `importData(data: BackupData)`: Logik zum Zusammenführen von Backups.

### 2. Datenstrukturen (JSON)
*   **Single Oil:** `{ type: 'oil', version: 1, data: Oil }`
*   **Single Recipe:** `{ type: 'recipe', version: 1, data: Recipe }`
*   **Full Backup:** `{ type: 'backup', version: 1, timestamp: string, oils: Oil[], recipes: Recipe[] }`
*   *Hinweis:* Ein `version` Feld hilft bei der Abwärtskompatibilität.

### 3. UI Komponenten

#### A. Settings Page (`src/pages/Settings.tsx`)
*   **Route:** `/settings`
*   **Sektionen:**
    *   **Allgemein:** Sprachauswahl (IonSelect oder Segment).
    *   **Datenverwaltung:**
        *   "Backup exportieren" Button.
        *   "Backup importieren" Button (Hidden File Input).

#### B. Home (Rezepte)
*   **Header:** Zahnrad-Icon für Navigation zu Settings.
*   **Header/Toolbar:** "Rezept importieren" Button (Icon: `download` oder `document-text`).
*   **List Items:** Zusätzlicher Button in `IonItemSliding` (Icon: `share` oder `save`) für Einzel-Export.

#### C. Oil Manager
*   **Header:** "Öl importieren" Button.
*   **List Items:** Zusätzlicher Button in `IonItemSliding` für Einzel-Export.

## Umsetzungsschritte

1.  **Vorbereitung:**
    *   `DataService` erstellen (Helper für File-Download und JSON-Validierung).
    *   `StorageService` erweitern (import Methoden).

2.  **Settings Page & I18n:**
    *   Seite erstellen und Routing in `App.tsx` hinzufügen.
    *   Sprachumschalter implementieren.
    *   Navigation von Home -> Settings.

3.  **Full Backup:**
    *   Implementierung Export (Alle Öle + Rezepte lesen -> JSON -> Download).
    *   Implementierung Import (File Read -> JSON -> Storage Update).

4.  **Einzel-Export/Import (Rezepte):**
    *   UI Anpassungen in `Home.tsx`.
    *   Integration mit `DataService`.

5.  **Einzel-Export/Import (Öle):**
    *   UI Anpassungen in `OilManager.tsx`.
    *   Integration mit `DataService`.

6.  **Validierung & Tests:**
    *   Testen von Import defekter Dateien.
    *   Testen von Versions-Konflikten (Simulation alter Daten).
