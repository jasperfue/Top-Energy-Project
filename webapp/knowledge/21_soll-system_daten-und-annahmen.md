
# Soll-System – Daten

Dieses Dokument enthält die wichtigsten numerischen Daten zum Soll-Zustand.  Hier werden nur zusätzliche Daten zum Ist-Zustand aufgeführt, sofern diese sich geändert haben. Der Strombedarf, Stromtarif, Wärmebedarf, Kältebedarf, Brennstofftarif und Kälteerzeugung bleiben unverändert zum Ist-Zustand. Die Ist-Zustand-Komponenten bleiben im Soll-Zustand weiterhin bestehen und werden mit neuen Komponenten erweitert.

## Photovoltaikanlage (PV)

| Parameter                              | Wert      | Einheit | Anmerkung                                      |
|----------------------------------------|-----------|---------|------------------------------------------------|
| Größe                                  | `3.041`   | m²      | von Verfügbaren 4000 m²                        |
| Installierte Anlagenpeakleistung (STC) | `684,43`  | kW      |                                                |
| Abgegebene elektrische Leistung        | `672,79`  | MWh/a   |                                                |
| Neigungswinkel                         | `30`      | Grad    |                                                |
| Investitionskosten                     | `400.000` | €       |                                                |
| Betriebskosten                         | `6.000`   | €/a     | Betriebskosten pro Investitionskosten: 1,5 %/a |

## Stromspeicher (Batteriespeicher)

| Parameter                  | Wert      | Einheit                 | Anmerkung                                    |
|----------------------------|-----------|-------------------------|----------------------------------------------|
| Optimale Speicherkapazität | `321,48`  | kWh                     |                                              |
| Vollladezyklen             | `267,83`  | Vollladezyklen pro Jahr |                                              |
| Investitionskosten         | `73.524`  | €                       |                                              |
| Betriebskosten             | `1.470,5` | €/a                     | Betriebskosten pro Investitionskosten: 2 %/a |


## Wärmepumpe

| Parameter                         | Wert     | Einheit | Anmerkung                                      |
|-----------------------------------|----------|---------|------------------------------------------------|
| Optimale Nennleistung             | `50`     | kW      | thermisch                                      |
| Aufgenommene elektrische Leistung | `26,185` | MWh     |                                                |
| Aufgenommene Wärmeleistung        | `100,31` | MWh     |                                                |
| Investitionskosten                | `25.000` | €       |                                                |
| Betriebskosten                    | `375`    | €/a     | Betriebskosten pro Investitionskosten: 1,5 %/a |

## Co₂-Emissionen im Soll-Zustand

| Parameter                       | Wert       | Einheit | Anmerkung                                                                   |
|---------------------------------|------------|---------|-----------------------------------------------------------------------------|
| CO₂-Emissionen aus Strombezug   | `17,266`   | t/a     | Reduktion durch PV-Eigenverbrauch                                           |
| CO₂-Emissionen aus Brennstoff   | `0,012251` | t/a     | Reduktion durch Wärmepumpe                                                  |
| Vermiedene CO₂-Emissionen Strom | `-36,171`  | t/a     | Durch PV-Einspeisung ersetzter Netzstrom → als negative Emission bilanziert |
| Summe CO₂-Emissionen            | `-18,893`  | t/a     |                                                                             |



# Summe Kosten/Erlöse im Soll-Zustand

| Parameter              | Wert        | Einheit | Anmerkung                                                                                                   |
|------------------------|-------------|---------|-------------------------------------------------------------------------------------------------------------|
| Summe Stromkosten      | `88.350`    | €/a     | **ohne** Berücksichtigung von Einspeiseerlösen                                                              |
| Summe Erlöse           | `20.960`    | €/a     | Einnahmen aus Stromeinspeisung (werden erst bei den Gesamtkosten abgezogen)                                 |
| Summe Brennstoffkosten | `505,73`    | €/a     | von Heißwasserkessel                                                                                        |
| Gesamte Betriebskosten | `96.701,23` | €/a     | = Stromkosten (Netzbezug) + Brennstoffkosten + Betriebskosten der neuen Komponente - Erlöse aus Einspeisung |
| Investitionskosten     | `498.524`   | €       | Summe der Investitionskosten für die 3 neuen Komponenten                                                    |
| Amortisationszeit      | `5,95`      | Jahre   |                                                                                                             |






