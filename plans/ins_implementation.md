# Implementierung von Jodzahl und INS-Wert

## Ziel
Berechnung und Anzeige des INS-Wertes (Iodine Number + Saponification) für das Seifenrezept, um die physikalischen Eigenschaften der Seife (Härte, Haltbarkeit) besser einschätzen zu können.

## Geplante Jodzahlen für Standardöle
Basierend auf gängigen Seifenrechner-Werten:

| Öl | Jodzahl (ca.) | INS (ca.) |
|----|---------------|-----------|
| Olivenöl | 85 | 105 |
| Kokosöl (nativ) | 10 | 258 |
| Palmöl | 53 | 145 |
| Sheabutter | 59 | 116 |
| Kakaobutter | 37 | 157 |
| Rizinusöl | 86 | 95 |
| Mandelöl | 99 | 97 |
| Rapsöl | 114 | 56 |
| Sonnenblumenöl | 133 | 63 |
| Babassuöl | 15 | 230 |

*Formel für INS:* `(SAP_KOH * 1000) - Jodzahl`

## Änderungen

### 1. Datenmodell (`src/models/Oil.ts`)
Erweiterung des Interfaces `Oil`:
```typescript
export interface Oil {
  // ...
  iodine?: number; // Neues Feld, optional für Abwärtskompatibilität
}
```

### 2. Standardwerte (`src/data/defaultOils.ts`)
Hinzufügen der Property `iodine` zu allen Einträgen.

### 3. UI - Öl Manager (`src/components/Oil/OilModal.tsx`)
Hinzufügen eines Eingabefeldes für die Jodzahl.

### 4. Berechnung (`src/services/SoapMath.ts`)
Neue Felder im `CalculationResult`:
- `iodine`: Gewichteter Durchschnitt der Jodzahlen.
- `ins`: Gewichteter Durchschnitt der INS-Werte.

```typescript
// Pseudo-Code Berechnung
items.forEach(item => {
  const oil = getOil(item.oilId);
  const contribution = item.percentage / 100;
  
  // Falls Jodzahl fehlt, Warnung oder Standardwert (z.B. 0 und Warnung)
  const oilIodine = oil.iodine || 0; 
  const oilIns = (oil.sapKoh * 1000) - oilIodine;
  
  totalIodine += oilIodine * contribution;
  totalIns += oilIns * contribution;
});
```

### 5. Ergebnisanzeige (`src/components/Recipe/CalculationResult.tsx`)
Anzeige einer INS-Skala.
- Idealwert oft als Bereich 136 - 165 angegeben (Dr. Bob's Scale), aber oft subjektiv.
- Wir zeigen den Wert und eine farbliche Einordnung an (z.B. Ampel oder Slider).
