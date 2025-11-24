/**
 * Diagnostische Patientenpfade - Application Logic
 * Zentrale Steuerungsdatei für die Web-Applikation.
 * Behandelt Datenladung, Rendering, Interaktionen, State-Management
 * und die Logik für den diagnostischen Patientenpfad.
 */

// Definitionen für Tooltips (Evidenzlevel und Empfehlungsgrade)
const TOOLTIP_DATA = {
    'AWMF-DKG': {
        'EK': 'Expertenkonsens: Starke Empfehlung der Leitliniengruppe, basierend auf klinischer Erfahrung und Konsens.',
        'A': 'Starke Empfehlung (Soll): Die Maßnahme soll durchgeführt werden (hoher Nutzen, geringes Risiko).',
        'B': 'Empfehlung (Sollte): Die Maßnahme sollte durchgeführt werden (mäßiger Nutzen, Nutzen überwiegt Risiko).',
        '0': 'Empfehlung offen (Kann): Die Maßnahme kann erwogen werden (Nutzen und Risiko ausgeglichen oder unsicher).',
        'C': 'Empfehlung offen (Kann): Die Maßnahme kann erwogen werden.',
        '1': 'Evidenzlevel 1: Systematische Reviews von RCTs oder einzelne große RCTs.',
        '2': 'Evidenzlevel 2: Kohortenstudien oder Fall-Kontroll-Studien.',
        '3': 'Evidenzlevel 3: Fallserien oder nicht-analytische Studien.',
        '4': 'Evidenzlevel 4: Expertenmeinung.',
        '1a': 'Evidenzlevel 1a: Systematische Übersichtsarbeit von RCTs.',
        '1b': 'Evidenzlevel 1b: Einzelne RCT.',
        '2a': 'Evidenzlevel 2a: Systematische Übersichtsarbeit von Kohortenstudien.',
        '2b': 'Evidenzlevel 2b: Einzelne Kohortenstudie oder schlechtere RCT.',
        '3a': 'Evidenzlevel 3a: Systematische Übersichtsarbeit von Fall-Kontroll-Studien.',
        '3b': 'Evidenzlevel 3b: Einzelne Fall-Kontroll-Studie.'
    },
    'ESMO': {
        'I': 'Level I: Evidenz aus mindestens einer großen randomisierten, kontrollierten Studie.',
        'II': 'Level II: Evidenz aus kleinen randomisierten Studien oder großen prospektiven Kohortenstudien.',
        'III': 'Level III: Evidenz aus retrospektiven oder Fall-Kontroll-Studien.',
        'IV': 'Level IV: Evidenz aus Fallserien ohne Kontrollgruppe.',
        'V': 'Level V: Expertenmeinung ohne explizite kritische Bewertung.',
        'A': 'Grad A: Starke Evidenz für Wirksamkeit mit erheblichem klinischen Nutzen (Dringend empfohlen).',
        'B': 'Grad B: Starke oder moderate Evidenz für Wirksamkeit mit begrenztem klinischen Nutzen (Generell empfohlen).',
        'C': 'Grad C: Unzureichende Evidenz für Wirksamkeit oder kleiner klinischer Nutzen (Optional).',
        'D': 'Grad D: Moderate Evidenz gegen Wirksamkeit (Generell nicht empfohlen).',
        'E': 'Grad E: Starke Evidenz gegen Wirksamkeit (Niemals empfohlen).'
    },
    'DGHO': {
        'Standard': 'Empfohlen als medizinischer Standard.',
        'Option': 'Kann als Option in Betracht gezogen werden.',
        'Experimentell': 'Nur innerhalb von Studien empfohlen.',
        '[1]': 'Siehe Originalquelle für Details.',
        '[23]': 'Siehe Originalquelle für Details.'
    }
};

class PatientenpfadeApp {
    constructor() {
        // Application State
        this.data = null;
        this.state = {
            currentEntity: null,
            currentSubtype: null,
            currentGuideline: null,
            searchTerm: '',
            filters: {
                modality: new Set(),
                strength: new Set(),
                textSearch: ''
            },
            sortMethod: 'default', // 'default', 'strength', 'alphabetical'
            patientPath: [],
            darkMode: localStorage.getItem('theme') === 'dark'
        };

        this.activeTooltip = null;

        // DOM Elements Cache
        this.dom = {
            body: document.body,
            themeToggle: document.getElementById('themeToggle'),
            sidebar: document.getElementById('sidebar'),
            sidebarContent: document.getElementById('sidebarContent'),
            mainContainer: document.querySelector('.main-container'),
            mobileNavToggle: document.getElementById('mobileNavToggle'),
            searchInput: document.getElementById('searchInput'),
            guidelineHeader: document.getElementById('guidelineHeader'),
            entityTitle: document.getElementById('entityTitle'),
            entitySubtitle: document.getElementById('entitySubtitle'),
            societyTabs: document.getElementById('societyTabs'),
            filterBar: document.getElementById('filterBar'),
            modalityFilter: document.getElementById('modalityFilter'),
            strengthFilter: document.getElementById('strengthFilter'),
            cardSearchInput: document.getElementById('cardSearchInput'),
            sortSelect: document.getElementById('sortSelect'),
            guidelineContainer: document.getElementById('guidelineContainer'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            timelineContainer: document.getElementById('timelineContainer'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            patientPathFab: document.getElementById('patientPathFab'),
            pathCount: document.getElementById('pathCount'),
            pathModalOverlay: document.getElementById('pathModalOverlay'),
            pathModal: document.getElementById('pathModal'),
            pathModalContent: document.getElementById('pathModalContent'),
            pathPrintHeader: document.getElementById('pathPrintHeader'),
            emptyPathMessage: document.getElementById('emptyPathMessage'),
            btnClosePathModal: document.getElementById('pathModalClose'),
            btnExportPath: document.getElementById('exportPathBtn'),
            btnPrintPath: document.getElementById('printPathBtn'),
            btnClearPath: document.getElementById('clearPathBtn')
        };

        this.init();
    }

    async init() {
        this.applyTheme();
        this.attachEventListeners();
        await this.loadData();
    }

    initializeIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    attachEventListeners() {
        // Theme Toggle
        this.dom.themeToggle.addEventListener('click', () => this.toggleTheme());
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Navigation & Search
        this.dom.mobileNavToggle.addEventListener('click', () => this.toggleSidebar());
        this.dom.searchInput.addEventListener('input', (e) => this.handleSidebarSearch(e.target.value));
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.dom.searchInput.focus();
            }
        });

        // Sidebar outside click (mobile)
        this.dom.mainContainer.addEventListener('click', () => {
            if (this.dom.sidebar.classList.contains('open') && window.innerWidth <= 768) {
                this.toggleSidebar(false);
            }
        });

        // Filters & Sorting
        this.dom.cardSearchInput.addEventListener('input', (e) => {
            this.state.filters.textSearch = e.target.value.toLowerCase();
            this.renderGuidelineView();
        });

        this.dom.sortSelect.addEventListener('change', (e) => {
            this.state.sortMethod = e.target.value;
            this.renderGuidelineView();
        });

        // Patient Path Actions
        this.dom.patientPathFab.addEventListener('click', () => this.openPathModal());
        this.dom.pathModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.dom.pathModalOverlay) this.closePathModal();
        });
        this.dom.btnClosePathModal.addEventListener('click', () => this.closePathModal());
        this.dom.btnClearPath.addEventListener('click', () => this.clearPath());
        this.dom.btnExportPath.addEventListener('click', () => this.exportPath());
        this.dom.btnPrintPath.addEventListener('click', () => window.print());

        // Global Event Delegation for Tooltips and Card Interactions
        document.addEventListener('click', (e) => this.handleGlobalClicks(e));
        
        // Close tooltip on mouseout if not hovering tooltip itself
        document.addEventListener('mouseout', (e) => {
            const infoIcon = e.target.closest('.info-icon');
            if (infoIcon && this.activeTooltip) {
                // Small delay to allow moving mouse to tooltip if needed (though currently CSS pointer-events:none on tooltip)
                this.removeTooltip();
            }
        });
    }

    async loadData() {
        this.toggleLoading(true);
        try {
            const response = await fetch('data/OncoGuidelines.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            this.data = await response.json();
            this.renderSidebar();
            this.initializeIcons();
        } catch (error) {
            console.error('Data load failed:', error);
            this.dom.guidelineContainer.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 40px;">
                    <i data-lucide="alert-triangle" style="width: 48px; height: 48px; color: var(--status-danger-text); margin-bottom: 16px;"></i>
                    <h3>Daten konnten nicht geladen werden</h3>
                    <p>Bitte überprüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.</p>
                    <p style="font-family: monospace; margin-top: 10px; color: var(--text-tertiary);">${error.message}</p>
                </div>
            `;
            this.initializeIcons();
        } finally {
            this.toggleLoading(false);
        }
    }

    /* --- UI Logic --- */

    toggleTheme() {
        this.state.darkMode = !this.state.darkMode;
        localStorage.setItem('theme', this.state.darkMode ? 'dark' : 'light');
        this.applyTheme();
    }

    applyTheme() {
        if (this.state.darkMode) {
            this.dom.body.classList.add('dark-mode');
            this.dom.body.classList.remove('light-mode');
        } else {
            this.dom.body.classList.add('light-mode');
            this.dom.body.classList.remove('dark-mode');
        }
    }

    toggleSidebar(forceState) {
        const isOpen = this.dom.sidebar.classList.contains('open');
        const newState = forceState !== undefined ? forceState : !isOpen;
        
        if (newState) {
            this.dom.sidebar.classList.add('open');
            this.dom.mainContainer.classList.add('sidebar-open');
        } else {
            this.dom.sidebar.classList.remove('open');
            this.dom.mainContainer.classList.remove('sidebar-open');
        }
    }

    toggleLoading(show) {
        if (show) this.dom.loadingOverlay.classList.add('active');
        else this.dom.loadingOverlay.classList.remove('active');
    }

    /* --- Navigation & Sidebar --- */

    renderSidebar() {
        const entities = this.filterEntities(this.data.tumorEntities);
        this.dom.sidebarContent.innerHTML = '';

        if (entities.length === 0) {
            this.dom.sidebarContent.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-tertiary);">Keine Entitäten gefunden</div>';
            return;
        }

        const fragment = document.createDocumentFragment();

        entities.forEach((entity, index) => {
            const item = document.createElement('div');
            item.className = 'entity-item';
            
            const hasSubtypes = entity.subtypes && entity.subtypes.length > 1;
            
            // Header
            const header = document.createElement('div');
            header.className = 'entity-header';
            header.dataset.index = index;
            header.innerHTML = `
                <span class="entity-name">${entity.entityName}</span>
                ${hasSubtypes ? '<i data-lucide="chevron-down" class="entity-icon"></i>' : ''}
            `;
            header.addEventListener('click', () => this.handleEntitySelect(entity, item, hasSubtypes));
            
            item.appendChild(header);

            // Subtypes
            if (hasSubtypes) {
                const subContainer = document.createElement('div');
                subContainer.className = 'subtypes-container';
                
                entity.subtypes.forEach(subtype => {
                    const subItem = document.createElement('div');
                    subItem.className = 'subtype-item';
                    subItem.textContent = subtype.subtypeName;
                    subItem.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleSubtypeSelect(entity, subtype, subItem);
                    });
                    subContainer.appendChild(subItem);
                });
                item.appendChild(subContainer);
            }

            fragment.appendChild(item);
        });

        this.dom.sidebarContent.appendChild(fragment);
        this.initializeIcons();
    }

    filterEntities(entities) {
        if (!this.state.searchTerm) return entities;
        const term = this.state.searchTerm.toLowerCase();
        return entities.filter(e => 
            e.entityName.toLowerCase().includes(term) || 
            (e.subtypes && e.subtypes.some(s => s.subtypeName.toLowerCase().includes(term)))
        );
    }

    handleSidebarSearch(term) {
        this.state.searchTerm = term;
        this.renderSidebar();
    }

    handleEntitySelect(entity, itemElement, hasSubtypes) {
        if (hasSubtypes) {
            // Accordion Logic
            const isExpanded = itemElement.classList.contains('expanded');
            
            // Close other expanded items
            document.querySelectorAll('.entity-item.expanded').forEach(el => {
                if (el !== itemElement) {
                    el.classList.remove('expanded');
                    const container = el.querySelector('.subtypes-container');
                    if (container) container.style.maxHeight = null;
                }
            });

            // Toggle current item
            if (isExpanded) {
                itemElement.classList.remove('expanded');
                itemElement.querySelector('.subtypes-container').style.maxHeight = null;
            } else {
                itemElement.classList.add('expanded');
                const container = itemElement.querySelector('.subtypes-container');
                container.style.maxHeight = container.scrollHeight + "px";
            }
        } else {
            // Direct Selection (Entity has only one subtype which is usually itself)
            this.highlightSelection(itemElement.querySelector('.entity-header'));
            // Fallback if subtypes array exists but length is 1, or structure implies direct mapping
            const subtype = entity.subtypes && entity.subtypes.length > 0 ? entity.subtypes[0] : { subtypeName: entity.entityName, guidelines: [] }; 
            this.loadEntityContent(entity, subtype);
        }
    }

    handleSubtypeSelect(entity, subtype, element) {
        this.highlightSelection(element);
        this.loadEntityContent(entity, subtype);
    }

    highlightSelection(element) {
        // Remove active class from all headers and subtype items
        document.querySelectorAll('.entity-header.active, .subtype-item.active').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
        
        // Mobile: close sidebar on selection
        if (window.innerWidth <= 768) this.toggleSidebar(false);
    }

    /* --- Content Rendering --- */

    loadEntityContent(entity, subtype) {
        this.state.currentEntity = entity;
        this.state.currentSubtype = subtype;
        
        // Update Header
        this.dom.entityTitle.textContent = entity.entityName;
        this.dom.entitySubtitle.textContent = subtype.subtypeName !== entity.entityName ? subtype.subtypeName : '';
        
        // Reset View State
        this.resetFilters();
        this.dom.welcomeScreen.classList.add('hidden');
        this.dom.timelineContainer.classList.add('active');
        this.dom.filterBar.classList.add('visible');
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Render Tabs
        this.renderSocietyTabs(subtype.guidelines);

        // Load First Guideline by default if available
        if (subtype.guidelines && subtype.guidelines.length > 0) {
            this.selectGuideline(subtype.guidelines[0]);
        } else {
            this.dom.timelineContainer.innerHTML = `
                <div class="no-data" style="text-align:center; padding: 40px; color: var(--text-secondary);">
                    <i data-lucide="file-x" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>Keine Leitlinien für diese Entität verfügbar.</p>
                </div>`;
            this.initializeIcons();
        }
    }

    renderSocietyTabs(guidelines) {
        this.dom.societyTabs.innerHTML = '';
        guidelines.forEach(guideline => {
            const tab = document.createElement('button');
            const societyClass = guideline.issuingSociety.toLowerCase().replace(/[^a-z0-9]/g, '-');
            tab.className = `society-tab ${societyClass}`;
            tab.innerHTML = `
                ${guideline.issuingSociety}
                <span class="tab-version">${guideline.version}</span>
            `;
            tab.addEventListener('click', () => this.selectGuideline(guideline));
            this.dom.societyTabs.appendChild(tab);
        });
    }

    selectGuideline(guideline) {
        this.state.currentGuideline = guideline;
        
        // Update Active Tab
        Array.from(this.dom.societyTabs.children).forEach(tab => {
            // Basic check: contains society string
            const societyName = tab.textContent.split('\n')[0].trim(); // Very rough, better to match index or data attribute
            // Better approach: iterate guidelines again or store ref. 
            // Simple visual update based on text content match for now:
            if (tab.innerHTML.includes(guideline.version) && tab.innerHTML.includes(guideline.issuingSociety)) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        this.buildFilterOptions(guideline);
        this.renderGuidelineView();
    }

    buildFilterOptions(guideline) {
        // Extract unique modalities
        const modalities = new Set();
        if (guideline.recommendationGroups) {
            Object.values(guideline.recommendationGroups).flat().forEach(rec => {
                if (rec.modality) modalities.add(rec.modality);
            });
        }

        // Render Modality Filters
        this.dom.modalityFilter.innerHTML = '';
        Array.from(modalities).sort().forEach(mod => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = mod;
            btn.addEventListener('click', () => {
                if (this.state.filters.modality.has(mod)) this.state.filters.modality.delete(mod);
                else this.state.filters.modality.add(mod);
                btn.classList.toggle('active');
                this.renderGuidelineView();
            });
            this.dom.modalityFilter.appendChild(btn);
        });

        // Render Strength Filters
        this.dom.strengthFilter.innerHTML = '';
        const strengths = [
            { label: 'Empfohlen', keys: ['empfohlen', 'soll', 'obligat'] },
            { label: 'Kann', keys: ['kann', 'optional', 'fakultativ'] },
            { label: 'Nicht empfohlen', keys: ['nicht', 'sollte nicht'] }
        ];

        strengths.forEach(group => {
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.textContent = group.label;
            btn.addEventListener('click', () => {
                if (this.state.filters.strength.has(group.label)) this.state.filters.strength.delete(group.label);
                else this.state.filters.strength.add(group.label);
                btn.classList.toggle('active');
                this.renderGuidelineView();
            });
            this.dom.strengthFilter.appendChild(btn);
        });
    }

    resetFilters() {
        this.state.filters.modality.clear();
        this.state.filters.strength.clear();
        this.state.filters.textSearch = '';
        this.state.sortMethod = 'default';
        
        this.dom.cardSearchInput.value = '';
        this.dom.sortSelect.value = 'default';
        // Clear active classes from filter buttons
        document.querySelectorAll('.filter-btn.active').forEach(b => b.classList.remove('active'));
    }

    renderGuidelineView() {
        const container = this.dom.timelineContainer;
        container.innerHTML = '';
        const guideline = this.state.currentGuideline;
        if (!guideline || !guideline.recommendationGroups) return;

        const phases = Object.keys(guideline.recommendationGroups);

        phases.forEach(phase => {
            const recommendations = guideline.recommendationGroups[phase];
            const filteredRecs = this.filterAndSortRecommendations(recommendations);

            if (filteredRecs.length > 0) {
                const phaseEl = this.createPhaseSection(phase, filteredRecs);
                container.appendChild(phaseEl);
            }
        });

        if (container.innerHTML === '') {
            container.innerHTML = `
                <div class="no-results" style="text-align:center; padding: 40px; color: var(--text-secondary);">
                    Keine Empfehlungen entsprechen den aktuellen Filterkriterien.
                </div>`;
        }

        this.initializeIcons();
        this.updatePathButtonsState();
    }

    filterAndSortRecommendations(recs) {
        let result = recs.filter(rec => {
            // Text Search
            if (this.state.filters.textSearch) {
                const term = this.state.filters.textSearch;
                const text = `${rec.procedure} ${rec.justification || ''} ${rec.sourceText || ''}`.toLowerCase();
                if (!text.includes(term)) return false;
            }

            // Modality Filter
            if (this.state.filters.modality.size > 0) {
                if (!this.state.filters.modality.has(rec.modality)) return false;
            }

            // Strength Filter
            if (this.state.filters.strength.size > 0) {
                const s = rec.recommendationStrength.toLowerCase();
                const isSuccess = this.state.filters.strength.has('Empfohlen') && (s.includes('empfohlen') || s.includes('soll') || s.includes('obligat')) && !s.includes('nicht');
                const isWarning = this.state.filters.strength.has('Kann') && (s.includes('kann') || s.includes('optional') || s.includes('fakultativ'));
                const isDanger = this.state.filters.strength.has('Nicht empfohlen') && (s.includes('nicht') || s.includes('sollte nicht'));
                
                if (!isSuccess && !isWarning && !isDanger) return false;
            }

            return true;
        });

        // Sorting
        if (this.state.sortMethod === 'alphabetical') {
            result.sort((a, b) => a.procedure.localeCompare(b.procedure));
        } else if (this.state.sortMethod === 'strength') {
            const weight = (r) => {
                const s = r.recommendationStrength.toLowerCase();
                if (s.includes('nicht') || s.includes('sollte nicht')) return 3;
                if (s.includes('kann') || s.includes('optional') || s.includes('fakultativ')) return 2;
                return 1; // Empfohlen/Soll/Obligat is priority 1
            };
            result.sort((a, b) => weight(a) - weight(b));
        }

        return result;
    }

    createPhaseSection(title, recommendations) {
        const section = document.createElement('div');
        section.className = 'clinical-phase';

        // Header
        const header = document.createElement('div');
        header.className = 'phase-header';
        header.innerHTML = `
            <div class="phase-line"></div>
            <div class="phase-header-content">
                <h3 class="phase-title">${title}</h3>
                <button class="expand-toggle-btn">
                    <i data-lucide="chevrons-up-down"></i>
                    Alle umschalten
                </button>
            </div>
        `;

        // Grid
        const grid = document.createElement('div');
        grid.className = 'recommendations-grid';

        recommendations.forEach(rec => {
            grid.appendChild(this.createCard(rec));
        });

        // Phase Toggle Event
        header.querySelector('.expand-toggle-btn').addEventListener('click', () => {
            const cards = grid.querySelectorAll('.recommendation-card');
            // If any card is collapsed, expand all. If all are expanded, collapse all.
            const anyCollapsed = Array.from(cards).some(c => !c.classList.contains('expanded'));
            
            cards.forEach(c => {
                if (anyCollapsed) c.classList.add('expanded');
                else c.classList.remove('expanded');
            });
        });

        section.appendChild(header);
        section.appendChild(grid);
        return section;
    }

    createCard(rec) {
        const card = document.createElement('div');
        const strengthClass = this.getStrengthClass(rec.recommendationStrength);
        card.className = `recommendation-card ${strengthClass}`;
        card.dataset.id = rec.recommendationId;

        // Helper to safely get values
        const getVal = (v) => v ? v : '';

        card.innerHTML = `
            <div class="recommendation-header">
                <div class="procedure-info">
                    <div class="procedure-name">${rec.procedure}</div>
                    <div class="recommendation-meta">
                        <span class="strength-text ${strengthClass}">${rec.recommendationStrength}</span>
                        <span class="modality-badge">${getVal(rec.modality)}</span>
                        ${rec.evidenceLevel ? `
                        <div class="evidence-badge" data-tooltip-type="evidence" data-value="${rec.evidenceLevel}">
                            Evidenz: ${rec.evidenceLevel} <i data-lucide="info" class="info-icon"></i>
                        </div>` : ''}
                        ${rec.recommendationGrade ? `
                        <div class="evidence-badge" data-tooltip-type="grade" data-value="${rec.recommendationGrade}">
                            Grad: ${rec.recommendationGrade} <i data-lucide="info" class="info-icon"></i>
                        </div>` : ''}
                    </div>
                </div>
                <div class="recommendation-header-actions">
                    <div class="strength-indicator ${strengthClass}">
                        ${this.getStrengthSymbol(strengthClass)}
                    </div>
                    <button class="add-to-path-btn" title="Zum Patientenpfad hinzufügen">
                        <i data-lucide="plus"></i>
                    </button>
                </div>
            </div>
            <div class="recommendation-body">
                <div class="recommendation-body-content">
                    <div class="recommendation-details">
                        ${this.createDetailRow('Region', rec.anatomicRegion)}
                        ${this.createDetailRow('Details', rec.details)}
                        ${this.createDetailRow('Frequenz', rec.frequency)}
                        ${this.createDetailRow('Zielgruppe', rec.patientGroup)}
                        ${this.createDetailRow('Stadium', rec.clinicalStage)}
                    </div>
                    
                    ${rec.justification ? `
                    <div class="justification-container">
                        <button class="justification-toggle">
                            Begründung anzeigen <i data-lucide="chevron-down"></i>
                        </button>
                        <div class="justification-content"><p>${rec.justification}</p></div>
                    </div>` : ''}

                    ${rec.sourceText ? `
                    <div class="source-text-container">
                        <button class="source-text-toggle">
                            Originaltext <i data-lucide="chevron-down"></i>
                        </button>
                        <div class="source-text-content"><p>${rec.sourceText}</p></div>
                    </div>` : ''}
                </div>
            </div>
        `;

        // Toggle Logic
        card.querySelector('.recommendation-header').addEventListener('click', (e) => {
            if (e.target.closest('button') || e.target.closest('.info-icon')) return;
            card.classList.toggle('expanded');
        });

        // Add to Path Logic
        const addBtn = card.querySelector('.add-to-path-btn');
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.togglePathItem(rec);
        });

        // Justification/Source Toggle Logic
        card.querySelectorAll('.justification-toggle, .source-text-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const container = btn.parentElement;
                container.classList.toggle('expanded');
                const content = container.querySelector('div[class$="-content"]');
                const icon = btn.querySelector('svg'); // Lucide icon needs re-render or transform
                
                if (container.classList.contains('expanded')) {
                    content.style.maxHeight = content.scrollHeight + "px";
                    if(icon) icon.style.transform = "rotate(180deg)";
                } else {
                    content.style.maxHeight = null;
                    if(icon) icon.style.transform = "rotate(0deg)";
                }
            });
        });

        return card;
    }

    createDetailRow(label, value) {
        if (!value) return '';
        return `
            <div class="detail-item">
                <span class="detail-label">${label}:</span>
                <span class="detail-value">${value}</span>
            </div>
        `;
    }

    getStrengthClass(text) {
        const t = text.toLowerCase();
        if (t.includes('nicht') || t.includes('sollte nicht')) return 'nicht-empfohlen';
        if (t.includes('kann') || t.includes('optional') || t.includes('fakultativ')) return 'kann-erwogen-werden';
        return 'empfohlen'; // Default
    }

    getStrengthSymbol(className) {
        if (className === 'nicht-empfohlen') return '✕';
        if (className === 'kann-erwogen-werden') return '○';
        return '✓';
    }

    /* --- Interaction Handling --- */

    handleGlobalClicks(e) {
        // Tooltip Logic
        const infoIcon = e.target.closest('.info-icon');
        if (infoIcon) {
            e.stopPropagation();
            const badge = infoIcon.closest('.evidence-badge');
            this.showTooltip(badge, infoIcon);
            return;
        }

        // Close Tooltip if clicking elsewhere
        if (this.activeTooltip && !e.target.closest('.recommendation-tooltip')) {
            this.removeTooltip();
        }
    }

    showTooltip(badgeElement, targetIcon) {
        if (this.activeTooltip) this.removeTooltip();

        const val = badgeElement.dataset.value;
        const society = this.state.currentGuideline.issuingSociety;
        
        let content = 'Keine Beschreibung verfügbar.';
        
        // Data lookup
        if (TOOLTIP_DATA[society] && TOOLTIP_DATA[society][val]) {
            content = TOOLTIP_DATA[society][val];
        } else if (TOOLTIP_DATA['AWMF-DKG'][val]) {
            content = TOOLTIP_DATA['AWMF-DKG'][val];
        } else {
            // Split comma separated values e.g. "2+, 3"
            const parts = val.split(',').map(s => s.trim());
            const descriptions = parts.map(p => (TOOLTIP_DATA[society]?.[p] || TOOLTIP_DATA['AWMF-DKG']?.[p] || p));
            if (descriptions.length > 0) content = descriptions.join('<br><br>');
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'recommendation-tooltip';
        tooltip.innerHTML = content;
        document.body.appendChild(tooltip);

        // Calc Position
        const rect = targetIcon.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let top = rect.bottom + 8 + window.scrollY;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2) + window.scrollX;

        // Viewport check
        if (left < 10) left = 10;
        if (left + tooltipRect.width > window.innerWidth - 10) {
            left = window.innerWidth - tooltipRect.width - 10;
        }

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        this.activeTooltip = tooltip;
    }

    removeTooltip() {
        if (this.activeTooltip) {
            this.activeTooltip.remove();
            this.activeTooltip = null;
        }
    }

    /* --- Patient Path Logic --- */

    togglePathItem(rec) {
        const exists = this.state.patientPath.some(p => p.recommendationId === rec.recommendationId);
        
        if (exists) {
            this.state.patientPath = this.state.patientPath.filter(p => p.recommendationId !== rec.recommendationId);
        } else {
            // Enrich object for export context
            const item = {
                ...rec,
                context: {
                    entity: this.state.currentEntity.entityName,
                    subtype: this.state.currentSubtype.subtypeName,
                    society: this.state.currentGuideline.issuingSociety,
                    guidelineTitle: this.state.currentGuideline.guidelineTitle,
                    version: this.state.currentGuideline.version
                }
            };
            this.state.patientPath.push(item);
        }
        
        this.updatePathButtonsState();
        this.updateFab();
        this.renderPathModal();
    }

    updatePathButtonsState() {
        const buttons = document.querySelectorAll('.add-to-path-btn');
        buttons.forEach(btn => {
            const card = btn.closest('.recommendation-card');
            if (!card) return;
            const id = card.dataset.id;
            const inPath = this.state.patientPath.some(p => p.recommendationId === id);
            
            if (inPath) {
                btn.classList.add('added');
                btn.innerHTML = '<i data-lucide="check"></i>';
                btn.title = "Aus Patientenpfad entfernen";
            } else {
                btn.classList.remove('added');
                btn.innerHTML = '<i data-lucide="plus"></i>';
                btn.title = "Zum Patientenpfad hinzufügen";
            }
        });
        this.initializeIcons();
    }

    updateFab() {
        const count = this.state.patientPath.length;
        this.dom.pathCount.textContent = count;
        if (count > 0) {
            this.dom.patientPathFab.classList.add('visible');
        } else {
            this.dom.patientPathFab.classList.remove('visible');
        }
    }

    openPathModal() {
        this.renderPathModal();
        this.dom.pathModalOverlay.classList.add('visible');
        this.initializeIcons();
    }

    closePathModal() {
        this.dom.pathModalOverlay.classList.remove('visible');
    }

    clearPath() {
        if (this.state.patientPath.length === 0) return;
        if (confirm('Möchten Sie den gesamten Pfad wirklich löschen?')) {
            this.state.patientPath = [];
            this.updateFab();
            this.updatePathButtonsState();
            this.renderPathModal();
            this.closePathModal();
        }
    }

    renderPathModal() {
        const container = this.dom.pathModalContent;
        container.innerHTML = '';

        if (this.state.patientPath.length === 0) {
            this.dom.emptyPathMessage.style.display = 'flex';
            return;
        }
        
        this.dom.emptyPathMessage.style.display = 'none';

        // Generate Print Header inside Content for window.print() visibility
        const printHeader = document.createElement('div');
        printHeader.className = 'path-print-header';
        printHeader.innerHTML = `
            <h1>Diagnostischer Patientenpfad</h1>
            <p>Erstellt am ${new Date().toLocaleDateString()} - OncoGuidelines</p>
            <hr style="margin: 20px 0; border-color: #ccc;">
        `;
        container.appendChild(printHeader);

        this.state.patientPath.forEach(item => {
            const el = document.createElement('div');
            el.className = 'path-item';
            
            const strengthClass = this.getStrengthClass(item.recommendationStrength);
            const symbol = this.getStrengthSymbol(strengthClass);

            el.innerHTML = `
                <div class="path-item-details">
                    <h3>${item.procedure}</h3>
                    <div class="path-item-info">
                        <strong>${item.context.entity}</strong> (${item.context.society})<br>
                        <span style="color: var(--text-tertiary);">${item.clinicalSituation} - ${item.clinicalStage}</span><br>
                        <span style="display: inline-block; margin-top: 4px; padding: 2px 6px; background: var(--bg-card); border-radius: 4px; border: 1px solid var(--border-color); font-size: 11px;">
                            ${item.modality}
                        </span>
                        <span style="margin-left: 8px; font-weight: 600; color: var(--text-primary);">
                            ${symbol} ${item.recommendationStrength}
                        </span>
                    </div>
                </div>
                <button class="path-item-remove-btn" title="Entfernen">
                    <i data-lucide="trash-2"></i>
                </button>
            `;
            
            el.querySelector('.path-item-remove-btn').addEventListener('click', () => this.togglePathItem(item));
            container.appendChild(el);
        });
        
        this.initializeIcons();
    }

    exportPath() {
        if (this.state.patientPath.length === 0) return;

        let text = "DIAGNOSTISCHER PATIENTENPFAD\n";
        text += "============================\n";
        text += `Erstellt: ${new Date().toLocaleString()}\n`;
        text += `Quelle: OncoGuidelines App\n\n`;

        this.state.patientPath.forEach((item, idx) => {
            text += `[${idx + 1}] ${item.procedure.toUpperCase()}\n`;
            text += `    Entität:     ${item.context.entity} (${item.context.subtype})\n`;
            text += `    Leitlinie:   ${item.context.society} - ${item.context.guidelineTitle} (${item.context.version})\n`;
            text += `    Situation:   ${item.clinicalSituation}\n`;
            text += `    Stadium:     ${item.clinicalStage}\n`;
            text += `    Modalität:   ${item.modality}\n`;
            text += `    Region:      ${item.anatomicRegion}\n`;
            text += `    Empfehlung:  ${item.recommendationStrength}\n`;
            if (item.details) text += `    Details:     ${item.details}\n`;
            if (item.frequency) text += `    Frequenz:    ${item.frequency}\n`;
            if (item.justification) text += `    Begründung:  ${item.justification}\n`;
            text += "\n----------------------------------------\n\n";
        });

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Patientenpfad_${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Start Application
document.addEventListener('DOMContentLoaded', () => {
    new PatientenpfadeApp();
});