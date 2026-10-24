# 1Percent

Einnahmen und Ausgaben tracken – als einzelne HTML-Datei (`index.html`), ohne Server und ohne Build-Schritt.

- Übersicht pro **Tag, Monat oder Jahr** (Auswahl neben dem Kontofilter), Kategorien, automatische Zuordnung per Stichwort-Regeln
- **Overview** (wie „Resumen“ in Castcomercial): Diagramme für die Tage des Monats, die letzten 12 Monate oder ein Kalenderjahr (mit < > zum Blättern) – Einnahmen ↑ / Ausgaben ↓ als Säulen, Saldo als Linie, Ausgaben nach Kategorie gestapelt; Antippen zeigt die Zahlen, alles auch als Tabelle
- **Fixkosten-Checkliste** unter jeder Monats-/Tagesansicht: Fixkosten selbst eintragen (Betrag, Fälligkeitstag, Kategorie, Konto) und jeden Monat abhaken; passende Buchungen haken automatisch ab (Stichwort + Betrag ±10 %), offene nach dem Fälligkeitstag sind als „überfällig“ markiert
- **Forderungen** (Schuldner, Betrag, Fälligkeit, Leistungsdatum) und **offene Verbindlichkeiten** (du → Gläubiger, Betrag, Fälligkeit) als fortlaufende Listen darunter: nach Fälligkeit sortiert, Überfälliges markiert, abhaken = bezahlt; passende Zahlungen in deinen Buchungen werden zum Abhaken vorgeschlagen
- Import von Kontoauszügen (**CSV**, **PDF**) und **Screenshots** – mit **Claude**: liest die Dateien und ordnet jede Buchung deinen Kategorien zu (ohne Claude: Texterkennung im Browser)
- **Konto pro Buchung** (Standard: Commerzbank, N26; in den Einstellungen änderbar) – beim Import automatisch erkannt (Claude am Dokument, CSV am Exportformat), Filter „Alle Konten“ / einzelnes Konto in Monats- und Jahresansicht
- **Umbuchungen** zwischen deinen eigenen Konten (z. B. Commerzbank → N26) bekommen die Kategorie „Umbuchung“ und zählen nicht in Einnahmen, Ausgaben, Saldo und Sparquote. Beim Import werden Gegenbuchungen automatisch erkannt (gleicher Betrag, umgekehrtes Vorzeichen, anderes Konto, max. 4 Tage auseinander) und an deinem Namen: Ist in den Einstellungen der **Kontoinhaber** eingetragen, wird jede Überweisung von oder an diesen Namen zur Umbuchung (geprüft wird die Gegenpartei, nicht der Verwendungszweck)
- **Gemeinsame Spaces** (z. B. N26-Space „food“ mit der Freundin, unter *Einstellungen → Konten*): Gezählt wird nur deine Einzahlung („An food“) als Ausgabe der gewählten Kategorie. Zahlungen, die dir aus dem Space erstattet werden („Von food (Penny Niendorf)“ +11,60 zu „Penny Niendorf“ −11,60, bis 4 Tage auseinander), zählen samt Erstattung nicht und sind in der Liste markiert.
- **Sparkonten** (z. B. N26-Space „Immobilie“, unter *Einstellungen → Konten*): Überweisungen dorthin bleiben Umbuchungen, aber was im Monat netto aufs Sparkonto geht, erscheint als **Ersparnis** (Monat, Tag, Jahr und Jahrestabelle). Spaces werden aus den Buchungstexten erkannt und vorgeschlagen.
- **Geldfluss** im Monat (und Jahr): pro Konto Einnahmen, Ausgaben, Umbuchungen und was übrig bleibt, z. B. Commerzbank (Einnahmen, Fixkosten) → N26 (Alltag) → Immobilie (Ersparnis). Fehlt der Auszug eines Kontos, weist die App darauf hin.
- **Keine Doppelbuchungen:** Beim Import gilt eine Buchung als doppelt, wenn sie mit gleichem Betrag, gleichem Konto, ähnlichem Text und höchstens 2 Tage Abstand schon gebucht ist – oder in einer anderen Datei derselben Auswahl steht (z. B. PDF + Screenshot desselben Zeitraums). Die Zuordnung ist 1:1, echte Wiederholungen (3× Aufrundung am selben Tag) bleiben erhalten. Doppelte werden abgewählt, ans Ende gestellt und mit Grund angezeigt. Für bereits vorhandene Doppelungen: *Einstellungen → Doppelte Buchungen suchen* (mit Vorschau und Rückgängig).
- **Vorläufiger und endgültiger Auszug:** Lädst du mitten im Monat einen vorläufigen Auszug und am Monatsende den vollständigen hoch, werden die schon vorhandenen Buchungen nicht doppelt übernommen. Vorgemerkte Umsätze merkt sich die App als „vorgemerkt“. Im endgültigen Auszug ersetzt sie sie durch die gebuchte Fassung, auch bei leicht anderem Betrag oder Datum (z. B. Wechselkurs oder Trinkgeld, bis 15 % bzw. 7 Tage). Deine Kategorie bleibt dabei erhalten. Vorgemerkte, die im neuen Auszug fehlen (z. B. eine aufgehobene Tankstellen-Reservierung), schlägt sie zum Löschen vor.
- Vorschau zum Korrigieren vor dem Übernehmen
- **ToDos** (Kreis-mit-Haken-Symbol oben): tägliche Liste mit < > durch die Tage, abhaken, bearbeiten; Unerledigtes von früheren Tagen erscheint unter „Heute“ und lässt sich mit einem Tipp übernehmen. Sync über `data/todos.json`
- **Dunkel / Hell / System** unter *Einstellungen → Darstellung* (pro Gerät)
- **Geräteübergreifender Sync** über ein *privates* GitHub-Repo (eine JSON-Datei pro Monat)
- **Workout-Tracker** (Hantel-Symbol oben, zurück zu den Finanzen mit dem $ daneben): Körperkarte vorne/hinten mit 14 Muskelgruppen

## Aufbau

| Repo | Sichtbarkeit | Inhalt |
|---|---|---|
| `1percent` (dieses Repo) | öffentlich | nur die App – **keine** Finanzdaten, **keine** Zugangsdaten |
| Daten-Repo (jede Person ein eigenes, z. B. `1percent-data`) | **privat** | `data/YYYY-MM.json`, `data/settings.json`, `data/workouts.json`, `data/todos.json` |

## Einrichtung (pro Person, einmalig)

1. **App hosten (nur der Betreiber):** In diesem Repo *Settings → Pages → Deploy from a branch → `main` / `(root)`*.
   Die App ist dann unter `https://<user>.github.io/1percent/` erreichbar (auf dem Handy: „Zum Home-Bildschirm“).
2. **Eigenes privates Daten-Repo anlegen** (Name z. B. `1percent-data`, Sichtbarkeit *Private*).
3. **Token erstellen:** GitHub → Settings → Developer settings → Personal access tokens → *Fine-grained tokens*
   - Repository access: *Only select repositories* → nur das eigene Daten-Repo
   - Permissions → *Contents: Read and write*
4. In der App auf **„Sync einrichten“** → Repo (`owner/name`) und Token eintragen. Die App verweigert den Sync, wenn das Repo öffentlich ist.

Die Links zum Anlegen von Repo und Token stehen auch direkt im Sync-Dialog.

### Weitere Geräte per Code (wie Castcomercial)

Unter *Sync & Daten → Weitere Geräte* auf **„Zugang für weitere Geräte erzeugen“**. Die App zeigt einen 12-stelligen Code (z. B. `KRWX-58B2-7EMQ`).

- Auf dem neuen Gerät 1Percent öffnen und den **Code eingeben** – fertig. Oder den **QR-Code** scannen.
- Geht auch, wenn das Gerät schon „Nur lokal“ genutzt wurde: *Sync & Daten → Mit Code verbinden*.
- **Einmalig nötig:** Der Token braucht zusätzlich Zugriff auf das App-Repo (`1percent`, *Contents: Read and write*), weil dort der verschlüsselte Zugang abgelegt wird. Fehlt das Recht, sagt die App es dir und bietet bis dahin einen QR-Code/Link an, der den Zugang direkt enthält.
- **„Neuer Code“** macht den alten Code ungültig; schon verbundene Geräte bleiben verbunden.

## Mehrere Personen

Jede Person nutzt dieselbe App-Adresse, aber ihr **eigenes** Daten-Repo mit **eigenem** Token. Es gibt keinen gemeinsamen Server und keine gemeinsamen Zugangsdaten: Wer die App betreibt, sieht keine Daten der anderen. Einen Token teilt man nie zwischen Personen – er öffnet das gesamte Daten-Repo.

## Wie der Gerätezugang funktioniert

- Das erste Gerät verschlüsselt `{Repo, Token}` mit dem Code (PBKDF2, 600 000 Runden → AES-GCM) und legt das Ergebnis als `access/<id>.json` ins öffentliche App-Repo. Auch `<id>` wird langsam (PBKDF2) aus dem Code abgeleitet, der Code lässt sich also nicht über den Dateinamen erraten. Die Datei enthält weder Token noch Repo-Namen im Klartext.
- Ein neues Gerät leitet aus dem Code `<id>` ab, lädt die Datei und entschlüsselt sie – ohne Code ist sie nutzlos.
- Der Code liegt in den synchronisierten Einstellungen deines privaten Daten-Repos, damit jedes verbundene Gerät ihn anzeigen kann. Nach einem Token-Wechsel aktualisiert die App die Datei automatisch.
- **Wer den Code hat, hat vollen Zugriff auf deine Daten.** Ganz zurückziehen kannst du einen Zugang nur, indem du den Token auf GitHub löschst und einen neuen einträgst.

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
- **Lange Dokumente (z. B. Jahresumsätze):** werden automatisch in Teile geschnitten – Text-PDFs und Textdateien nach Zeilen (mit Überlappung, damit an den Schnittstellen nichts fehlt oder doppelt kommt), gescannte PDFs in Gruppen von 4 Seiten, viele Screenshots in Gruppen von 5. Jeder Teil ist eine eigene kleine Anfrage; wird einer trotzdem zu lang, halbiert die App ihn selbst. Im Protokoll steht „Teil 3 von 10“.
- **Hochladen wie bei Castcomercial:** Dateien auswählen, hineinziehen oder einfügen (auch mehrere, z. B. PDF + Screenshots) – sie werden erst gesammelt. Darunter steht ein Feld für **Extra-Anweisungen** (z. B. „Nur Oktober übernehmen“, „Alles bei Amazon ist Freizeit & Vergnügen“, „Schreib ‚Urlaub Lissabon‘ in die Notiz“). Mit „Mit Claude auswerten“ gehen Dateien und Anweisungen zusammen an Claude.
- **Die App lernt mit:** Ordnest du in der Vorschau (oder später beim Bearbeiten) eine Buchung selbst zu, merkt sie sich Händler → Kategorie (z. B. „kiosk eck → Nahrung & Pflege“, „paypal spotify → Abo“). Beim nächsten Import wird das sofort angewendet – ohne Claude, also ohne Kosten – und Claude bekommt die Liste als feste Vorgabe. Ältere Buchungen ohne Kategorie vom selben Händler werden gleich mit zugeordnet. Ansehen und vergessen unter *Einstellungen → Gelernte Zuordnungen*.
- Alles landet zuerst in der Vorschau – dort korrigieren, dann übernehmen. Pro Import lässt sich Claude abschalten.
- Kosten laufen über dein Anthropic-Konto. Die App ist auf **möglichst wenig Verbrauch** eingestellt:
  - Standard ist **Claude Haiku** (ca. 20× günstiger als Sonnet); unter *Sync & Daten → Claude → Modell* lässt sich „Genauer – Claude Sonnet“ wählen.
  - Text-PDFs (normale Kontoauszüge) werden im Browser in Text umgewandelt und nur als Text geschickt; nur gescannte PDFs gehen als Dokument.
  - Bilder werden auf max. 1100 px verkleinert, lange Screenshots in Teile geschnitten.
  - Der Assistent schickt nur die letzten Fragen mit, lädt höchstens 25 Buchungen pro Suche und nutzt Prompt-Caching.
  - Nach jeder Auswertung stehen die geschätzten Kosten im Protokoll, die Monatssumme (pro Gerät) im Claude-Bereich.
  - Grobe Werte mit Haiku: Kontoauszug-PDF 0,1–0,5 US-Cent, Screenshot ca. 0,1–0,2 US-Cent, Frage an den Assistenten ca. 0,1–0,5 US-Cent.

## Claude-Assistent

Unten rechts öffnet **✦ Assistent** einen Chat, in dem du deine Buchungen nachträglich verwalten kannst – z. B. „Setz alle Lidl-Buchungen auf Nahrung & Pflege“, „Lösch die doppelte Netflix-Buchung“, „Ordne alle Buchungen ohne Kategorie zu“ oder „Was habe ich im September für Tank ausgegeben?“.

- Claude sucht, ändert, löscht und legt Buchungen über Werkzeuge an, die im Browser ausgeführt werden; außerdem kann er Summen auswerten und Stichwort-Regeln anlegen.
- Kategorien und Konten werden geprüft (z. B. keine Ausgaben-Kategorie für Einnahmen).
- Nach jeder Antwort mit Änderungen gibt es **„Änderungen rückgängig machen“** (für die letzte Runde).
- Braucht denselben Claude-API-Schlüssel wie der Import.

## Training

Über das **Hantel-Symbol** in der Kopfzeile öffnest du den Workout-Tracker. Die Körperkarte färbt jede Muskelgruppe nach der Zeit seit ihrem letzten Training:

| seit dem Training | Farbe |
|---|---|
| unter 24 h | rot |
| 24–36 h | orange |
| 36–48 h | grün |
| ab 48 h | farblos (erholt) |

- **Per Sprache eintragen:** Mikrofon antippen, Training einsprechen (z. B. „Heute Bankdrücken 4 mal 8 mit 70 Kilo und 20 Minuten Laufen“), nochmal antippen. Claude erkennt Übungen, Sätze, Wiederholungen, Gewicht, Zeitpunkt („gestern Abend“) und die beanspruchten Muskelgruppen. In der Vorschau kannst du die Muskelgruppen noch an- und abwählen, dann speichern.
- Wo der Browser keine Spracherkennung hat (z. B. Firefox), sprichst du über das Mikrofon der Handy-Tastatur ins Textfeld.
- **Manuell eintragen:** „Manuell eintragen“ oder „+“ in der Kopfzeile. Übungen schreibst du eine pro Zeile („Curls 3x12 15 kg“).
- Antippen eines Trainings in der Liste: bearbeiten oder löschen. Antippen einer Muskelgruppe auf der Karte: wann sie zuletzt trainiert wurde.
- Synchronisiert über `data/workouts.json` (gleiche Logik wie bei den Buchungen); braucht für die Auswertung denselben Claude-Schlüssel.

## Datenschutz

- Der Token liegt nur im `localStorage` des jeweiligen Browsers und ist durch die Fine-grained-Berechtigung auf das Daten-Repo beschränkt.
- Mit Claude: Screenshots, PDFs, die zu kategorisierenden Buchungstexte und – beim Assistenten – die Buchungen, die er für deine Anfrage sucht, werden an die Anthropic-API geschickt (direkt aus deinem Browser, mit deinem Schlüssel).
- Beim Training geht der gesprochene bzw. getippte Text an Claude. Die Spracherkennung selbst übernimmt der Browser (bei Chrome/Safari über den Dienst des Browser-Herstellers).
- Ohne Claude: Für PDF-/Screenshot-Import werden bei Bedarf `pdf.js` und `tesseract.js` von einem CDN nachgeladen (die Dateien selbst bleiben lokal).
