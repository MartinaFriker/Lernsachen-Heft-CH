# Lizenz

## Lernsachen-Heft CH

Diese Schweizer Version ist eine **Bearbeitung** des
[Lernsachen-Heft](https://lernsachen.blog) von **Lernsachen.blog**
(Original: <https://majort0m0.github.io/Lernsachen-Heft/>).

Das Original steht unter der Lizenz
[Creative Commons Namensnennung – Nicht kommerziell – Weitergabe unter gleichen Bedingungen 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de).
Diese Bearbeitung steht unter **derselben Lizenz**: Sie darf frei verwendet, weitergegeben und
verändert werden, aber nicht kommerziell, mit Namensnennung und nur unter denselben Bedingungen.

Dies ist **keine offizielle Version** von Lernsachen.blog. Fehler in den unten genannten Änderungen
gehen nicht auf den Urheber des Originals zurück.

## Änderungen gegenüber dem Original

Die Originaldatei liegt unverändert in `upstream/Lernsachen-Heft.html`. Alle Änderungen macht das
Skript `tools/build.mjs` (mit `tools/chf.mjs`) beim Erstellen von `index.html`:

- **Installierbar und offline:** echtes Web-Manifest, Symbole als Dateien und ein Service Worker,
  damit die App nach dem ersten Öffnen ohne Internet läuft. Name auf dem Home-Bildschirm:
  „Lernsachen-Heft CH“.
- **Schweizer Franken statt Euro** in „Rechnen mit dem Taschenrechner“, „Einkaufen an der Kasse“,
  „Rechnen mit Geld“, den Automaten (Geld-, Fahrkarten- und Getränkeautomat), im Geld-Planer und
  Kassenbuch, in „Rechnen im Alltag“, im Übungsgespräch beim Bäcker und in der Vorlage „Speisekarte“:
  - Schreibweise „3.50 Fr.“, „45 Rp.“, „1'250.50 Fr.“; gesprochen „3 Franken 50“
  - Schweizer Münzen (5 Rp. bis 5 Fr., „½“ auf dem 50-Rappen-Stück) und Noten (10 bis 200 Fr.),
    selbst gezeichnet statt der Euro-Piktogramme
  - alle Preise auf 5 Rappen gerundet
  - die Lösungskontrolle versteht „Fr.“, „CHF“, „Rp.“ und den Tausender-Strich
- **Punkt statt Komma** auf dem Taschenrechner und der Eingabe beim Kassenzettel.
- **Schweizer Wörter:** „Weggli“ statt „Semmel“, „Auf Wiedersehen“ statt „Servus“, „Noten“ statt
  „Scheine“; in der ganzen App „Glace“ statt „Eis am Stiel“, „Peperoni“ statt „Paprika“,
  „Farbstift“ statt „Buntstift“ und „Trotti“ statt „Roller“.
- **Schweizer Rechtschreibung:** in allen Texten „ss“ statt „ß“. Unverändert bleiben die
  Silbentrennmuster und die Programmteile, die ein eingetipptes „ß“ erkennen.
- Kleine Anpassungen am Layout, damit die längeren Franken-Beträge Platz haben.

## Enthaltene Teile anderer Urheber

Die Originaldatei enthält weitere Werke, die unverändert und mit ihren Hinweisen mitgeliefert werden,
unter anderem:

- Piktogramme von [ARASAAC](https://arasaac.org) (Sergio Palao, Gobierno de Aragón), CC BY-NC-SA 4.0
- Schriften (u. a. Andika, Lexend, Nunito, Atkinson Hyperlegible, Merriweather, Caveat)
- Hypher (Bram Stein) und deutsche Silbentrennmuster (Werner Lemberg u. a.)
- PDF.js

Sie stehen unter ihren eigenen Lizenzen; die Hinweise dazu stehen in der Originaldatei und in der
Hilfe der App.
