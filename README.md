# 1Percent

Einnahmen und Ausgaben tracken – als einzelne HTML-Datei (`index.html`), ohne Server und ohne Build-Schritt.

- Übersicht pro **Tag, Monat oder Jahr** (Auswahl neben dem Kontofilter), Kategorien, automatische Zuordnung per Stichwort-Regeln
- Import von Kontoauszügen (**CSV**, **PDF**) und **Screenshots** – mit **Claude**: liest die Dateien und ordnet jede Buchung deinen Kategorien zu (ohne Claude: Texterkennung im Browser)
- **Konto pro Buchung** (Standard: Commerzbank, N26; in den Einstellungen änderbar) – beim Import automatisch erkannt (Claude am Dokument, CSV am Exportformat), Filter „Alle Konten“ / einzelnes Konto in Monats- und Jahresansicht
- **Umbuchungen** zwischen deinen eigenen Konten (z. B. Commerzbank → N26) bekommen die Kategorie „Umbuchung“ und zählen nicht in Einnahmen, Ausgaben, Saldo und Sparquote. Beim Import werden Gegenbuchungen automatisch erkannt (gleicher Betrag, umgekehrtes Vorzeichen, anderes Konto, max. 4 Tage auseinander) und an deinem Namen: Ist in den Einstellungen der **Kontoinhaber** eingetragen, wird jede Überweisung von oder an diesen Namen zur Umbuchung (geprüft wird die Gegenpartei, nicht der Verwendungszweck)
- Duplikat-Erkennung beim Import, Vorschau zum Korrigieren vor dem Übernehmen
- **Geräteübergreifender Sync** über ein *privates* GitHub-Repo (eine JSON-Datei pro Monat)

## Aufbau

| Repo | Sichtbarkeit | Inhalt |
|---|---|---|
| `1percent` (dieses Repo) | öffentlich | nur die App – **keine** Finanzdaten, **keine** Zugangsdaten |
| Daten-Repo (jede Person ein eigenes, z. B. `1percent-data`) | **privat** | `data/YYYY-MM.json` + `data/settings.json` |

## Einrichtung (pro Person, einmalig)

1. **App hosten (nur der Betreiber):** In diesem Repo *Settings → Pages → Deploy from a branch → `main` / `(root)`*.
   Die App ist dann unter `https://<user>.github.io/1percent/` erreichbar (auf dem Handy: „Zum Home-Bildschirm“).
2. **Eigenes privates Daten-Repo anlegen** (Name z. B. `1percent-data`, Sichtbarkeit *Private*).
3. **Token erstellen:** GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained tokens*
   - Repository access: *Only select repositories* → nur das eigene Daten-Repo
   - Permissions → *Contents: Read and write*
4. In der App auf **„Sync einrichten“** → Repo (`owner/name`) und Token eintragen. Die App verweigert den Sync, wenn das Repo öffentlich ist.

Die Links zum Anlegen von Repo und Token stehen auch direkt im Sync-Dialog.

### Weitere Geräte per Link / QR-Code

Unter *Sync → Weitere Geräte* auf **„Zugang für weitere Geräte erzeugen“**. Danach:

- **QR-Code zeigen** → mit dem neuen Gerät scannen, oder **Link kopieren** → dort öffnen: fertig, ohne etwas zu tippen.
- Sicherer in zwei Schritten: **„Link ohne Code kopieren“** und den 12-stelligen **Code** getrennt schicken. Auf dem neuen Gerät fragt die App nach dem Code. Man kann den Link dort auch ins Feld auf dem Login-Bildschirm einfügen.

## Mehrere Personen

Jede Person nutzt dieselbe App-Adresse, aber ihr **eigenes** Daten-Repo mit **eigenem** Token. Es gibt keinen gemeinsamen Server und keine gemeinsamen Zugangsdaten: Wer die App betreibt, sieht keine Daten der anderen. Einen Token teilt man nie zwischen Personen – er öffnet das gesamte Daten-Repo.

## Wie der Gerätezugang funktioniert

- Das verbundene Gerät verschlüsselt `{Repo, Token}` mit dem Code (PBKDF2, 600 000 Runden → AES-GCM) und packt das Ergebnis in den Link (`…/#a=<Block>&c=<Code>`). Der Teil hinter `#` wird vom Browser nie an einen Server geschickt; die App entfernt ihn nach dem Öffnen aus der Adresszeile.
- Es wird nichts im App-Repo gespeichert. Der Code liegt in den synchronisierten Einstellungen deines privaten Daten-Repos, damit jedes verbundene Gerät neue Links und QR-Codes erzeugen kann.
- **Wer Link und Code hat, hat vollen Zugriff auf deine Daten.** Einen Zugang zurückziehen kannst du nur, indem du den Token auf GitHub löschst und einen neuen einträgst; alle Geräte müssen danach neu verbunden werden.

## Wie der Sync funktioniert

- Jede Buchung hat eine ID und einen Änderungs-Zeitstempel; gelöschte Buchungen werden als „Tombstone“ gespeichert.
- Abgeglichen wird ca. 1 Sekunde nach jeder Änderung, beim Zurückkehren in den Tab und **alle 5 Sekunden, solange der Tab sichtbar ist**. Änderungen von einem anderen Gerät erscheinen so nach wenigen Sekunden. Pro Buchung gewinnt die neuere Version, Änderungen von mehreren Geräten gehen nicht verloren.
- Die Abfrage nutzt GitHubs ETag („If-None-Match“): Sind die Daten unverändert, antwortet GitHub mit 304 – das kostet kein API-Kontingent. Bei Fehlern (offline, Rate-Limit) pausiert die App kurz und versucht es danach wieder.
- Offline funktioniert die App weiter (localStorage); synchronisiert wird nachgeholt.
- Jede Änderung ist ein Commit im Daten-Repo – du hast also automatisch eine Versionshistorie.

## Claude: Auswertung und Kategorien

Unter *Sync & Daten → Claude* trägst du einen eigenen [Anthropic-API-Schlüssel](https://console.anthropic.com/settings/keys) ein. Danach gilt beim Import:

- **Screenshots und PDFs** gehen direkt aus dem Browser an Claude. Claude liest alle Buchungen (Datum, Beschreibung, Betrag mit Vorzeichen) und ordnet jede einer deiner Kategorien zu – Ausgaben nur Ausgaben-, Einnahmen nur Einnahmen-Kategorien.
- **CSV** wird lokal gelesen; die Stichwort-Regeln gelten zuerst, nur was übrig bleibt, ordnet Claude zu.
- Claude bekommt dafür deine Kategorien, deine Regeln und als Beispiele, wie du bisher zugeordnet hast. Passt keine Kategorie eindeutig, bleibt die Buchung „Ohne Kategorie“ (in der Vorschau gelb markiert).
- Alles landet zuerst in der Vorschau – dort korrigieren, dann übernehmen. Pro Import lässt sich Claude abschalten.
- Kosten laufen über dein Anthropic-Konto. Der Schlüssel liegt in den synchronisierten Einstellungen (privates Daten-Repo), damit alle deine Geräte ihn haben.

## Claude-Assistent

Unten rechts öffnet **✦ Assistent** einen Chat, in dem du deine Buchungen nachträglich verwalten kannst – z. B. „Setz alle Lidl-Buchungen auf Nahrung & Pflege“, „Lösch die doppelte Netflix-Buchung“, „Ordne alle Buchungen ohne Kategorie zu“ oder „Was habe ich im September für Tank ausgegeben?“.

- Claude sucht, ändert, löscht und legt Buchungen über Werkzeuge an, die im Browser ausgeführt werden; außerdem kann er Summen auswerten und Stichwort-Regeln anlegen.
- Kategorien und Konten werden geprüft (z. B. keine Ausgaben-Kategorie für Einnahmen).
- Nach jeder Antwort mit Änderungen gibt es **„Änderungen rückgängig machen“** (für die letzte Runde).
- Braucht denselben Claude-API-Schlüssel wie der Import.

## Datenschutz

- Der Token liegt nur im `localStorage` des jeweiligen Browsers und ist durch die Fine-grained-Berechtigung auf das Daten-Repo beschränkt.
- Mit Claude: Screenshots, PDFs, die zu kategorisierenden Buchungstexte und – beim Assistenten – die Buchungen, die er für deine Anfrage sucht, werden an die Anthropic-API geschickt (direkt aus deinem Browser, mit deinem Schlüssel).
- Ohne Claude: Für PDF-/Screenshot-Import werden bei Bedarf `pdf.js` und `tesseract.js` von einem CDN nachgeladen (die Dateien selbst bleiben lokal).
