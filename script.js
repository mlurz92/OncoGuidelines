document.addEventListener('DOMContentLoaded', () => {
    let guidelineData = [];
    let currentGroupName = null;

    const cancerListEl = document.getElementById('cancer-list');
    const guidelineListEl = document.getElementById('guideline-list');
    const recommendationDetailsEl = document.getElementById('recommendation-details');
    const searchInput = document.getElementById('search-cancer');
    const backToTopBtn = document.getElementById('back-to-top-btn');
    const compareBtn = document.getElementById('compare-guidelines-btn');
    const recommendationTitleEl = document.getElementById('recommendation-title');
    const guidelineMetaInfoEl = document.getElementById('guideline-meta-info');

    const placeholderGuidelines = `
        <div class="placeholder-content">
            <i class="fa-solid fa-arrow-left fa-2x"></i>
            <p class="mt-3">Bitte wählen Sie links eine onkologische Entität aus.</p>
        </div>`;

    const placeholderRecommendations = `
        <div class="placeholder-content">
            <i class="fa-solid fa-arrow-left fa-2x"></i>
            <p class="mt-3">Bitte wählen Sie eine Leitlinie aus, um die Empfehlungen anzuzeigen.</p>
        </div>`;

    const fetchGuidelines = async () => {
        try {
            const response = await fetch('OncoGuideline_Database.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            guidelineData = await response.json();
            displayCancerGroups(guidelineData);
        } catch (error) {
            console.error('Fehler beim Laden der Leitlinien-Datenbank:', error);
            cancerListEl.innerHTML = `<li class="list-group-item text-danger">Fehler beim Laden der Daten. Bitte überprüfen Sie die Konsole.</li>`;
        }
    };

    const getStrengthIcon = (level) => {
        const lowerLevel = level.toLowerCase();
        if (lowerLevel.includes('empfohlen') || lowerLevel.includes('soll') || lowerLevel.includes('sollen')) return 'fa-solid fa-circle-check';
        if (lowerLevel.includes('sollte')) return 'fa-solid fa-check';
        if (lowerLevel.includes('kann') || lowerLevel.includes('optional') || lowerLevel.includes('fakultativ')) return 'fa-solid fa-circle-info';
        if (lowerLevel.includes('nicht')) return 'fa-solid fa-circle-xmark';
        return 'fa-solid fa-question-circle';
    };

    const getStrengthCssClass = (level) => `strength-${level.replace(/\s+/g, '-').toLowerCase()}`;

    const formatContext = (context) => {
        const keyMap = {
            clinicalStage: 'Klinisches Stadium',
            situation: 'Situation',
            patientGroup: 'Patientengruppe',
            resourceLevel: 'Ressourcenlevel'
        };
        let html = '<div class="context-grid">';
        for (const [key, value] of Object.entries(context)) {
            if (value && value !== 'N/A') {
                html += `<div class="context-item"><strong>${keyMap[key] || key}</strong> ${value}</div>`;
            }
        }
        return html + '</div>';
    };

    const formatProcedure = (procedure) => `
        <h6>Empfohlene Prozedur</h6>
        <p><strong>${procedure.canonicalNameDe}</strong></p>
        <ul class="list-unstyled">
            ${procedure.modality ? `<li><strong>Modalität:</strong> ${procedure.modality}</li>` : ''}
            ${procedure.anatomicRegion ? `<li><strong>Region:</strong> ${procedure.anatomicRegion}</li>` : ''}
            ${procedure.details ? `<li><strong>Details:</strong> ${procedure.details}</li>` : ''}
        </ul>`;

    const formatFrequency = (interval) => interval ? `<p class="frequency-info"><i class="fa-regular fa-clock me-2"></i>${interval.description}</p>` : '';

    const createRecommendationCard = (rec, guideline, society, isComparisonView = false) => {
        const card = document.createElement('div');
        card.className = `recommendation-card ${isComparisonView ? 'comparison-card' : ''}`;

        let headerHtml = `
            ${isComparisonView ? `<div class="society-name">${society.society} - ${guideline.guidelineName}</div>` : ''}
            ${rec.procedure.canonicalNameDe}
            <span class="rec-id">ID: ${rec.recommendationId}</span>
        `;

        card.innerHTML = `
            <div class="card-header">${headerHtml}</div>
            <div class="card-body">
                <h5>Kontext</h5>
                ${formatContext(rec.context)}
                <div class="row">
                    <div class="col-md-6">${formatProcedure(rec.procedure)}</div>
                    <div class="col-md-6">
                        <h6>Empfehlungsstärke</h6>
                        <span class="strength-badge ${getStrengthCssClass(rec.recommendationStrength.level)}">
                            <i class="${getStrengthIcon(rec.recommendationStrength.level)}"></i> ${rec.recommendationStrength.level}
                        </span>
                        ${rec.recommendationStrength.gradeOfRecommendation ? `<p class="mt-2 mb-0"><strong>Grad:</strong> ${rec.recommendationStrength.gradeOfRecommendation}</p>` : ''}
                        ${rec.recommendationStrength.levelOfEvidence ? `<p class="mb-0"><strong>Evidenzlevel:</strong> ${rec.recommendationStrength.levelOfEvidence}</p>` : ''}
                    </div>
                </div>
                ${formatFrequency(rec.frequencyInterval)}
                <div class="rationale-section">
                    <h6>Begründung</h6>
                    <p>${rec.rationale}</p>
                </div>
                <div class="source-text">
                    <strong>Quelltext:</strong> "${rec.sourceText}"
                </div>
                <a href="${guideline.sourceUrl}" target="_blank" class="btn btn-outline-primary btn-sm source-url">
                    <i class="fa-solid fa-link me-2"></i>Zur Leitlinie
                </a>
            </div>
        `;
        return card;
    };

    const displayRecommendations = (groupName, guidelineName, societyName) => {
        const group = guidelineData.find(g => g.groupName === groupName);
        const society = group.societies.find(s => s.society === societyName);
        const guideline = society.guidelines.find(g => g.guidelineName === guidelineName);
        
        recommendationDetailsEl.innerHTML = '';
        recommendationTitleEl.innerHTML = `<i class="fa-solid fa-star me-2"></i>Empfehlungen`;
        guidelineMetaInfoEl.innerHTML = `
            <small><strong>Leitlinie:</strong> ${guideline.guidelineName} (${society.society})</small><br>
            <small><strong>Version:</strong> ${guideline.version} | <strong>Publiziert:</strong> ${new Date(guideline.publicationDate).toLocaleDateString('de-DE')}</small>
        `;

        if (guideline && guideline.recommendations) {
            guideline.recommendations.forEach(rec => {
                recommendationDetailsEl.appendChild(createRecommendationCard(rec, guideline, society));
            });
        } else {
            recommendationDetailsEl.innerHTML = placeholderRecommendations;
        }
        recommendationDetailsEl.scrollTop = 0;
    };

    const displayComparisonView = (groupName) => {
        const group = guidelineData.find(g => g.groupName === groupName);
        if (!group) return;

        recommendationDetailsEl.innerHTML = '';
        recommendationTitleEl.innerHTML = `<i class="fa-solid fa-scale-balanced me-2"></i>Vergleich: ${groupName}`;
        guidelineMetaInfoEl.innerHTML = '';
        document.querySelectorAll('#guideline-list .list-group-item').forEach(item => item.classList.remove('active'));

        const allRecommendations = [];
        group.societies.forEach(society => {
            society.guidelines.forEach(guideline => {
                guideline.recommendations.forEach(rec => {
                    allRecommendations.push({ rec, guideline, society });
                });
            });
        });

        const groupedBySituation = allRecommendations.reduce((acc, item) => {
            const situation = item.rec.context.situation || 'Unspezifiziert';
            if (!acc[situation]) {
                acc[situation] = [];
            }
            acc[situation].push(item);
            return acc;
        }, {});

        const sortedSituations = Object.keys(groupedBySituation).sort();

        sortedSituations.forEach(situation => {
            const groupHeader = document.createElement('h4');
            groupHeader.className = 'comparison-group-header';
            groupHeader.textContent = situation;
            recommendationDetailsEl.appendChild(groupHeader);

            groupedBySituation[situation].forEach(({ rec, guideline, society }) => {
                recommendationDetailsEl.appendChild(createRecommendationCard(rec, guideline, society, true));
            });
        });
        recommendationDetailsEl.scrollTop = 0;
    };

    const displayGuidelines = (groupName) => {
        currentGroupName = groupName;
        const group = guidelineData.find(g => g.groupName === groupName);
        guidelineListEl.innerHTML = '';
        recommendationDetailsEl.innerHTML = placeholderRecommendations;
        recommendationTitleEl.innerHTML = `<i class="fa-solid fa-star me-2"></i>Empfehlungen`;
        guidelineMetaInfoEl.innerHTML = '';
        compareBtn.disabled = false;

        if (group && group.societies) {
            const ul = document.createElement('ul');
            ul.className = 'list-group';
            group.societies.forEach(society => {
                society.guidelines.forEach(guideline => {
                    const li = document.createElement('li');
                    li.className = 'list-group-item';
                    li.innerHTML = `<span class="guideline-item-society">${society.society}</span>${guideline.guidelineName}`;
                    li.dataset.groupName = groupName;
                    li.dataset.guidelineName = guideline.guidelineName;
                    li.dataset.societyName = society.society;
                    ul.appendChild(li);
                });
            });
            guidelineListEl.appendChild(ul);
        } else {
            guidelineListEl.innerHTML = placeholderGuidelines;
            compareBtn.disabled = true;
        }
    };

    const displayCancerGroups = (groups) => {
        cancerListEl.innerHTML = '';
        groups.sort((a, b) => a.groupName.localeCompare(b.groupName));
        groups.forEach(group => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = group.groupName;
            li.dataset.groupName = group.groupName;
            cancerListEl.appendChild(li);
        });
    };

    cancerListEl.addEventListener('click', (e) => {
        if (e.target && e.target.matches('li.list-group-item')) {
            document.querySelectorAll('#cancer-list .list-group-item').forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            displayGuidelines(e.target.dataset.groupName);
        }
    });

    guidelineListEl.addEventListener('click', (e) => {
        const targetLi = e.target.closest('li.list-group-item');
        if (targetLi) {
            document.querySelectorAll('#guideline-list .list-group-item').forEach(item => item.classList.remove('active'));
            targetLi.classList.add('active');
            const { groupName, guidelineName, societyName } = targetLi.dataset;
            displayRecommendations(groupName, guidelineName, societyName);
        }
    });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredGroups = guidelineData.filter(group => group.groupName.toLowerCase().includes(searchTerm));
        displayCancerGroups(filteredGroups);
    });

    compareBtn.addEventListener('click', () => {
        if (currentGroupName) {
            displayComparisonView(currentGroupName);
        }
    });

    recommendationDetailsEl.addEventListener('scroll', () => {
        if (recommendationDetailsEl.scrollTop > 200) {
            backToTopBtn.style.display = 'block';
        } else {
            backToTopBtn.style.display = 'none';
        }
    });

    backToTopBtn.addEventListener('click', () => {
        recommendationDetailsEl.scrollTo({ top: 0, behavior: 'smooth' });
    });

    fetchGuidelines();
});