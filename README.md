
# Woodcutters

## Einleitung

Woodcutters ist ein simples Planspiel welches im Browser miteinander gespielt werden kann.
Planspiele sind lernorientierte Spiele, die in der politischen Bildung eingesetzt werden, 
um komplexe Zusammenhänge zu vermitteln. Oft beziehen sich diese Spiele auf Konzepte aus den Bereichen
Politik, Wirtschaft oder Umwelt.

In Woodcutters schlüpfen die Spieler in die Rolle von Holzfällerunternehmen, die in erster Linie möglichst viel
Holz für Ihre Produktion sammeln müssen. Dabei wird schnell klar, dass es konkurrierende Firmen gibt, die ebenfalls
das meiste für sich beanspruchen wollen und ein Maximumsprinzip keine hohe Gewinnwahrscheinlichkeit hat. 
Der Wald erneuert sich jedoch nur langsam, sodass die Spieler sich überlegen müssen, 
wie sie gemeinsam den Wald nachhaltig nutzen können und welche Regeln sie dafür aufstellen wollen.

Weitere Spiele dieser Art sind bei der 
[Bundeszentrale für politische Bildung](https://www.bpb.de/lernen/angebote/planspiele/datenbank-planspiele/)
zu finden.

## Spielen

### Variante 1: Direkt im Browser spielen

Das Spiel kann unter https://woodcutters.mathia.xyz/ gespielt werden.

### Variante 2: Eigenen Server hosten

#### Voraussetzungen

- Node.js
- npm
- git

#### Installation

```bash
git clone https://github.com/LeTammo/woodcutters.git
cd woodcutters/client
npm install
npm run build
cd ../server
npm install
npm start
```
