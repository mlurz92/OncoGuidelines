# OncoGuidelines - A Clinical Guideline Navigator

## Projektbeschreibung

OncoGuidelines ist eine hochmoderne Webanwendung, die für den klinischen Einsatz konzipiert wurde, um medizinisches Fachpersonal bei der Navigation und Anwendung von onkologischen Leitlinien für die bildgebende Diagnostik zu unterstützen. Das Kernziel der Anwendung ist es, eine schnelle, intuitive und fehlerfreie Referenz für stadien- und krankheitsgerechte diagnostische Pfade bereitzustellen und somit Über- und Unterdiagnostik zu vermeiden.

Die Anwendung visualisiert die Daten aus der `OncoGuidelines.json`-Datenbank, die Empfehlungen von verschiedenen onkologischen Fachgesellschaften enthält. Sie bietet eine klare, strukturierte und interaktive Oberfläche, um die Effizienz im klinischen Alltag zu steigern und eine optimale Patientenversorgung zu gewährleisten.

## UI/UX-Konzept: "Der Dynamische Pfad"

Das Design der Anwendung basiert auf dem Konzept "Der Dynamische Pfad". Es zeichnet sich durch eine moderne "Liquid Glass"-Ästhetik aus, die auf Transparenzen, weichen Unschärfe-Effekten und flüssigen Animationen basiert. Diese Gestaltung schafft eine angenehme und hochfunktionale Benutzererfahrung, die sich von traditioneller Kliniksoftware abhebt und eine intuitive Interaktion fördert.

## Kernfunktionen

*   **Dynamische Navigation:** Eine mehrstufige, ausklappbare Seitenleiste ermöglicht eine schnelle Auswahl von Tumorentitäten, deren Subtypen und den dazugehörigen Leitlinien.
*   **Tab-basierte Ansicht:** Ein schneller Wechsel zwischen den Leitlinien verschiedener Fachgesellschaften für dieselbe Tumorentität wird durch eine intuitive Tab-Navigation am oberen Rand des Inhaltsbereichs ermöglicht.
*   **Chronologische Darstellung:** Die Leitlinien-Empfehlungen werden in einer übersichtlichen, chronologischen Zeitstrahl-Ansicht präsentiert, die den diagnostischen Pfad von der Erstdiagnose bis zur Nachsorge abbildet.
*   **Visuelle Indikatoren:** Die Empfehlungsstärke (z.B. "Soll", "Sollte", "Kann", "Soll nicht") wird durch farbige Leuchtstreifen an den Empfehlungskarten klar und auf einen Blick erkennbar gemacht.
*   **Interaktive Detailansicht:** Empfehlungskarten können per Klick flüssig animiert erweitert werden, um detaillierte Informationen wie Begründungen, Patientengruppen und Quellentexte anzuzeigen.
*   **Heller & Dunkler Modus:** Ein per Schalter wählbarer Hell- und Dunkel-Modus sorgt für optimale Lesbarkeit unter verschiedenen Lichtbedingungen.

## Dateistruktur

Das Projekt ist wie folgt strukturiert:

```
OncoGuidelines/
├── index.html
├── README.md
├── data/
│   └── OncoGuidelines.json
├── script/
│   ├── main.js
│   ├── ui.js
│   └── data.js
└── style/
    └── style.css
```

---
