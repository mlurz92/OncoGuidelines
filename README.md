### Dokumentation: Diagnostische Patientenpfade

#### Kompakte Anwendungsbeschreibung

#### Datenbasis der Anwendung

Die Anwendung basiert auf einer sorgfältig kuratierten Wissensdatenbank, die evidenzbasierte Leitlinienempfehlungen zur bildgebenden Diagnostik in der Onkologie bündelt.

*   **Fachgesellschaften:** Die Inhalte stammen von **3** führenden europäischen und deutschen Fachgesellschaften:
    *   **AWMF-DKG** (Arbeitsgemeinschaft der Wissenschaftlichen Medizinischen Fachgesellschaften / Deutsche Krebsgesellschaft)
    *   **DGHO** (Deutsche Gesellschaft für Hämatologie und Medizinische Onkologie)
    *   **ESMO** (European Society for Medical Oncology)
*   **Die Datenbank umfasst:**
    *   Haupttumorentitäten (z.B. Lungenkarzinom, Mammakarzinom)
    *   Spezifische Subtypen und Leitlinien-Gruppen (z.B. Kleinzelliges Lungenkarzinom, Frühes Mammakarzinom)
    *   Einzelne, detaillierte Empfehlungen für diagnostische Verfahren

#### Funktionalität der Anwendung

"Diagnostische Patientenpfade" ist ein interaktives Nachschlagewerk, das medizinischem Fachpersonal einen schnellen und strukturierten Zugriff auf diese Leitlinien ermöglicht.

*   **Zweck:** Unterstützung bei klinischen Entscheidungen in der bildgebenden Diagnostik durch eine übersichtliche und praxisnahe Aufbereitung aktueller Leitlinien.
*   **Kernfunktionen:**
    *   **Schnellsuche & Navigation:** Einfaches und schnelles Auffinden von Leitlinien für eine bestimmte Tumorentität über eine Suchfunktion und eine klare Menüstruktur.
    *   **Strukturierte Darstellung:** Die Empfehlungen werden nicht als Fließtext, sondern übersichtlich nach klinischen Situationen gegliedert angezeigt, z.B.:
        *   Früherkennung / Screening
        *   Erstdiagnose / Staging
        *   Therapiekontrolle
        *   Nachsorge
        *   Rezidivdiagnostik
    *   **Filter & Sortierung:** Innerhalb einer Leitlinie können die Empfehlungen nach Modalität (CT, MRT etc.) und Empfehlungsstärke gefiltert sowie alphabetisch oder nach Relevanz sortiert werden, um die Ansicht zu personalisieren.
    *   **Interaktive Empfehlungskarten:** Jede Empfehlung wird auf einer interaktiven "Karte" dargestellt, die standardmäßig nur die wichtigsten Informationen anzeigt. Ein Klick klappt die Karte auf und offenbart alle relevanten Details: Verfahren, Empfehlungsstärke (farblich kodiert), Begründung und Originaltext aus der Leitlinie.

*   **Alleinstellungsmerkmal – Der individuelle Patientenpfad:**
    *   **Erstellen:** Anwender können per Klick relevante Empfehlungen aus verschiedenen Leitlinien für einen spezifischen Patientenfall zu einem individuellen "Diagnostischen Patientenpfad" zusammensetzen.
    *   **Verwalten:** Der erstellte Pfad kann jederzeit eingesehen, bearbeitet und geleert werden.
    *   **Exportieren & Teilen:** Der Pfad lässt sich als übersichtliche Textdatei (TXT) exportieren oder direkt als druckfreundliche Version (PDF) ausgeben, um ihn beispielsweise in die Patientenakte zu integrieren oder im Team zu besprechen.

*   **Benutzerfreundlichkeit:**
    *   Die Anwendung ist für alle Endgeräte (PC, Tablet, Smartphone) optimiert.
    *   Ein heller und ein dunkler Anzeigemodus sorgen für angenehmes Arbeiten bei allen Lichtverhältnissen.

#### 1. Einleitung

"Diagnostische Patientenpfade" ist eine hochspezialisierte Progressive Web App (PWA), die als interaktives, klinisches Nachschlagewerk für die bildgebende Diagnostik in der Onkologie konzipiert wurde. Die Anwendung richtet sich an medizinisches Fachpersonal wie Radiologen, Onkologen und Kliniker und hat zum Ziel, einen schnellen, strukturierten und evidenzbasierten Zugriff auf die aktuellen Leitlinienempfehlungen führender Fachgesellschaften (DGHO, AWMF-DKG, ESMO) zu ermöglichen.

Das Kernstück der Anwendung ist die intuitive Darstellung diagnostischer Pfade für verschiedene Tumorentitäten, unterteilt nach klinischen Situationen wie Erstdiagnose, Staging, Therapiekontrolle und Nachsorge. Ein Alleinstellungsmerkmal ist die innovative Funktionalität, mit der Nutzer individuelle diagnostische Pfade für ihre Patienten zusammenstellen, speichern, drucken und exportieren können, was die Anwendung zu einem wertvollen Werkzeug in der täglichen klinischen Praxis macht.

#### 2. Verzeichnisstruktur

Die Anwendung ist modular und klar strukturiert. Das Hauptverzeichnis `OncoGuidelines/` enthält alle für den Betrieb notwendigen Dateien:

OncoGuidelines/
├── index.html
├── manifest.json
├── script.js
├── style.css
└── data/
├── logo_icon_horizontal.svg
├── JSON-Schema.json
├── logo.svg
├── OncoGuidelines.json
└── Tabellen.md

#### 3. Architektur und Technologien

Die Anwendung ist als clientseitige Single-Page-Application (SPA) ohne externe Framework-Abhängigkeiten realisiert, was für maximale Performance und Wartbarkeit sorgt.

*   **`index.html`**: Bildet die semantische HTML5-Grundstruktur der Anwendung ab. Alle dynamischen Inhalte werden per JavaScript in die vordefinierten Container-Elemente (`#sidebarContent`, `#guidelineContainer` etc.) geladen.
*   **`script.js`**: Das Herzstück der Anwendungslogik. Eine einzelne Klasse `PatientenpfadeApp` kapselt die gesamte Funktionalität, von der Datenladung über das Rendering der Benutzeroberfläche bis hin zur Interaktionslogik. Dies folgt einem objektorientierten Ansatz in modernem ES6+ JavaScript.
*   **`style.css`**: Verantwortlich für das gesamte visuelle Erscheinungsbild. Es nutzt moderne CSS3-Features wie CSS-Variablen (Custom Properties) für ein flexibles Theming (Dark/Light Mode), Flexbox und Grid für responsive Layouts sowie feingranulare Stilregeln für ein kohärentes Design.
*   **`manifest.json`**: Definiert das Verhalten der Anwendung als Progressive Web App (PWA). Dies ermöglicht die "Installation" auf dem Homescreen von mobilen Geräten und Desktops, Offline-Fähigkeiten und eine App-ähnliche User Experience.
*   **Daten-Verzeichnis (`data/`)**: Enthält alle statischen Assets und die Kerndaten der Anwendung.

#### 4. Datenmodell: Die `OncoGuidelines.json` als unveränderliche Datenbank

Die zentrale und **unveränderliche Wissensdatenbank** der Anwendung ist die Datei `OncoGuidelines.json`. Ihre Struktur ist streng hierarchisch und wird durch die `JSON-Schema.json` validiert, was eine hohe Datenkonsistenz und -integrität sicherstellt. Die Struktur ist wie folgt aufgebaut:

1.  **`tumorEntities`**: Ein Array von Tumor-Hauptgruppen (z.B. "Akute Lymphatische Leukämie (ALL)").
2.  **`subtypes`**: Jede Entität enthält ein Array von Subtypen. Dies ermöglicht eine feingranulare Gliederung (z.B. "Diffuses großzelliges B-Zell-Lymphom (DLBCL)").
3.  **`guidelines`**: Jeder Subtyp enthält ein Array von Leitlinien verschiedener Fachgesellschaften (z.B. DGHO, AWMF-DKG). Jede Leitlinie ist ein Objekt mit Metadaten wie Titel, Version und Quelle.
4.  **`recommendationGroups`**: Jede Leitlinie gruppiert ihre Empfehlungen in logische Blöcke, die als Schlüssel-Wert-Paare gespeichert sind. Der Schlüssel repräsentiert die klinische Situation (z.B. "Erstdiagnose/Staging").
5.  **`recommendations`**: Der Wert ist ein Array von einzelnen Empfehlungsobjekten. Jedes dieser Objekte ist hochstrukturiert und enthält detaillierte Felder wie `procedure`, `modality`, `recommendationStrength`, `justification` und den `sourceText`.

Diese Struktur ermöglicht es der Anwendung, die Daten effizient zu laden, zu filtern und dynamisch darzustellen, ohne dass serverseitige Logik erforderlich ist.

#### 5. Benutzeroberfläche (UI) und User Experience (UX)

Das UI ist minimalistisch, funktional und auf eine schnelle Informationserfassung im klinischen Alltag ausgelegt. Es ist vollständig responsiv und passt sich nahtlos an Desktop-, Tablet- und Smartphone-Bildschirme an.

##### 5.1. Globale Elemente

*   **Theme-Toggle**: Ein schwebender Button (oben rechts) mit "Glassmorphism"-Effekt (transparenter, verschwommener Hintergrund), der einen nahtlosen Wechsel zwischen einem hellen und einem dunklen Farbschema ermöglicht. Ein sanfter Rotations- und Fading-Effekt der Sonnen- und Mond-Icons (Lucide Icons) begleitet den Wechsel.
*   **Lade-Overlay**: Ein vollflächiges Overlay mit einem dezenten Spinner, das bei initialer Datenladung erscheint, um dem Nutzer Feedback über den Ladevorgang zu geben.
*   **Mobile Navigation Toggle**: Auf kleineren Bildschirmen erscheint oben links ein "Burger-Menü"-Icon, das die Sidebar ein- und ausblendet.

##### 5.2. Sidebar (Navigation)

Die linke Sidebar ist das primäre Navigationsinstrument.

*   **Header**:
    *   **Logo & Titel**: Ein animiertes, horizontales SVG-Logo, das einen stilisierten diagnostischen Pfad mit vier vernetzten Knotenpunkten darstellt. Die Animation zeichnet beim Laden der Seite zuerst den Pfad und dann nacheinander die einzelnen Knotenpunkte, was einen dynamischen und hochwertigen ersten Eindruck schafft. Daneben steht der Titel "Patientenpfade".
    *   **Suche**: Ein prominentes Suchfeld (`<input type="text">`) mit einem Lupen-Icon ermöglicht das Filtern der Tumor-Entitäten in Echtzeit. Der Platzhalter "Tumorentität suchen..." leitet den Nutzer an. Das Suchfeld ist per Tastaturkürzel `Strg+K` (oder `Cmd+K`) direkt erreichbar.
*   **Navigationsliste**:
    *   Die Liste der Tumorentitäten wird dynamisch aus der `OncoGuidelines.json` generiert.
    *   Entitäten mit mehreren Subtypen sind als ausklappbare Akkordeon-Elemente gestaltet, erkennbar an einem Chevron-Icon, das sich bei Aktivierung um 180° dreht.
    *   Der aktive Navigationspunkt (Entität oder Subtyp) wird durch eine rote Hintergrundfarbe und weiße Schrift hervorgehoben, um eine klare visuelle Orientierung zu bieten.

##### 5.3. Hauptinhaltsbereich

Der rechte, größere Bereich dient der Darstellung der Leitlinieninhalte.

*   **Header**: Ein "sticky" Header bleibt beim Scrollen sichtbar und enthält:
    *   **Titel der Entität**: Zeigt den Namen der ausgewählten Tumorentität und ggf. des Subtyps an.
    *   **Leitlinien-Tabs**: Reiter für jede verfügbare Fachgesellschaft (z.B. "DGHO", "AWMF-DKG"). Der aktive Tab ist visuell hervorgehoben und unterstreicht die aktive Leitlinie mit einer farbigen Linie in der jeweiligen Farbe der Fachgesellschaft (Blau für DGHO, Grün für AWMF-DKG, Orange für ESMO).
    *   **Filter- & Sortierleiste**: Unterhalb der Tabs befindet sich eine Leiste mit interaktiven Optionen, um die angezeigten Empfehlungen zu verfeinern. Nutzer können nach Modalität (z.B. CT, MRT) und Empfehlungsstärke filtern. Zusätzlich ermöglicht ein Suchfeld die Volltextsuche innerhalb der Karten, und ein Dropdown-Menü erlaubt die Sortierung nach Standard, Empfehlungsstärke oder alphabetisch.
*   **Willkommensbildschirm**: Der initiale Zustand des Hauptbereichs, der den Nutzer mit dem Logo und einer kurzen Anleitung begrüßt.
*   **Timeline-Container**: Nach Auswahl einer Entität wird hier der Inhalt dargestellt.
    *   **Klinische Phasen**: Die Empfehlungen sind chronologisch nach klinischen Phasen (z.B. "Erstdiagnose/Staging", "Nachsorge") gruppiert. Jede Phase wird durch eine Überschrift eingeleitet, die auf einer durchgehenden horizontalen Linie liegt, um den Zeitstrahl-Charakter zu unterstreichen. Ein "Alle umschalten"-Button erlaubt das gleichzeitige Auf- und Zuklappen aller Karten einer Phase.
    *   **Empfehlungs-Grid**: Innerhalb jeder Phase werden die Empfehlungskarten in einem responsiven Grid-Layout angeordnet.

##### 5.4. Die Empfehlungskarte

Die Empfehlungskarte ist das zentrale UI-Element zur Darstellung einer einzelnen diagnostischen Maßnahme. Sie ist hochgradig strukturiert und für eine schnelle Informationsaufnahme optimiert, indem sie standardmäßig eine Kompaktansicht bietet.

*   **Kompakt- & Detailansicht**: Jede Karte wird zunächst in einer kompakten Ansicht angezeigt, die nur den Header mit den wichtigsten Informationen enthält. Ein Klick auf die Karte klappt den Detailbereich mit einer sanften Animation auf, um alle weiteren Informationen wie Region, Begründung und Originaltext preiszugeben. Dies sorgt für eine deutlich bessere Übersichtlichkeit.
*   **Struktur und Hervorhebung**: Jede Karte hat eine farbige obere Bordüre, deren Farbe die Verbindlichkeit der Empfehlung signalisiert:
    *   **Grün**: Empfohlen / Soll / Obligat
    *   **Gelb/Orange**: Kann erwogen werden / Optional / Fakultativ
    *   **Rot**: Nicht empfohlen
*   **Karten-Header (Kompaktansicht)**:
    *   **Verfahrensname**: Prominent in großer, fetter Schrift (z.B. "MRT des Beckens").
    *   **Empfehlungs-Metadaten**: Direkt unter dem Verfahrensnamen befindet sich eine Zeile mit den wichtigsten Bewertungskriterien:
        *   **Empfehlungsstärke (Text)**: Der exakte Wortlaut (z.B. "Soll", "Kann erwogen werden") in der zur Kategorie passenden Farbe.
        *   **Empfehlungsgrad & Evidenzlevel**: Als kleine, graue Badges (z.B. "Grad: A", "Evidenz: III") dargestellt, um die wissenschaftliche Grundlage klar zu kennzeichnen. Diese Badges sind **interaktiv**: Ein Klick auf das Info-Icon neben dem Badge öffnet einen Tooltip mit einer kurzen, kontextbezogenen Erklärung des jeweiligen Klassifikationssystems (z.B. AWMF oder ESMO). Dies ermöglicht es dem Anwender, die wissenschaftliche Güte einer Empfehlung direkt und ohne externes Nachschlagen einzuordnen. Der Tooltip verschwindet wieder, wenn die Maus das Icon verlässt oder an eine andere Stelle geklickt wird.
    *   **Modalitäts-Badge**: Ein Badge, das die bildgebende Modalität angibt (z.B. "MRT").
    *   **Aktionen**: Auf der rechten Seite befinden sich zwei interaktive Elemente:
        *   **Stärke-Indikator**: Ein großer Kreis, der die Empfehlungsstärke durch ein Symbol (✓, ○, ✗) und die entsprechende Farbe visuell zusammenfasst.
        *   **Zum Pfad hinzufügen**: Ein Button mit einem Plus-Icon, das sich bei Hinzufügen zum Patientenpfad in ein grünes Häkchen-Icon ändert.
*   **Detail-Bereich (wird aufgeklappt)**: Eine klar strukturierte Tabelle listet weitere Details auf: Region, Details, Stadium, Patientengruppe, Häufigkeit.
*   **Ausklappbare Bereiche (innerhalb des Detail-Bereichs)**:
    *   **Begründung**: Ein Button mit dem Text "Begründung anzeigen" (in einem dezenten Blau) klappt bei Klick einen Bereich mit der detaillierten Begründung aus der Leitlinie auf. Ein Chevron-Icon visualisiert den Zustand (offen/geschlossen).
    *   **Originaltext**: Ein weiterer blauer Button "Originaltext anzeigen" klappt den exakten Quelltext aus der Leitlinie (`sourceText`) auf. Dieser wird zur klaren Abgrenzung kursiv und mit einem linken Randbalken dargestellt.

##### 5.5. "Diagnostischer Patientenpfad"-Funktion

*   **Floating Action Button (FAB)**: Sobald die erste Empfehlung hinzugefügt wird, erscheint unten rechts ein roter, schwebender Button mit einem Clipboard-Icon. Ein kleiner Badge auf dem FAB zeigt die Anzahl der hinzugefügten Empfehlungen an.
*   **Modal-Fenster**: Ein Klick auf den FAB öffnet ein bildschirmfüllendes Modal mit einem Weichzeichner-Effekt auf dem Hintergrund.
    *   **Header**: Enthält den Titel "Diagnostischer Patientenpfad" und Aktions-Buttons für "Als TXT exportieren", "Drucken / PDF" und "Pfad leeren".
    *   **Inhalt**: Zeigt die Liste der hinzugefügten Empfehlungen in einer vereinfachten Kartenansicht. Jede Karte hat einen "Entfernen"-Button. Ist der Pfad leer, wird eine freundliche Aufforderung zum Hinzufügen von Empfehlungen angezeigt.

#### 6. Farbschema und Designsprache

Das Design orientiert sich am Corporate Design des Klinikums St. Georg Leipzig und nutzt dessen Hauptfarben, um eine professionelle und wiedererkennbare Ästhetik zu schaffen. Die Anwendung verwendet zwei Haupt-Themes: einen hellen und einen dunklen Modus.

**Primärfarben (Corporate Design)**

| Farbe | RGB-Wert | Hex-Code | Verwendung |
| :--- | :--- | :--- | :--- |
| **Signalrot** | `rgb(227, 0, 11)` | `#e3000b` | Hauptakzentfarbe für aktive Elemente (Navigationspunkte, Suchfokus), Logo, FAB. |
| **Dunkelgrau** | `rgb(85, 85, 84)` | `#555554` | Primäre Textfarbe im hellen Modus, Hintergrund für aktive Elemente in der Sidebar. |
| **Weiß** | `rgb(255, 255, 255)` | `#ffffff` | Hintergrund für Karten im hellen Modus, primäre Textfarbe bei roten Hintergründen. |

**Sekundär- und Funktionsfarben**

| Farbe | Hex-Code (Hell / Dunkel) | Verwendung |
| :--- | :--- | :--- | :--- |
| **Erfolg (Grün)** | `#10b981` | Positive Empfehlungen (Soll, Empfohlen). |
| **Warnung (Gelb)** | `#f59e0b` | Neutrale/optionale Empfehlungen (Kann erwogen werden). |
| **Gefahr (Rot)** | `#ef4444` | Negative Empfehlungen (Nicht empfohlen), "Pfad leeren"-Button. |
| **Interaktiv (Blau)** | `#3b82f6` / `#60a5fa` | Text-Buttons zum Ausklappen von Inhalten ("Begründung", "Originaltext"). |
| **DGHO-Blau** | `#2563eb` | Akzentfarbe für den aktiven DGHO-Leitlinien-Tab. |
| **AWMF-Grün** | `#16a34a` | Akzentfarbe für den aktiven AWMF-DKG-Leitlinien-Tab. |
| **ESMO-Orange** | `#ea580c` | Akzentfarbe für den aktiven ESMO-Leitlinien-Tab. |

#### 7. Funktionen im Detail

*   **Theming**: Wechsel zwischen Hell- und Dunkelmodus per Klick. Die Auswahl wird im `localStorage` des Browsers gespeichert. Tastaturkürzel: `Strg+D`.
*   **Suche**: Filtert die Navigationsliste in Echtzeit basierend auf der Eingabe. Sucht sowohl in Entitäts- als auch in Subtyp-Namen.
*   **Navigation**: Klicks auf Entitäten/Subtypen laden die entsprechenden Leitlinien dynamisch in den Hauptbereich. Der Zustand der Navigation (aktive Elemente, ausgeklappte Gruppen) wird visuell dargestellt.
*   **Leitlinien-Darstellung**: Zeigt die Empfehlungen gruppiert nach klinischer Phase an. Wechsel zwischen verschiedenen Leitlinien (Fachgesellschaften) über Tabs ist möglich. Die Ansicht kann über eine Filterleiste nach Modalität, Empfehlungsstärke und Freitext durchsucht und nach verschiedenen Kriterien sortiert werden.
*   **Patientenpfad-Management**:
    *   **Hinzufügen/Entfernen**: Empfehlungen können per Klick zu einem persönlichen Pfad hinzugefügt oder daraus entfernt werden. Der Zustand wird auf der Karte und am FAB-Zähler reflektiert.
    *   **Anzeigen**: Der zusammengestellte Pfad kann in einem Modal angezeigt werden.
    *   **Leeren**: Der gesamte Pfad kann mit einem Klick gelöscht werden.
    *   **Exportieren**: Der Pfad kann als strukturierte `.txt`-Datei exportiert werden, die eine Checkliste der Maßnahmen sowie Metadaten zur Leitlinie enthält.
    *   **Drucken**: Eine druckoptimierte Ansicht des Pfades wird generiert, die auch als PDF gespeichert werden kann.
*   **Interaktive Karten**: Die Karten sind standardmäßig eingeklappt und zeigen nur eine Zusammenfassung. Ein Klick klappt die Karte auf, um alle Details anzuzeigen. Innerhalb der Detailansicht können Begründungen und Originaltexte individuell ein- und ausgeklappt werden. Die Badges für Evidenzlevel und Empfehlungsgrad sind ebenfalls interaktiv und zeigen bei Klick detaillierte Erklärungen an.

#### 8. Zusammenfassung

Die Anwendung "Diagnostische Patientenpfade" ist ein durchdachtes, hochfunktionales und ästhetisch ansprechendes Werkzeug für den klinischen Alltag. Durch die Kombination einer soliden technischen Basis, einer streng strukturierten, unveränderlichen Datenbank und einer auf maximale Benutzerfreundlichkeit ausgelegten Oberfläche, bietet sie einen signifikanten Mehrwert für die evidenzbasierte Medizin. Die detaillierte und kontextsensitive Darstellung der Leitlinienempfehlungen, gepaart mit der innovativen Patientenpfad-Funktion, macht sie zu einem herausragenden Beispiel für ein modernes, digitales Clinical Decision Support System.