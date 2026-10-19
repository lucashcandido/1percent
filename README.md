# 1Percent

Einnahmen und Ausgaben tracken – als einzelne HTML-Datei (`index.html`), ohne Server und ohne Build-Schritt.

- Monats- und Jahresübersicht, Kategorien, automatische Zuordnung per Stichwort-Regeln
- Import von Kontoauszügen (**CSV**, **PDF**) und **Screenshots** (Texterkennung läuft im Browser, nichts wird hochgeladen)
- Duplikat-Erkennung beim Import, Vorschau zum Korrigieren vor dem Übernehmen
- **Geräteübergreifender Sync** über ein *privates* GitHub-Repo (eine JSON-Datei pro Monat)

## Aufbau

| Repo | Sichtbarkeit | Inhalt |
|---|---|---|
| `1percent` (dieses Repo) | öffentlich | nur die App – **keine** Finanzdaten |
| Daten-Repo (z. B. `1percent-data`) | **privat** | `data/YYYY-MM.json` + `data/settings.json` |

## Einrichtung

1. **App hosten:** In diesem Repo *Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)`*.
   Die App ist dann unter `https://<user>.github.io/1percent/` erreichbar (auf dem Handy: „Zum Home-Bildschirm“).
2. **Privates Daten-Repo anlegen** (z. B. `1percent-data`).
3. **Erstes Gerät:** GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained tokens*
   - Repository access: *Only select repositories* → nur das Daten-Repo
   - Permissions → *Contents: Read and write*

   In der App auf **„Erstes Gerät einrichten (mit Token)“** bzw. **„Sync einrichten“** → Repo und Token eintragen.
4. **Weitere Geräte per Code:** In der App unter *Sync → Weitere Geräte* auf **„Gerätezugang einrichten“**. Es entsteht ein
   12-stelliger Code. Auf jedem neuen Gerät genügt es, die App zu öffnen und den Code einzugeben – oder den **QR-Code** zu
   scannen bzw. den **Link** (`…/1percent/#c=CODE`) zu öffnen. Einen Token muss man dort nie tippen.

   Zum Veröffentlichen schreibt die App die verschlüsselte Datei `access.json` ins App-Repo. Dafür reicht der Sync-Token
   absichtlich nicht (er erreicht nur das Daten-Repo): Die App fragt einmalig nach einem Token mit *Contents: Read and write*
   auf dem App-Repo `1percent`. Dieser Einmal-Token wird nicht gespeichert.

Die App verweigert den Sync, wenn das Daten-Repo öffentlich ist.

## Wie der Gerätezugang funktioniert

- Die App verschlüsselt `{Repo, Token}` mit dem Code (PBKDF2, 600 000 Runden → AES-GCM) und legt das Ergebnis als `access.json` im öffentlichen App-Repo ab. Ohne den Code ist die Datei wertlos.
- Ein neues Gerät lädt `access.json`, entschlüsselt sie mit dem Code und speichert den Token nur lokal.
- Der Code steht in den synchronisierten Einstellungen (privates Daten-Repo), daher kann jedes verbundene Gerät ihn und den QR-Code anzeigen.
- Läuft der Token ab, erzeugst du einen neuen Token, verbindest ein Gerät damit und klickst **„Neuen Code erzeugen“** bzw. veröffentlichst den Zugang erneut. Geräte mit gespeichertem Code holen sich den neuen Token danach selbst.

## Wie der Sync funktioniert

- Jede Buchung hat eine ID und einen Änderungs-Zeitstempel; gelöschte Buchungen werden als „Tombstone“ gespeichert.
- Beim Start, nach jeder Änderung, beim Zurückkehren in den Tab und alle 2 Minuten wird abgeglichen: neuere Version gewinnt pro Buchung, Änderungen von mehreren Geräten gehen nicht verloren.
- Offline funktioniert die App weiter (localStorage); synchronisiert wird nachgeholt.
- Jede Änderung ist ein Commit im Daten-Repo – du hast also automatisch eine Versionshistorie.

## Datenschutz

- Der Token liegt nur im `localStorage` des jeweiligen Browsers und ist durch die Fine-grained-Berechtigung auf das Daten-Repo beschränkt.
- Für PDF-/Screenshot-Import werden bei Bedarf `pdf.js` und `tesseract.js` von einem CDN nachgeladen (die Dateien selbst bleiben lokal).
