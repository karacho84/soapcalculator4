# Feature: Cloud Sync (Firebase) ohne klassischen Login

## Konzept: "Magic Recovery Key"
Anstatt Benutzername/Passwort zu verlangen, generiert die App im Hintergrund Account-Daten und präsentiert diese dem Nutzer als einzigen "Wiederherstellungs-Schlüssel".

### Technische Basis
*   **Backend:** Firebase (Authentication + Firestore Database).
*   **Auth Methode:** Firebase Email/Password Auth (technisch), aber UI-seitig als "Schlüssel" abstrahiert.
*   **Sicherheit:** Standard Firebase Security Rules (nur eigener User darf eigene Daten lesen/schreiben).

### Workflow

#### 1. Aktivierung (Erste Einrichtung)
1.  User klickt auf "Cloud-Sicherung aktivieren".
2.  App generiert lokal:
    *   Eine zufällige ID (z.B. 8 Zeichen Alphanumerisch).
    *   Ein starkes Passwort (z.B. 4 zufällige Wörter oder 16 Zeichen Random).
    *   Kombiniert dies zu einer "virtuellen Email": `[ID]@seifenrechner-app.internal`.
3.  App erstellt Firebase User mit dieser Email & Passwort.
4.  App speichert ID & Passwort sicher im `localStorage` (oder SecureStorage).
5.  **Wichtig:** App zeigt dem User den **Wiederherstellungs-Schlüssel** (Format: `ID-PASSWORT`) an und zwingt ihn zur Bestätigung ("Ich habe den Schlüssel notiert").

#### 2. Synchronisation
*   Wenn eingeloggt (Auth State Listener):
    *   Laden der Daten aus Firestore bei App-Start.
    *   Speichern der Daten in Firestore bei Änderungen (mit Debounce/Verzögerung oder beim Verlassen der App, sofern möglich).
    *   Konfliktlösung: "Server wins" oder "Last Write wins" (einfachste Variante).

#### 3. Wiederherstellung (Neues Gerät)
1.  User installiert App neu.
2.  Klickt auf "Daten wiederherstellen".
3.  Gibt den "Wiederherstellungs-Schlüssel" ein.
4.  App extrahiert ID & Passwort.
5.  App loggt sich via Firebase Auth ein.
6.  Nach Login zieht die App die Daten aus Firestore und überschreibt/mergt den lokalen Stand.

### Datenmodell (Firestore)
Collection: `users`
Document: `{uid}` (Die Firebase User ID)
Inhalt:
```json
{
  "lastUpdated": "Timestamp",
  "data": {
    "oils": [...],
    "recipes": [...]
  }
}
```

### Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Voraussetzungen für Implementierung
Der User (Du) muss ein Firebase Projekt erstellen:
1.  Gehe zu [console.firebase.google.com](https://console.firebase.google.com).
2.  Erstelle ein Projekt "Seifenrechner".
3.  Aktiviere **Authentication** -> **Sign-in method** -> **Email/Password**.
4.  Erstelle eine **Firestore Database**.
5.  Füge eine **Web App** hinzu und kopiere das `firebaseConfig` Objekt.

## Nächste Schritte
1.  Entscheidung: Wollen wir diesen Weg gehen? (Erfordert Setup durch dich).
2.  Falls ja: Firebase Config bereitstellen.
3.  Implementierung von `FirebaseService` und Anpassung der Hooks.
