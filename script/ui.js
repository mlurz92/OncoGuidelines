class UIController {
    constructor() {
        this.navList = document.getElementById('nav-list');
        this.guidelineContentWrapper = document.getElementById('guideline-content-wrapper');
        this.guidelineContent = document.getElementById('guideline-content');
        this.guidelineTitleDisplay = document.getElementById('guideline-title-display');
        this.guidelineSubtitleDisplay = document.getElementById('guideline-subtitle-display');
        this.guidelineTabsContainer = document.getElementById('guideline-tabs');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.errorContainer = document.getElementById('error-container');
        this.errorMessage = document.getElementById('error-message');
    }

    showLoading() {
        this.guidelineContent.classList.add('loading');
        this.guidelineContent.innerHTML = '';
        this.loadingSpinner.classList.remove('hidden');
        this.errorContainer.classList.add('hidden');
    }

    hideLoading() {
        this.loadingSpinner.classList.add('hidden');
        this.guidelineContent.classList.remove('loading');
    }

    showError(message) {
        this.guidelineContent.classList.remove('loading');
        this.guidelineContent.innerHTML = '';
        this.hideLoading();
        this.errorMessage.textContent = message;
        this.errorContainer.classList.remove('hidden');
        this.guidelineContent.appendChild(this.errorContainer);
    }

    clearContent() {
        this.guidelineContent.innerHTML = '';
        this.guidelineTitleDisplay.textContent = 'Willkommen';
        this.guidelineSubtitleDisplay.textContent = 'Bitte wählen Sie eine Leitlinie aus der Navigation.';
        this.guidelineTabsContainer.innerHTML = '';
        this.errorContainer.classList.add('hidden');
        const welcomeMessage = `
            <div class="welcome-message">
                <i class="fa-solid fa-hand-pointer"></i>
                <h2>Beginnen Sie, indem Sie eine Tumorentität im Menü auf der linken Seite auswählen.</h2>
                <p>Die Anwendung lädt dann die entsprechenden Leitlinien und zeigt die diagnostischen Empfehlungen an.</p>
            </div>`;
        this.guidelineContent.innerHTML = welcomeMessage;
    }

    populateNavigation(tumorEntities) {
        this.navList.innerHTML = '';
        tumorEntities.forEach((entity, entityIndex) => {
            const entityItem = document.createElement('li');
            const entityLink = document.createElement('a');
            entityLink.href = '#';
            entityLink.textContent = entity.entityName;
            entityLink.dataset.entityIndex = entityIndex;
            entityLink.dataset.subtypeIndex = 0;
            entityLink.dataset.guidelineIndex = 0;

            if (entity.subtypes && entity.subtypes.length > 0) {
                const arrow = document.createElement('i');
                arrow.className = 'fas fa-chevron-right nav-arrow';
                entityLink.appendChild(arrow);
                
                const subtypeList = document.createElement('ul');
                entity.subtypes.forEach((subtype, subtypeIndex) => {
                    const subtypeItem = document.createElement('li');
                    const subtypeLink = document.createElement('a');
                    subtypeLink.href = '#';
                    subtypeLink.textContent = subtype.subtypeName;
                    subtypeLink.dataset.entityIndex = entityIndex;
                    subtypeLink.dataset.subtypeIndex = subtypeIndex;
                    subtypeLink.dataset.guidelineIndex = 0;

                    if (subtype.guidelines && subtype.guidelines.length > 0) {
                        const subArrow = document.createElement('i');
                        subArrow.className = 'fas fa-chevron-right nav-arrow';
                        subtypeLink.appendChild(subArrow);

                        const guidelineList = document.createElement('ul');
                        subtype.guidelines.forEach((guideline, guidelineIndex) => {
                            const guidelineItem = document.createElement('li');
                            const guidelineLink = document.createElement('a');
                            guidelineLink.href = '#';
                            guidelineLink.textContent = `${guideline.issuingSociety} - ${guideline.version}`;
                            guidelineLink.dataset.entityIndex = entityIndex;
                            guidelineLink.dataset.subtypeIndex = subtypeIndex;
                            guidelineLink.dataset.guidelineIndex = guidelineIndex;
                            guidelineItem.appendChild(guidelineLink);
                            guidelineList.appendChild(guidelineItem);
                        });
                        subtypeItem.appendChild(guidelineList);
                    }
                    subtypeItem.appendChild(subtypeLink);
                    subtypeList.appendChild(subtypeItem);
                });
                entityItem.appendChild(subtypeList);
            }
            entityItem.appendChild(entityLink);
            this.navList.appendChild(entityItem);
        });
    }

    renderGuideline(guideline, entityName) {
        this.guidelineContentWrapper.scrollTop = 0;
        
        this.guidelineTitleDisplay.textContent = entityName;
        this.guidelineSubtitleDisplay.textContent = `${guideline.guidelineTitle} (${guideline.issuingSociety} - ${guideline.version})`;

        const recommendationGroups = guideline.recommendationGroups || {};
        const groupKeys = Object.keys(recommendationGroups);

        if (groupKeys.length === 0) {
            this.guidelineContent.innerHTML = `<p>Für diese Leitlinie sind keine Empfehlungen hinterlegt.</p>`;
            this.hideLoading();
            return;
        }

        const fragment = document.createDocumentFragment();
        groupKeys.forEach(groupName => {
            const recommendations = recommendationGroups[groupName];
            if (recommendations && recommendations.length > 0) {
                const groupContainer = document.createElement('div');
                groupContainer.className = 'recommendation-group';

                const groupHeader = document.createElement('div');
                groupHeader.className = 'recommendation-group-header';
                groupHeader.innerHTML = `
                    <h3>${groupName}</h3>
                    <i class="fas fa-chevron-down group-toggle-icon"></i>
                `;
                
                const groupContent = document.createElement('div');
                groupContent.className = 'recommendation-group-content';
                
                recommendations.forEach(rec => {
                    groupContent.appendChild(this.createRecommendationCard(rec));
                });

                groupContainer.appendChild(groupHeader);
                groupContainer.appendChild(groupContent);
                fragment.appendChild(groupContainer);
            }
        });
        this.guidelineContent.appendChild(fragment);
        this.hideLoading();
    }

    createRecommendationCard(rec) {
        const card = document.createElement('div');
        const strength = this.normalizeStrength(rec.recommendationStrength);
        card.className = `recommendation-card card-border-${strength}`;
        
        const { icon } = this.getStrengthIconAndColor(strength);

        const detailsHtml = [
            { label: 'Klin. Situation', value: rec.clinicalSituation },
            { label: 'Klin. Stadium', value: rec.clinicalStage },
            { label: 'Prozedur', value: rec.procedure },
            { label: 'Modalität', value: rec.modality },
            { label: 'Region', value: rec.anatomicRegion },
            { label: 'Details', value: rec.details },
            { label: 'Patientengruppe', value: rec.patientGroup },
            { label: 'Frequenz', value: rec.frequency },
            { label: 'Empfehlung', value: rec.recommendationStrength },
            { label: 'Grad', value: rec.recommendationGrade },
            { label: 'Evidenzlevel', value: rec.evidenceLevel }
        ]
        .filter(item => item.value !== null && item.value !== undefined && item.value !== '')
        .map(item => `
            <div class="rec-detail-item">
                <span class="label">${item.label}</span>
                <span class="value">${item.value}</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="rec-header">
                <i class="fas ${icon} rec-strength-icon ${strength}"></i>
                <h4 class="rec-title">${rec.procedure}</h4>
            </div>
            <div class="rec-body">
                ${detailsHtml}
            </div>
            <div class="rec-justification">
                <strong>Begründung:</strong> ${rec.justification || 'Keine Angabe.'}
            </div>
        `;
        return card;
    }

    normalizeStrength(strength) {
        if (!strength) return 'Default';
        const s = strength.toLowerCase().replace(/\s/g, '-');
        if (s.includes('soll') || s.includes('empfohlen') || s.includes('obligat')) return 'Empfohlen';
        if (s.includes('kann') || s.includes('optional') || s.includes('fakultativ')) return 'Kann-erwogen-werden';
        if (s.includes('nicht-empfohlen') || s.includes('sollte-nicht') || s.includes('soll-nicht')) return 'Nicht-empfohlen';
        return 'Default';
    }

    getStrengthIconAndColor(normalizedStrength) {
        switch (normalizedStrength) {
            case 'Empfohlen':
                return { icon: 'fa-check-circle', color: 'var(--rec-empfohlen-border)' };
            case 'Kann-erwogen-werden':
                return { icon: 'fa-info-circle', color: 'var(--rec-kann-erwogen-werden-border)' };
            case 'Nicht-empfohlen':
                return { icon: 'fa-times-circle', color: 'var(--rec-sollte-nicht-border)' };
            default:
                return { icon: 'fa-question-circle', color: 'var(--rec-sonstiges-border)' };
        }
    }

    updateActiveNav(entityIndex, subtypeIndex, guidelineIndex) {
        document.querySelectorAll('#nav-list a.active').forEach(el => el.classList.remove('active'));
        const activeLink = document.querySelector(`#nav-list a[data-entity-index="${entityIndex}"][data-subtype-index="${subtypeIndex}"][data-guideline-index="${guidelineIndex}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            let parentLi = activeLink.closest('li');
            while(parentLi) {
                const parentAnchor = parentLi.parentElement.closest('li')?.querySelector('a');
                if (parentAnchor) {
                    parentAnchor.classList.add('active');
                }
                parentLi = parentLi.parentElement.closest('li');
            }
        }
    }
    
    renderTabs(guidelines, activeGuidelineIndex, entityIndex, subtypeIndex) {
        this.guidelineTabsContainer.innerHTML = '';
        guidelines.forEach((guideline, index) => {
            const tab = document.createElement('div');
            tab.className = 'guideline-tab';
            tab.textContent = guideline.issuingSociety;
            tab.dataset.entityIndex = entityIndex;
            tab.dataset.subtypeIndex = subtypeIndex;
            tab.dataset.guidelineIndex = index;
            if (index === activeGuidelineIndex) {
                tab.classList.add('active');
            }
            this.guidelineTabsContainer.appendChild(tab);
        });
    }
}