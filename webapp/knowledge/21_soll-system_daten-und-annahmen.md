
# Soll-System – Daten

Dieses Dokument enthält die wichtigsten numerischen Daten zum Soll-Zustand.  Hier werden nur zusätzliche Daten zum Ist-Zustand aufgeführt, sofern diese sich geändert haben. Der Strombedarf, Stromtarif, Wärmebedarf, Kältebedarf, Brennstofftarif und Kälteerzeugung bleiben unverändert zum Ist-Zustand. Die Ist-Zustand-Komponenten bleiben im Soll-Zustand weiterhin bestehen und werden mit neuen Komponenten erweitert.

## Photovoltaikanlage (PV)

| Parameter                                   | Wert      | Einheit | Anmerkung                                      |
|---------------------------------------------|-----------|---------|------------------------------------------------|
| Größe (PV)                                  | `3.041`   | m²      | von Verfügbaren 4000 m²                        |
| Installierte Anlagenpeakleistung (STC) (PV) | `684,43`  | kW      |                                                |
| Abgegebene elektrische Leistung (PV)        | `672,79`  | MWh/a   |                                                |
| Neigungswinkel (PV)                         | `30`      | Grad    |                                                |
| Investitionskosten (PV)                     | `400.000` | €       |                                                |
| Betriebskosten (PV)                         | `6.000`   | €/a     | Betriebskosten pro Investitionskosten: 1,5 %/a |

*Zusammenfassung für die Suche: Die Photovoltaikanlage (PV) im Soll-Zustand hat eine Größe von 3.041 m², eine installierte Peakleistung von 684,43 kW und erzeugt jährlich 672,79 MWh elektrischer Leistung. Die Investitionskosten betragen 400.000 €, mit jährlichen Betriebskosten von 6.000 €.*

## Stromspeicher (Batteriespeicher)

| Parameter                                  | Wert      | Einheit                 | Anmerkung                                    |
|--------------------------------------------|-----------|-------------------------|----------------------------------------------|
| Optimale Speicherkapazität (Stromspeicher) | `321,48`  | kWh                     |                                              |
| Vollladezyklen (Stromspeicher)             | `267,83`  | Vollladezyklen pro Jahr |                                              |
| Investitionskosten (Stromspeicher)         | `73.524`  | €                       |                                              |
| Betriebskosten (Stromspeicher)             | `1.470,5` | €/a                     | Betriebskosten pro Investitionskosten: 2 %/a |

*Zusammenfassung für die Suche: Der Stromspeicher im Soll-Zustand hat eine optimale Speicherkapazität von 321,48 kWh und kann 267,83 Vollladezyklen pro Jahr durchführen. Die Investitionskosten betragen 73.524 €, mit jährlichen Betriebskosten von 1.470,5 €.*


## Wärmepumpe

| Parameter                                      | Wert     | Einheit | Anmerkung                                      |
|------------------------------------------------|----------|---------|------------------------------------------------|
| Optimale Nennleistung (Wärmepumpe)             | `50`     | kW      | thermisch                                      |
| Aufgenommene elektrische Leistung (Wärmepumpe) | `26,185` | MWh     |                                                |
| Abgegebene Wärmeleistung (Wärmepumpe)          | `126,49` | MWh/a   |                                                |
| Investitionskosten (Wärmepumpe)                | `25.000` | €       |                                                |
| Betriebskosten (Wärmepumpe)                    | `375`    | €/a     | Betriebskosten pro Investitionskosten: 1,5 %/a |

*Zusammenfassung für die Suche: Die Wärmepumpe im Soll-Zustand hat eine optimale Nennleistung von 50 kW (thermisch), nimmt jährlich 26,185 MWh elektrische Leistung auf und liefert 260,49 MWh/a Wärmeleistung. Die Investitionskosten betragen 25.000 €, mit jährlichen Betriebskosten von 375 €.*

## CO₂-Emissionen im Soll-Zustand

| Parameter                       | Wert       | Einheit | Anmerkung                                                                   |
|---------------------------------|------------|---------|-----------------------------------------------------------------------------|
| CO₂-Emissionen aus Strombezug   | `17,266`   | t/a     | Reduktion durch PV-Eigenverbrauch                                           |
| CO₂-Emissionen aus Brennstoff   | `0,012251` | t/a     | Reduktion durch Wärmepumpe                                                  |
| Vermiedene CO₂-Emissionen Strom | `-36,171`  | t/a     | Durch PV-Einspeisung ersetzter Netzstrom → als negative Emission bilanziert |
| Summe CO₂-Emissionen            | `-18,893`  | t/a     |                                                                             |

*Zusammenfassung für die Suche: Im Soll-Zustand betragen die CO₂-Emissionen aus dem Strombezug 17,266 t/a und aus dem Brennstoff 0,012251 t/a. Durch die PV-Einspeisung werden 36,171 t/a vermieden, was zu einer negativen Gesamtemission von -18,893 t/a führt.*

# Summe Kosten/Erlöse im Soll-Zustand

| Parameter                       | Wert        | Einheit | Anmerkung                                                                                                   |
|---------------------------------|-------------|---------|-------------------------------------------------------------------------------------------------------------|
| Summe Stromkosten               | `88.350`    | €/a     | **ohne** Berücksichtigung von Einspeiseerlösen                                                              |
| Summe Erlöse                    | `20.960`    | €/a     | Einnahmen aus Stromeinspeisung (werden erst bei den Gesamtkosten abgezogen)                                 |
| Summe Brennstoffkosten          | `505,73`    | €/a     | von Heißwasserkessel                                                                                        |
| Betriebskosten neue Komponenten | `7.845,50`  | €/a     | Summe der Betriebskosten für Wärmepumpe, PV und Stromspeicher                                               |
| Gesamte Betriebskosten          | `75.741,23` | €/a     | = Stromkosten (Netzbezug) + Brennstoffkosten + Betriebskosten der neuen Komponente - Erlöse aus Einspeisung |
| Investitionskosten              | `498.524`   | €       | Summe der Investitionskosten für die 3 neuen Komponenten                                                    |
| Amortisationszeit               | `5,95`      | Jahre   |                                                                                                             |

*Zusammenfassung für die Suche: Im Soll-Zustand betragen die jährlichen Stromkosten 88.350 €, die Erlöse aus Stromeinspeisung 20.960 €, die Brennstoffkosten 505,73 € und die Betriebskosten für die neuen Komponenten 7.845,50 €. Damit belaufen sich die gesamten Betriebskosten auf 75.741,23 €. Die Investitionskosten für die neuen Komponenten betragen 498.524 €, mit einer Amortisationszeit von 5,95 Jahren.*






