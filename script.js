let oncoData = null;
let currentEntity = null;
let currentSubtype = null;
let currentGuideline = null;
let searchTerm = '';

class OncoGuidelinesApp {
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
            welcomeScreen: document.getElementById('welcomeScreen'),
            timelineContainer: document.getElementById('timelineContainer'),
            loadingOverlay: document.getElementById('loadingOverlay')
        };
    }

    attachEventListeners() {
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    initializeLucideIcons() {
        lucide.createIcons();
    }

    toggleTheme() {
        const body = document.body;
        body.classList.toggle('light-mode');
        body.classList.toggle('dark-mode');
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
        }
    }

    handleSubtypeClick(entity, subtype, subtypeDiv) {
        document.querySelectorAll('.subtype-item.active').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.entity-item.has-active-child').forEach(item => item.classList.remove('has-active-child'));
        document.querySelectorAll('.entity-header.active').forEach(header => header.classList.remove('active'));
        
        subtypeDiv.classList.add('active');
        subtypeDiv.closest('.entity-item').classList.add('has-active-child');
        
        this.loadEntityGuidelines(entity, subtype);
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
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        const strengthClass = this.getStrengthClass(recommendation.recommendationStrength);
        const strengthIcon = this.getStrengthIcon(recommendation.recommendationStrength);
        
        card.innerHTML = `
            <div class="recommendation-header">
                <div class="procedure-info">
                    <h4 class="procedure-name">${recommendation.procedure}</h4>
                    <span class="modality-badge">${recommendation.modality}</span>
                </div>
                <div class="strength-indicator ${strengthClass}">
                    ${strengthIcon}
                </div>
            </div>
            <div class="recommendation-details">
                <div class="detail-row">
                    <span class="detail-label">Region:</span>
                    <span class="detail-value">${recommendation.anatomicRegion}</span>
                </div>
                ${recommendation.details ? `
                    <div class="detail-row">
                        <span class="detail-label">Details:</span>
                        <span class="detail-value">${recommendation.details}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Stadium:</span>
                    <span class="detail-value">${recommendation.clinicalStage}</span>
                </div>
                ${recommendation.patientGroup ? `
                    <div class="detail-row">
                        <span class="detail-label">Patientengruppe:</span>
                        <span class="detail-value">${recommendation.patientGroup}</span>
                    </div>
                ` : ''}
                <div class="detail-row">
                    <span class="detail-label">Häufigkeit:</span>
                    <span class="detail-value">${recommendation.frequency}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Begründung:</span>
                    <span class="detail-value">${recommendation.justification}</span>
                </div>
            </div>
            <div class="evidence-badges">
                ${recommendation.recommendationGrade ? `
                    <span class="evidence-badge">Empfehlungsgrad: ${recommendation.recommendationGrade}</span>
                ` : ''}
                ${recommendation.evidenceLevel ? `
                    <span class="evidence-badge">Evidenzlevel: ${recommendation.evidenceLevel}</span>
                ` : ''}
            </div>
        `;
        
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
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new OncoGuidelinesApp();
});