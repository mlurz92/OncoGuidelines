let oncoData = null;
let currentEntity = null;
let currentSubtype = null;
let currentGuideline = null;
let searchTerm = '';
let patientPath = [];

class PatientenpfadeApp {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeLucideIcons();
        this.loadData();
    }

    initializeElements() {
        this.elements = {
            themeToggle: document.getElementById('themeToggle'),
            sidebar: document.getElementById('sidebar'),
            sidebarContent: document.getElementById('sidebarContent'),
            searchInput: document.getElementById('searchInput'),
            entityTitle: document.getElementById('entityTitle'),
            entitySubtitle: document.getElementById('entitySubtitle'),
            societyTabs: document.getElementById('societyTabs'),
            guidelineContainer: document.getElementById('guidelineContainer'),
            mainContainer: document.querySelector('.main-container'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            timelineContainer: document.getElementById('timelineContainer'),
            loadingOverlay: document.getElementById('loadingOverlay'),
            patientPathFab: document.getElementById('patientPathFab'),
            pathCount: document.getElementById('pathCount'),
            pathModalOverlay: document.getElementById('pathModalOverlay'),
            pathModal: document.getElementById('pathModal'),
            pathModalClose: document.getElementById('pathModalClose'),
            pathModalContent: document.getElementById('pathModalContent'),
            pathPrintHeader: document.getElementById('pathPrintHeader'),
            emptyPathMessage: document.getElementById('emptyPathMessage'),
            printPathBtn: document.getElementById('printPathBtn'),
            exportPathBtn: document.getElementById('exportPathBtn'),
            clearPathBtn: document.getElementById('clearPathBtn'),
            mobileNavToggle: document.getElementById('mobileNavToggle')
        };
    }

    attachEventListeners() {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        this.elements.patientPathFab.addEventListener('click', () => this.openPathModal());
        this.elements.pathModalOverlay.addEventListener('click', (e) => {
            if (e.target === this.elements.pathModalOverlay) {
                this.closePathModal();
            }
        });
        this.elements.pathModalClose.addEventListener('click', () => this.closePathModal());
        this.elements.printPathBtn.addEventListener('click', () => this.printPath());
        this.elements.exportPathBtn.addEventListener('click', () => this.exportPathAsTxt());
        this.elements.clearPathBtn.addEventListener('click', () => this.clearPath());
        this.elements.mobileNavToggle.addEventListener('click', () => this.toggleMobileNav());
        this.elements.mainContainer.addEventListener('click', (e) => {
            if (this.elements.sidebar.classList.contains('open') && e.target === this.elements.mainContainer) {
                this.toggleMobileNav(false);
            }
        });
    }

    initializeLucideIcons() {
        lucide.createIcons();
    }

    toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-mode');
        body.classList.toggle('dark-mode');
    }

    toggleMobileNav(forceState) {
        const isOpen = this.elements.sidebar.classList.contains('open');
        const shouldOpen = forceState !== undefined ? forceState : !isOpen;
        
        if (shouldOpen) {
            this.elements.sidebar.classList.add('open');
            this.elements.mainContainer.classList.add('sidebar-open');
        } else {
            this.elements.sidebar.classList.remove('open');
            this.elements.mainContainer.classList.remove('sidebar-open');
        }
    }

    async loadData() {
        this.showLoading(true);
        try {
            const response = await fetch('data/OncoGuidelines.json');
            oncoData = await response.json();
            this.renderNavigation();
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Fehler beim Laden der Daten');
            this.showLoading(false);
        }
    }

    showLoading(show) {
        if (show) {
            this.elements.loadingOverlay.classList.add('active');
        } else {
            this.elements.loadingOverlay.classList.remove('active');
        }
    }

    showError(message) {
        this.elements.guidelineContainer.innerHTML = `
            <div class="error-message">
                <i data-lucide="alert-circle" class="error-icon"></i>
                <h3>Fehler</h3>
                <p>${message}</p>
            </div>
        `;
        lucide.createIcons();
    }

    renderNavigation() {
        const filteredEntities = this.filterEntities(oncoData.tumorEntities);
        this.elements.sidebarContent.innerHTML = '';
        
        filteredEntities.forEach((entity, index) => {
            const entityElement = this.createEntityElement(entity, index);
            this.elements.sidebarContent.appendChild(entityElement);
        });
        
        lucide.createIcons();
    }

    filterEntities(entities) {
        if (!searchTerm) return entities;
        
        return entities.filter(entity => {
            const entityMatch = entity.entityName.toLowerCase().includes(searchTerm.toLowerCase());
            const subtypeMatch = entity.subtypes.some(subtype => 
                subtype.subtypeName.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return entityMatch || subtypeMatch;
        });
    }

    createEntityElement(entity, index) {
        const entityDiv = document.createElement('div');
        entityDiv.className = 'entity-item';
        entityDiv.dataset.entityIndex = index;
        
        const hasMultipleSubtypes = entity.subtypes.length > 1;
        
        entityDiv.innerHTML = `
            <div class="entity-header" data-entity="${entity.entityName}">
                <span class="entity-name">${entity.entityName}</span>
                ${hasMultipleSubtypes ? '<i data-lucide="chevron-down" class="entity-icon"></i>' : ''}
            </div>
            ${hasMultipleSubtypes ? '<div class="subtypes-container"></div>' : ''}
        `;
        
        const header = entityDiv.querySelector('.entity-header');
        header.addEventListener('click', () => this.handleEntityClick(entity, entityDiv));
        
        if (hasMultipleSubtypes) {
            const subtypesContainer = entityDiv.querySelector('.subtypes-container');
            entity.subtypes.forEach(subtype => {
                if (subtype.guidelines.length > 0) {
                    const subtypeDiv = document.createElement('div');
                    subtypeDiv.className = 'subtype-item';
                    subtypeDiv.textContent = subtype.subtypeName;
                    subtypeDiv.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.handleSubtypeClick(entity, subtype, subtypeDiv);
                    });
                    subtypesContainer.appendChild(subtypeDiv);
                }
            });
        }
        
        return entityDiv;
    }

    handleEntityClick(entity, entityDiv) {
        const hasMultipleSubtypes = entity.subtypes.length > 1;
        
        if (hasMultipleSubtypes) {
            const subtypesContainer = entityDiv.querySelector('.subtypes-container');
            const isExpanded = entityDiv.classList.toggle('expanded');

            document.querySelectorAll('.entity-item.expanded').forEach(item => {
                if (item !== entityDiv) {
                    item.classList.remove('expanded');
                    const container = item.querySelector('.subtypes-container');
                    if(container) {
                        container.style.maxHeight = null;
                    }
                }
            });

            if (isExpanded) {
                subtypesContainer.style.maxHeight = subtypesContainer.scrollHeight + "px";
            } else {
                subtypesContainer.style.maxHeight = null;
            }

        } else {
            document.querySelectorAll('.subtype-item.active').forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.entity-item.has-active-child').forEach(item => item.classList.remove('has-active-child'));
            document.querySelectorAll('.entity-header.active').forEach(header => header.classList.remove('active'));
            
            entityDiv.querySelector('.entity-header').classList.add('active');
            
            if (entity.subtypes.length > 0 && entity.subtypes[0].guidelines.length > 0) {
                this.loadEntityGuidelines(entity, entity.subtypes[0]);
            }
            this.toggleMobileNav(false);
        }
    }

    handleSubtypeClick(entity, subtype, subtypeDiv) {
        document.querySelectorAll('.subtype-item.active').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.entity-item.has-active-child').forEach(item => item.classList.remove('has-active-child'));
        document.querySelectorAll('.entity-header.active').forEach(header => header.classList.remove('active'));
        
        subtypeDiv.classList.add('active');
        subtypeDiv.closest('.entity-item').classList.add('has-active-child');
        
        this.loadEntityGuidelines(entity, subtype);
        this.toggleMobileNav(false);
    }

    loadEntityGuidelines(entity, subtype) {
        currentEntity = entity;
        currentSubtype = subtype;
        
        this.elements.entityTitle.textContent = entity.entityName;
        this.elements.entitySubtitle.textContent = subtype.subtypeName !== entity.entityName ? subtype.subtypeName : '';
        
        this.renderSocietyTabs(subtype.guidelines);
        
        if (subtype.guidelines.length > 0) {
            this.loadGuideline(subtype.guidelines[0]);
        } else {
            this.showNoGuidelines();
        }
        
        this.elements.mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
        this.elements.welcomeScreen.classList.add('hidden');
        this.elements.timelineContainer.classList.add('active');
    }

    renderSocietyTabs(guidelines) {
        this.elements.societyTabs.innerHTML = '';
        
        guidelines.forEach((guideline, index) => {
            const tab = document.createElement('div');
            tab.className = `society-tab ${guideline.issuingSociety.toLowerCase().replace('-', '-')}`;
            if (index === 0) tab.classList.add('active');
            
            tab.innerHTML = `
                <span>${guideline.issuingSociety}</span>
                <span class="tab-version">${guideline.version}</span>
            `;
            
            tab.addEventListener('click', () => this.loadGuideline(guideline));
            this.elements.societyTabs.appendChild(tab);
        });
    }

    loadGuideline(guideline) {
        currentGuideline = guideline;
        
        document.querySelectorAll('.society-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = Array.from(this.elements.societyTabs.children).find(tab => 
            tab.textContent.includes(guideline.issuingSociety)
        );
        if (activeTab) activeTab.classList.add('active');
        
        this.renderTimelineView(guideline);
    }

    renderTimelineView(guideline) {
        this.elements.timelineContainer.innerHTML = '';
        
        const groupedRecommendations = this.groupRecommendationsByClinicalSituation(guideline.recommendationGroups);
        
        Object.entries(groupedRecommendations).forEach(([situation, recommendations]) => {
            const phaseElement = this.createPhaseElement(situation, recommendations);
            this.elements.timelineContainer.appendChild(phaseElement);
        });
        lucide.createIcons();
    }

    groupRecommendationsByClinicalSituation(recommendationGroups) {
        const grouped = {};
        
        Object.entries(recommendationGroups).forEach(([groupName, recommendations]) => {
            recommendations.forEach(rec => {
                const situation = rec.clinicalSituation;
                if (!grouped[situation]) {
                    grouped[situation] = [];
                }
                grouped[situation].push(rec);
            });
        });
        
        return grouped;
    }

    createPhaseElement(situation, recommendations) {
        const phaseDiv = document.createElement('div');
        phaseDiv.className = 'clinical-phase';
        
        phaseDiv.innerHTML = `
            <div class="phase-header">
                <div class="phase-line"></div>
                <h3 class="phase-title">${situation}</h3>
            </div>
            <div class="recommendations-grid"></div>
        `;
        
        const grid = phaseDiv.querySelector('.recommendations-grid');
        recommendations.forEach(rec => {
            grid.appendChild(this.createRecommendationCard(rec));
        });
        
        return phaseDiv;
    }

    createRecommendationCard(recommendation) {
        const strengthClass = this.getStrengthClass(recommendation.recommendationStrength);
        const card = document.createElement('div');
        card.className = `recommendation-card ${strengthClass}`;
        
        const strengthIcon = this.getStrengthIcon(recommendation.recommendationStrength);
        const isInPath = patientPath.some(item => item.recommendationId === recommendation.recommendationId);
        
        card.innerHTML = `
            <div class="recommendation-header">
                <div class="procedure-info">
                    <h4 class="procedure-name">${recommendation.procedure}</h4>
                    <div class="recommendation-meta">
                        <span class="strength-text ${strengthClass}">${recommendation.recommendationStrength}</span>
                        ${recommendation.recommendationGrade ? `<span class="evidence-badge">Grad: ${recommendation.recommendationGrade}</span>` : ''}
                        ${recommendation.evidenceLevel ? `<span class="evidence-badge">Evidenz: ${recommendation.evidenceLevel}</span>` : ''}
                    </div>
                    <span class="modality-badge">${recommendation.modality}</span>
                </div>
                <div class="recommendation-header-actions">
                    <div class="strength-indicator ${strengthClass}">
                        ${strengthIcon}
                    </div>
                    <button class="add-to-path-btn ${isInPath ? 'added' : ''}" data-id="${recommendation.recommendationId}">
                        <i data-lucide="${isInPath ? 'check' : 'plus'}"></i>
                    </button>
                </div>
            </div>
            <div class="recommendation-details">
                <span class="detail-label">Region:</span>
                <span class="detail-value">${recommendation.anatomicRegion}</span>
                
                ${recommendation.details ? `
                    <span class="detail-label">Details:</span>
                    <span class="detail-value">${recommendation.details}</span>
                ` : ''}

                <span class="detail-label">Stadium:</span>
                <span class="detail-value">${recommendation.clinicalStage}</span>

                ${recommendation.patientGroup ? `
                    <span class="detail-label">Patientengruppe:</span>
                    <span class="detail-value">${recommendation.patientGroup}</span>
                ` : ''}

                <span class="detail-label">Häufigkeit:</span>
                <span class="detail-value">${recommendation.frequency}</span>
            </div>
            <div class="justification-container">
                <button class="justification-toggle">
                    Begründung anzeigen
                    <i data-lucide="chevron-down"></i>
                </button>
                <div class="justification-content">
                    <p>${recommendation.justification}</p>
                </div>
            </div>
            ${recommendation.sourceText ? `
            <div class="source-text-container">
                <button class="source-text-toggle">
                    Originaltext anzeigen
                    <i data-lucide="chevron-down"></i>
                </button>
                <div class="source-text-content">
                    <p>${recommendation.sourceText}</p>
                </div>
            </div>
            ` : ''}
        `;

        const justificationToggle = card.querySelector('.justification-toggle');
        const justificationContent = card.querySelector('.justification-content');
        const justificationContainer = card.querySelector('.justification-container');

        justificationToggle.addEventListener('click', () => {
            const isExpanded = justificationContainer.classList.toggle('expanded');
            if (isExpanded) {
                justificationContent.style.maxHeight = justificationContent.scrollHeight + 'px';
                justificationToggle.childNodes[0].nodeValue = "Begründung ausblenden ";
            } else {
                justificationContent.style.maxHeight = null;
                justificationToggle.childNodes[0].nodeValue = "Begründung anzeigen ";
            }
        });

        const sourceTextToggle = card.querySelector('.source-text-toggle');
        if (sourceTextToggle) {
            const sourceTextContent = card.querySelector('.source-text-content');
            const sourceTextContainer = card.querySelector('.source-text-container');
            sourceTextToggle.addEventListener('click', () => {
                const isExpanded = sourceTextContainer.classList.toggle('expanded');
                if (isExpanded) {
                    sourceTextContent.style.maxHeight = sourceTextContent.scrollHeight + 'px';
                    sourceTextToggle.childNodes[0].nodeValue = "Originaltext ausblenden ";
                } else {
                    sourceTextContent.style.maxHeight = null;
                    sourceTextToggle.childNodes[0].nodeValue = "Originaltext anzeigen ";
                }
            });
        }

        const addToPathBtn = card.querySelector('.add-to-path-btn');
        addToPathBtn.addEventListener('click', () => this.togglePathItem(recommendation, addToPathBtn));
        
        return card;
    }

    getStrengthClass(strength) {
        const strengthLower = strength.toLowerCase();
        if (strengthLower.includes('empfohlen') && !strengthLower.includes('nicht')) return 'empfohlen';
        if (strengthLower === 'soll') return 'soll';
        if (strengthLower === 'sollte') return 'soll';
        if (strengthLower === 'obligat') return 'obligat';
        if (strengthLower.includes('kann') || strengthLower === 'optional') return 'kann-erwogen-werden';
        if (strengthLower === 'fakultativ') return 'fakultativ';
        if (strengthLower.includes('nicht')) return 'nicht-empfohlen';
        return 'empfohlen';
    }

    getStrengthIcon(strength) {
        const strengthLower = strength.toLowerCase();
        if (strengthLower.includes('empfohlen') && !strengthLower.includes('nicht')) return '✓';
        if (strengthLower === 'soll' || strengthLower === 'sollte' || strengthLower === 'obligat') return '✓';
        if (strengthLower.includes('kann') || strengthLower === 'optional' || strengthLower === 'fakultativ') return '○';
        if (strengthLower.includes('nicht')) return '✗';
        return '✓';
    }

    showNoGuidelines() {
        this.elements.timelineContainer.innerHTML = `
            <div class="no-guidelines">
                <i data-lucide="file-x" class="no-guidelines-icon"></i>
                <h3>Keine Leitlinien verfügbar</h3>
                <p>Für diese Entität sind derzeit keine Leitlinien hinterlegt.</p>
            </div>
        `;
        lucide.createIcons();
    }

    handleSearch(value) {
        searchTerm = value;
        clearTimeout(this.searchTimeout);
        
        this.searchTimeout = setTimeout(() => {
            this.renderNavigation();
        }, 300);
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'k') {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
            if (e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
        }
    }

    togglePathItem(recommendation, button) {
        const index = patientPath.findIndex(item => item.recommendationId === recommendation.recommendationId);
        if (index > -1) {
            patientPath.splice(index, 1);
            if (button) {
                button.classList.remove('added');
                button.innerHTML = '<i data-lucide="plus"></i>';
            }
        } else {
            patientPath.push(recommendation);
            if (button) {
                button.classList.add('added');
                button.innerHTML = '<i data-lucide="check"></i>';
            }
        }
        if (button) {
            lucide.createIcons({
                nodes: [button]
            });
        }
        this.updatePathFab();
    }

    updatePathFab() {
        const count = patientPath.length;
        this.elements.pathCount.textContent = count;
        if (count > 0) {
            this.elements.patientPathFab.classList.add('visible');
        } else {
            this.elements.patientPathFab.classList.remove('visible');
        }
    }

    openPathModal() {
        this.renderPathModalContent();
        this.elements.pathModalOverlay.classList.add('visible');
        lucide.createIcons();
    }

    closePathModal() {
        this.elements.pathModalOverlay.classList.remove('visible');
    }

    renderPathModalContent() {
        const contentContainer = this.elements.pathModalContent;
        const emptyMessage = contentContainer.querySelector('.empty-path-message');
        
        contentContainer.querySelectorAll('.path-item').forEach(item => item.remove());

        if (patientPath.length === 0) {
            emptyMessage.style.display = 'flex';
        } else {
            emptyMessage.style.display = 'none';
            patientPath.forEach(rec => {
                const itemElement = document.createElement('div');
                itemElement.className = 'path-item';
                itemElement.innerHTML = `
                    <div class="path-item-details">
                        <div class="path-item-header">
                            <h3 class="path-item-procedure">${rec.procedure}</h3>
                            <span class="modality-badge">${rec.modality}</span>
                        </div>
                        <p class="path-item-info">
                            <strong>Situation:</strong> ${rec.clinicalSituation} <br>
                            <strong>Stadium:</strong> ${rec.clinicalStage} <br>
                            <strong>Region:</strong> ${rec.anatomicRegion}
                        </p>
                    </div>
                    <button class="path-item-remove-btn" data-id="${rec.recommendationId}">
                        <i data-lucide="trash-2"></i>
                    </button>
                `;
                itemElement.querySelector('.path-item-remove-btn').addEventListener('click', () => {
                    this.togglePathItem(rec, null);
                    this.renderPathModalContent();
                    this.updateCardsInView();
                });
                contentContainer.appendChild(itemElement);
            });
            lucide.createIcons({
                nodes: Array.from(contentContainer.querySelectorAll('.path-item-remove-btn'))
            });
        }
    }

    updateCardsInView() {
        const allCardButtons = document.querySelectorAll('.add-to-path-btn');
        allCardButtons.forEach(button => {
            const id = button.dataset.id;
            const isInPath = patientPath.some(item => item.recommendationId === id);
            if (isInPath) {
                if (!button.classList.contains('added')) {
                    button.classList.add('added');
                    button.innerHTML = '<i data-lucide="check"></i>';
                    lucide.createIcons({ nodes: [button] });
                }
            } else {
                if (button.classList.contains('added')) {
                    button.classList.remove('added');
                    button.innerHTML = '<i data-lucide="plus"></i>';
                    lucide.createIcons({ nodes: [button] });
                }
            }
        });
    }

    clearPath() {
        patientPath = [];
        this.updatePathFab();
        this.renderPathModalContent();
        this.updateCardsInView();
    }

    printPath() {
        if (currentEntity && currentGuideline) {
            this.elements.pathPrintHeader.innerHTML = `
                <h1>Diagnostischer Pfad: ${currentEntity.entityName}</h1>
                <p>Basierend auf Leitlinie: ${currentGuideline.guidelineTitle} (${currentGuideline.issuingSociety}, Version: ${currentGuideline.version})</p>
            `;
        } else {
            this.elements.pathPrintHeader.innerHTML = `<h1>Diagnostischer Pfad</h1>`;
        }
        window.print();
        this.elements.pathPrintHeader.innerHTML = '';
    }

    exportPathAsTxt() {
        if (patientPath.length === 0) return;

        let content = "Diagnostischer Patientenpfad\n";
        content += "========================================\n\n";

        if (currentEntity && currentGuideline) {
            content += `Tumorentität: ${currentEntity.entityName}\n`;
            if (currentSubtype.subtypeName !== currentEntity.entityName) {
                content += `Subtyp: ${currentSubtype.subtypeName}\n`;
            }
            content += `Leitlinie: ${currentGuideline.guidelineTitle} (${currentGuideline.issuingSociety}, ${currentGuideline.version})\n\n`;
        }

        content += "Checkliste der empfohlenen Maßnahmen:\n\n";

        patientPath.forEach(rec => {
            content += `[ ] ${rec.procedure} (${rec.modality})\n`;
            content += `    - Klinische Situation: ${rec.clinicalSituation}\n`;
            content += `    - Stadium / Kontext: ${rec.clinicalStage}\n`;
            content += `    - Anatomische Region: ${rec.anatomicRegion}\n`;
            if (rec.details) {
                content += `    - Details: ${rec.details}\n`;
            }
            content += "\n";
        });

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const entityName = currentEntity ? currentEntity.entityName.replace(/[^a-z0-9]/gi, '_') : 'Export';
        a.download = `Patientenpfad_${entityName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new PatientenpfadeApp();
});