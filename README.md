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
2. **Privates Daten-Repo anlegen** (leer oder mit README, egal).
3. **Token erstellen:** GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained tokens*
   - Repository access: *Only select repositories* → nur das Daten-Repo
   - Permissions → *Contents: Read and write*
4. In der App oben auf **„Sync einrichten“** → Repo (`owner/name`) und Token eintragen. Das wiederholst du einmal pro Gerät.

Die App verweigert den Sync, wenn das Daten-Repo öffentlich ist.

## Wie der Sync funktioniert

- Jede Buchung hat eine ID und einen Änderungs-Zeitstempel; gelöschte Buchungen werden als „Tombstone“ gespeichert.
- Beim Start, nach jeder Änderung, beim Zurückkehren in den Tab und alle 2 Minuten wird abgeglichen: neuere Version gewinnt pro Buchung, Änderungen von mehreren Geräten gehen nicht verloren.
- Offline funktioniert die App weiter (localStorage); synchronisiert wird nachgeholt.
- Jede Änderung ist ein Commit im Daten-Repo – du hast also automatisch eine Versionshistorie.

## Datenschutz

- Der Token liegt nur im `localStorage` des jeweiligen Browsers und ist durch die Fine-grained-Berechtigung auf das Daten-Repo beschränkt.
- Für PDF-/Screenshot-Import werden bei Bedarf `pdf.js` und `tesseract.js` von einem CDN nachgeladen (die Dateien selbst bleiben lokal).
