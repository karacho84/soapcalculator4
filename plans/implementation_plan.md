# Implementierungs-Plan

Diese Aufgaben werden im "Code"-Modus abgearbeitet.

## Phase 1: Setup & Basis
- [x] Initialisieren des Ionic React Projekts (Vite).
- [x] Aufräumen des Boilerplates.
- [x] Installieren notwendiger Dependencies (`uuid`).
- [x] Erstellen der Verzeichnisstruktur (`src/models`, `src/services`, `src/components`, etc.).
- [x] Definieren der TypeScript Interfaces (`Oil`, `Recipe`, `RecipeItem`) in `src/models`.

## Phase 2: Kern-Logik (No UI)
- [x] Implementieren des `SoapMath.ts` Service mit Unit-Tests (oder manuellen Tests via Console).
    - [x] `calculateLyeAndWater(recipe)` Funktion.
    - [x] Validierungslogik (Summe 100%).
- [x] Implementieren des `StorageService.ts` (Mock/LocalStorage).
- [x] Erstellen von Default-Daten für Öle (Olivenöl, Kokosöl, etc.).

## Phase 3: Öl-Verwaltung (UI)
- [x] Erstellen der `OilManager` Page.
- [x] Implementieren einer Liste zur Anzeige der Öle.
- [x] Modal/Formular zum Hinzufügen/Bearbeiten von Ölen.
- [x] Speichern der Änderungen via `useOils` Hook.

## Phase 4: Rezept-Rechner (UI Core)
- [x] Erstellen der `Calculator` Page.
- [x] Bauen der Eingabefelder für Global-Werte (Gesamtfett, Überfettung, Wasser).
- [x] Implementieren der dynamischen Öl-Tabelle (Hinzufügen, Entfernen, % ändern).
- [x] Live-Anbindung an `SoapMath` -> Anzeige der Ergebnisse in Realtime.
- [x] Integration des `OilSelection` Dropdowns (Daten aus Phase 3).

## Phase 5: Rezept-Verwaltung & Finalisierung
- [x] Erstellen der `Home` Page als Dashboard (Liste gespeicherter Rezepte).
- [x] Laden/Speichern von Rezepten im Calculator.
- [x] Styling & Feinschliff (Ionic Komponenten korrekt nutzen für Mobile/Desktop Feel).
- [x] Testen der Mischverseifung.

## Phase 6: Duftöle (Fragrances)
- [ ] **Datenmodelle erweitern**:
    - [ ] Neues Model `Fragrance.ts` erstellen.
    - [ ] `Recipe.ts` erweitern um `RecipeFragrance[]`.
    - [ ] Default-Daten für Düfte hinzufügen (Lavender EO, Rose FO etc.).
- [ ] **Business Logic anpassen (`SoapMath`)**:
    - [ ] Berechnung der Duftöl-Menge basierend auf GFM und Prozentanteil.
    - [ ] Duftöl-Menge zum Gesamtgewicht addieren.
- [ ] **UI Erweiterungen**:
    - [ ] `FragranceManager` Page erstellen (ähnlich OilManager).
    - [ ] `Calculator` Page erweitern: Abschnitt für Duftöle hinzufügen.
    - [ ] Auswahl von Duftölen im Rechner ermöglichen.
    - [ ] Anzeige der berechneten Duftöl-Menge im Ergebnis.
