# Ist-System – Beschreibung

Dieses Dokument beschreibt das aktuelle Energiesystem (Ist-Zustand) des betrachteten Betriebs.
Alle technischen Details werden in einem separaten Dokument mit Daten und Annahmen ergänzt.

## Rolle des Energiesystems im Betrieb

- Der Betrieb ist ein kleines / mittleres Unternehmen mit **kontinuierlicher Produktion**.
- Es bestehen ganzjährige Anforderungen an:
    - **Kälte** (z. B. Prozesskälte, Raumkühlung),
    - **Wärme** (z. B. Raumheizung, Warmwasser, ggf. Prozesswärme),
    - **Strom** (Maschinen, Anlagen, Beleuchtung, IT).

Die Energieversorgung ist historisch gewachsen und überwiegend auf **Netzstrom** und
**brennstoffbasierte Wärmeerzeugung** ausgerichtet.

## Kältebedarf und Kühlung

- Im Ist-Zustand wird der Kältebedarf durch eine bzw. mehrere **konventionelle Kälteanlagen**
  (z. B. elektrisch betriebene Kompressionskältemaschinen) gedeckt.
- Die Kälteanlagen arbeiten **monovalent** (keine alternative Kälteerzeugung) und orientieren
  sich primär am Bedarf, nicht an Strompreissignalen.

## Strombedarf und Lastprofil

- Der **gesamte Strombedarf** wird aus dem öffentlichen Netz gedeckt.
- Ein **Lastprofil** (zeitaufgelöster Stromverbrauch) wurde aus realen Messdaten importiert.
- Das Lastprofil bildet:
    - typische Tagesgänge (z. B. Tag/Nacht),
    - Wochenmuster (Werktage vs. Wochenende),
    - ggf. saisonale Unterschiede ab.

Dieses Lastprofil dient als Grundlage für die Bewertung von Maßnahmen, die Strombezug,
Lastspitzen und Eigenverbrauch beeinflussen.

## Stromtarif

- Der Betrieb bezieht Strom zu einem **vertraglich vereinbarten Tarif**.
- Tarifbestandteile umfassen typischerweise:
    - Arbeitspreis [€/kWh],
    - Leistungspreis [€/kW],
    - Einspeisevergütung [ct/kWh]

Die konkrete Tarifsituation bestimmt den wirtschaftlichen Effekt von Lastverschiebung,
PV-Eigenverbrauch und Speicherbetrieb im Soll-Szenario.

## Brennstofftarif

- Für die Wärmeerzeugung (Heißwasserkessel) wird ein **Brennstoff** (z. B. Erdgas) bezogen.
- Der Brennstofftarif ist abgebildet über:
  - Arbeitspreis [ct/kWh Brennstoff]
  - Fixkosten [€/a]
  - CO₂-Kosten [€/t]
  - Preissteigerungsrate [%/a]

## Heißwasserkessel

- Ein **Heißwasserkessel** deckt aktuell den Großteil des Wärmebedarfs.
- Der Kessel wird mit dem im Brennstofftarif beschriebenen Energieträger betrieben.
- Der Betrieb ist primär lastgeführt:
    - Der Kessel startet, wenn Wärmebedarf besteht, ohne Kopplung an Strompreissignale.
    - Effizienz und Teillastverhalten werden im Daten-Dokument konkretisiert.

## Wärmebedarf

- Der Wärmebedarf setzt sich aus:
    - **Raumheizung**,
    - **Warmwasser** und
    - **Prozesswärme** zusammen.
- Die Versorgung erfolgt überwiegend über den Heißwasserkessel.
- Lastprofile für den Wärmebedarf wurden aus realen Daten abgeleitet und bilden 
  saisonale Schwankungen ab (höherer Bedarf im Winter, niedriger im Sommer).

Im Ist-Zustand ist das System somit **weitgehend fossil dominiert**, es wird **keine Energie selbst erzeugt**, und die bestehende Versorgung ist **nicht auf Effizienz oder systematische Optimierung** ausgelegt, bei gleichzeitig nur **begrenzter Nutzung erneuerbarer Quellen**.
