# Feature Plan: Online Help Integration

## Ziele
1.  **Hilfe-Seite erstellen:** Eine neue Seite, die die Funktionsweise der App erklärt.
2.  **Inhalt:** Erklärung der Grundfunktionen (Rezept erstellen, Öle verwalten) und spezifische "Tricks" wie das Swipen zum Exportieren.
3.  **Integration:** Erreichbar über das Menü oder die Settings-Seite.
4.  **Mehrsprachigkeit:** Inhalte müssen in DE und EN verfügbar sein.

## Architektur

### 1. UI Komponenten
*   **`src/pages/Help.tsx` (Neu):**
    *   Statische Seite mit Accordion-Struktur oder einfachen Karten für verschiedene Themenbereiche.
    *   Themen:
        *   Erste Schritte (Rezept erstellen)
        *   Öl-Manager (Eigene Öle anlegen)
        *   Import/Export (Backup, Einzel-Export via Swipe)
        *   FAQ / Tipps
*   **`src/components/Help/HelpSection.tsx` (Optional):** Wiederverwendbare Komponente für einen Hilfe-Abschnitt.

### 2. Navigation
*   **Settings Page:** Ein neuer Menüpunkt "Hilfe / Help" in der Einstellungsliste.
*   **Routing:** Neue Route `/help` in `App.tsx`.

### 3. Inhalt (Content)
*   Die Texte werden direkt in `translation.json` (i18n) gepflegt oder als separate Markdown/JSON-Struktur geladen, wenn sie zu lang werden. Für dieses Projekt scheinen i18n Strings ausreichend.

## Struktur der Hilfe-Themen
1.  **Grundlagen:** Wie erstelle ich eine Seife? (Kurzanleitung)
2.  **Export & Teilen:** 
    *   Erklärung der Swipe-Geste nach links auf Rezepten/Ölen zum Teilen/Exportieren.
    *   Unterschied zwischen Backup und Einzel-Export.
3.  **Datenverwaltung:** Wie importiere ich Daten? Was passiert bei Duplikaten?

## Umsetzungsschritte
1.  **Übersetzungen vorbereiten:** Texte für die Hilfe-Sektionen in `de/translation.json` und `en/translation.json` anlegen.
2.  **Help Page erstellen:** `src/pages/Help.tsx` implementieren.
3.  **Routing:** Route in `App.tsx` hinzufügen.
4.  **Verlinkung:** Button in `Settings.tsx` hinzufügen.
