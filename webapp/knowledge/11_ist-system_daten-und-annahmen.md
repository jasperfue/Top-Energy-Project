
# Ist-System – Daten

Dieses Dokument enthält die wichtigsten numerischen Daten und Modellannahmen zum Ist-Zustand.

## Strombedarf und Lastprofil

- Jährlicher Strombedarf: 
  - Insgesamt: `395,22` MWh/a
  - Mittelwert: `45,115` kW
  - Maximalwert: `352,80` kW
  - Minimalwert: `11,20` kW
  - Standardabweichung: `37,174` kW
- Zeitauflösung: `15` Minuten
- Besonderheiten:
    - In diesem Strombedarf ist die Kälteanlage noch nicht berücksichtigt. Sodass der tatsächliche Strombedarf höher liegt.

## Stromtarif

| Tarifkomponente       | Wert      | Einheit |
|-----------------------|-----------|---------|
| Arbeitspreis          | `24,920`  | ct/kWh  |
| Leistungspreis        | `153,55`  | €/kW/a  |
| Einspeisevergütung    | `6,2`     | ct/KWh  |
| Summe der Stromkosten | `177.250` | €/a     |


## Brennstofftarif

| Parameter                    | Wert           | Einheit |
|------------------------------|----------------|---------|
| Brennstoffpreis              | `8`            | ct/kWh  |
| Grundpreis                   | `500`          | €/a     |
| Preis CO2-Zertifikate        | `70`           | €/t     |
| CO2-Emissionsfaktor (Hi/Hu)  | `0,201`        | t/MWh   |
| Preissteigerung              | `3`            | %/a     |
 | Summe aller Brennstoffkosten | `13.032`       | €/a     |


## Wärmebedarf (Winter)

| Parameter              | Wert     | Einheit | Anmerkung                    |
|------------------------|----------|---------|------------------------------|
| Jährlicher Wärmebedarf | `126,54` | MWh/a   | inkl. Raumheizung/Warmwasser |
| Mittelwert             | `14,446` | kW      |                              |
| Minimum                | `0`      | kW      | von ca. Mai bis Oktober      |
| Maximum                | `57,7`   | kW      |                              |


## Heißwasserkessel

| Parameter                       | Wert     | Einheit | Anmerkung              |
|---------------------------------|----------|---------|------------------------|
| Nennleistung                    | `256`    | kW      | thermisch              |
| Nennwirkungsgrad                | `95`     | %       | thermisch              |
| Brennstoffnennleistung          | `269,47` | kW      |                        |
| Abgegebene Wärmeleistung        | `126,54` | MWh/a   | Entspricht Wärmebedarf |
| Aufgenommene Brennstoffleistung | `133,21` | MWh/a   |                        |



# Kältebedarf (Sommer)

| Parameter              | Wert   | Einheit | Anmerkung               |
|------------------------|--------|---------|-------------------------|
| Jährlicher Kältebedarf | `350`  | MWh/a   |                         |
| Grenztemperatur        | `25`   | °C      |                         |
| Zieltemperatur         | `21`   | °C      |                         |


## Kälteerzeugung (Kompressionskältemaschine)

| Parameter                         | Wert    | Einheit | Anmerkung              |
|-----------------------------------|---------|---------|------------------------|
| Kälteleistung (Nenn)              | `2.000` | kW      |                        |
| Nennkälteleistungszahl (ERR)      | `5`     | -       |                        |
| Antriebsleistung                  | `400`   | kW      | elektrisch             |
| Aufgenommene elektrische Leistung | `70`    | MWh/a   |                        |
| Abgegebene Kälteleistung          | `350`   | MWh/a   | entspricht Kältebedarf |

