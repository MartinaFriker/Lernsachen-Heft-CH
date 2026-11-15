# Lernsachen-Heft CH

**App: <https://martinafriker.github.io/Lernsachen-Heft-CH/>**

Schweizer Version des [Lernsachen-Heft](https://lernsachen.blog) von Lernsachen.blog – installierbar
auf iPhone, iPad und Android und nach dem ersten Öffnen auch ohne Internet nutzbar.
**Keine offizielle Version** von Lernsachen.blog. Lizenz:
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.de), wie das Original –
Namensnennung, Liste der Änderungen und enthaltene Werke stehen in [LICENSE.md](LICENSE.md).

Installieren: Adresse in Safari öffnen → „Teilen“ → „Zum Home-Bildschirm“.

**Schweizer Franken:** „Rechnen mit dem Taschenrechner“, „Einkaufen an der Kasse“, „Rechnen mit
Geld“, die Automaten (Geld-, Fahrkarten-, Getränkeautomat), Geld-Planer und Kassenbuch sowie
„Rechnen im Alltag“ rechnen mit Franken und Rappen statt Euro (Anzeige „3.50 Fr.“, „45 Rp.“, „1'250.50 Fr.“, gesprochen
„3 Franken 50“), mit gezeichneten Schweizer Münzen (5 Rp. bis 5 Fr., ½ auf dem 50-Rappen-Stück) und
Noten (10 bis 200 Fr.); alle Beträge sind auf 5 Rappen gerundet. Taschenrechner und Eingabe-Tasten
zeigen einen Punkt statt Komma, die Lösungskontrolle versteht „Fr.“, „CHF“ und „Rp.“. An der Kasse
gibt es „Weggli“ statt „Semmel“, und die Kundschaft sagt „Auf Wiedersehen!“. Die Änderungen stehen in `tools/chf.mjs`; der Build bricht ab, wenn eine neue Version
des Hefts nicht mehr dazu passt.

## Aufbau

- `upstream/Lernsachen-Heft.html` – die Originaldatei (einzige Quelle)
- `tools/build.mjs` – erzeugt daraus `index.html`, `manifest.webmanifest`, `icons/`, `sw.js`
- `tools/sw.template.js` – Vorlage für den Service Worker

## Neue Version des Hefts übernehmen

1. Neue `Lernsachen-Heft.html` nach `upstream/` kopieren
2. `node tools/build.mjs`
3. Committen und pushen. Die Version in `sw.js` ergibt sich automatisch aus dem Inhalt;
   installierte Geräte laden die neue Version im Hintergrund und zeigen sie nach dem
   nächsten vollständigen Schließen und Öffnen der App.

## Hinweise

- Die Hefte liegen im Speicher des Browsers (IndexedDB) – pro Gerät und pro Adresse. Auf dem
  iPhone/iPad hat die Home-Bildschirm-App einen eigenen Speicher, getrennt von Safari.
- „Schiebesachen“ und „Textsachen“ lädt die App von majort0m0.github.io nach; die brauchen Internet.
