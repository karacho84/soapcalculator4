# Projekt-Struktur & Tech-Stack Details

## Verzeichnisstruktur

```
/
├── public/                 # Statische Assets (Icons, Manifest)
├── src/
│   ├── components/         # Wiederverwendbare UI Komponenten
│   │   ├── Layout/         # Header, Menu, PageWrapper
│   │   ├── Recipe/         # Rezept-spezifische Komponenten (Editor, Table)
│   │   └── Oil/            # Öl-Verwaltung Komponenten
│   ├── hooks/              # Custom React Hooks
│   │   ├── useCalculator.ts # Die Kern-Logik für Verseifung
│   │   ├── useStorage.ts    # Abstraktion für Daten-Persistenz
│   │   └── useOils.ts       # Hook für Öl-Daten
│   ├── models/             # TypeScript Interfaces & Types
│   │   ├── Recipe.ts
│   │   └── Oil.ts
│   ├── pages/              # Haupt-Screens (Ionic Pages)
│   │   ├── Home.tsx
│   │   ├── Calculator.tsx
│   │   ├── OilManager.tsx
│   │   └── Settings.tsx
│   ├── services/           # Business Logic ohne UI
│   │   ├── SoapMath.ts      # Reine Rechenfunktionen (Unit-testbar)
│   │   └── StorageService.ts # Low-level Storage implementation
│   ├── theme/              # Ionic Theme Variablen (variables.css)
│   ├── App.tsx             # Main Router & App Setup
│   └── main.tsx            # Entry Point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ionic.config.json       # Ionic Konfiguration
```

## Kern-Komponenten Detailplanung

### `SoapMath.ts` (Service)
Dies ist das Herzstück. Es muss eine reine Funktion sein, die testbar ist.
Input: `RecipeConfig` (Fettmenge, Lauge, Überfettung, Wasser%) + `RecipeItem[]` (Öle & %)
Output: `CalculationResult` (Benötigte NaOH/KOH, Wasser in g, Totalgewicht, Warnungen)

### `Calculator.tsx` (Page)
- **Header**: Rezept-Name, Datum
- **General Settings Card**: Gesamtfett (Input), Überfettung (Range/Input), Wasser (Range/Input), Lauge (Select: NaOH, KOH, Mixed).
- **Oils Table**:
  - Columns: Name (Select), % (Input), Gramm (Readonly), SAP (Readonly/Edit).
  - Footer: Summe %, Summe Gramm. Button "Add Oil".
- **Result Card**: Live Anzeige der benötigten Laugenmenge und Wassermenge.
- **Actions**: Save, Clear, Share/Export.

### `OilManager.tsx` (Page)
- Liste aller verfügbaren Öle (CRUD).
- Standard SAP Werte hinterlegen.
- Möglichkeit, "eigene" Öle hinzuzufügen, die nicht im Standard-Katalog sind.

## Libraries

- `react-hook-form`: Für einfaches Formular-Management (besonders bei der Tabelle).
- `uuid`: Für eindeutige IDs.
- `decimal.js` (optional): Um Floating-Point Ungenauigkeiten bei der Chemie zu vermeiden (Javascript 0.1 + 0.2 problem). *Entscheidung: Wir nutzen Standard `number` aber runden am Ende für die Anzeige auf 2 Nachkommastellen, da Seifenküchenwaagen selten genauer als 0.01g - 1g sind.*

## Storage Strategy
Wir nutzen einen simplen JSON-basierten Ansatz im `localStorage` für V1.
Keys: `seifenrechner_oils`, `seifenrechner_recipes`.
Später kann dies einfach durch SQLite (via Capacitor) ersetzt werden.
