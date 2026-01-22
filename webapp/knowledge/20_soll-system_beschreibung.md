# Soll-System – Beschreibung

Im Soll-Zustand wird das bestehende Energiesystem durch zusätzliche, effiziente und
erneuerbare Komponenten ergänzt. Ziel ist es, Betriebskosten zu reduzieren und als Nebeneffekt CO₂-Emissionen,
ohne die Versorgungssicherheit zu gefährden. Um das Optimum zu erreichen, wurden verschiedene Simulationen mit verschiedenen Komponenten durchgeführt und dieses Ergebnis als bestmögliche Lösung identifiziert.

## Neue Systemkomponenten

### Wärmepumpe

- Eine **elektrische Wärmepumpe** wird eingebunden, um einen signifikanten Anteil des
  Wärmebedarfs bereitzustellen.
- Sie nutzt Umwelt- oder Abwärmequellen (z. B. Außenluft, Prozessabwärme) und ersetzt
  teilweise die fossil befeuerte Wärmeerzeugung durch den Heißwasserkessel.

### Photovoltaikanlage (PV)

- Eine **PV-Anlage auf dem Betriebsdach** welches 4000 m² zur Verfügung hat erzeugt erneuerbaren Strom.
- Der erzeugte PV-Strom wird
    - vorrangig im Betrieb selbst verbraucht,
    - überschüssig ins Netz eingespeist oder
    - in den Stromspeicher geladen.

### Stromspeicher (Batteriespeicher)

- Ein **Batteriespeicher** erhöht den Eigenverbrauchsanteil des PV-Stroms und ermöglicht
  Lastverschiebung.
- Er kann:
    - günstige Strompreisphasen nutzen (Laden),
    - Lastspitzen kappen (Entladen),
    - den Betrieb bei PV-Überschuss entlasten.

## Zusammenspiel der Komponenten

- Die Wärmepumpe wird gezielt betrieben, um:
    - möglichst viel **PV-Strom** und
    - ggf. **günstige Strompreisphasen** zu nutzen.
- Der Stromspeicher glättet die Last und erhöht den **Eigenverbrauchsgrad** der PV-Anlage.
- Der Heißwasserkessel bleibt als **Backup** und Deckung von Lastspitzen im System,
  übernimmt aber einen geringeren Anteil der Jahreswärmeerzeugung.

Im Ergebnis verschiebt sich der Energiemix:
- weg von fossiler Wärmeerzeugung,
- hin zu strombasierter, teilweise erneuerbar gespeister Wärmeerzeugung (Wärmepumpe),
- mit höherem Eigenverbrauch von PV-Strom und reduziertem Netzstrombezug.

## Systemverhalten an beispielhaften Tagen

Um das Zusammenspiel der Komponenten zu verstehen, wird das System an zwei extremen Tagen betrachtet:

### Beispielhafter Sommertag (Juli/August)
An einem sonnigen Sommertag übersteigt die PV-Erzeugung (Peak bis zu 430 kW um die Mittagszeit) deutlich den Verbrauch.
- **Vormittags:** Die PV-Anlage deckt den kompletten Eigenverbrauch. Überschüsse werden genutzt, um den **Stromspeicher** (SOC steigt auf fast 100 %) zu laden. Sobald der Speicher voll ist (ca. 16:00 Uhr), wird die Energie ins Netz eingespeist.
- **Nachmittags/Abends:** Trotz hoher Kühllast (Kühltürme) bleibt der Netzbezug bei null, da der Speicher die Last abdeckt, bis seine Kapazität zur Neige geht.
- **Nachts:** Der Speicher versorgt den Betrieb teilweise bis in die frühen Morgenstunden, erst danach erfolgt ein minimaler Netzbezug.

### Beispielhafter Wintertag (Januar/Dezember)
Im Winter ist die PV-Erzeugung deutlich geringer (Peak ca. 190 kW) und die Tage sind kürzer. Die **Wärmepumpe** sorgt für eine zusätzliche Grundlast.
- **PV-Einfluss:** Nur in den Kernstunden (10:00 bis 14:00 Uhr) kann die PV-Anlage den Netzbezug signifikant reduzieren.
- **Speicher:** Der Speicher wird nur teilweise geladen (SOC erreicht oft nur 50 %) und ist bereits am frühen Abend entleert.
- **Netzbezug:** Das System ist im Winter stark auf Netzstrom angewiesen, da die PV-Leistung nicht ausreicht, um die Wärmepumpe und die Basislast vollständig zu decken.
