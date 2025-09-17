if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

let allData = [];
let patientenpfade = [];
let currentPath = [];
let historyStack = [];

document.addEventListener('DOMContentLoaded', function() {
    fetch('data/OncoGuidelines.json')
        .then(response => response.json())
        .then(data => {
            allData = data;
            patientenpfade = data.patientenpfade;
            populateDropdowns();
            document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
            document.getElementById('reset-button').addEventListener('click', resetApplication);
            document.getElementById('back-button').addEventListener('click', goBack);
            document.getElementById('info-button').addEventListener('click', () => showInfoModal());
            document.querySelector('.modal .close-button').addEventListener('click', hideInfoModal);
            window.addEventListener('click', event => {
                if (event.target == document.getElementById('info-modal')) {
                    hideInfoModal();
                }
            });
            updateBackButtonState();
        })
        .catch(error => console.error('Error loading the JSON data: ', error));
});

function populateDropdowns() {
    const organDropdown = document.getElementById('organ-dropdown');
    const leitsymptomDropdown = document.getElementById('leitsymptom-dropdown');
    
    organDropdown.innerHTML = '<option value="">Organ/Erkrankung wählen</option>';
    leitsymptomDropdown.innerHTML = '<option value="">Leitsymptom wählen</option>';
    leitsymptomDropdown.disabled = true;

    const organs = [...new Set(patientenpfade.map(p => p.organ))].sort();
    organs.forEach(organ => {
        const option = document.createElement('option');
        option.value = organ;
        option.textContent = organ;
        organDropdown.appendChild(option);
    });

    organDropdown.addEventListener('change', function() {
        const selectedOrgan = this.value;
        populateLeitsymptomDropdown(selectedOrgan);
    });

    leitsymptomDropdown.addEventListener('change', function() {
        const selectedOrgan = organDropdown.value;
        const selectedLeitsymptom = this.value;
        startPath(selectedOrgan, selectedLeitsymptom);
    });
}

function populateLeitsymptomDropdown(organ) {
    const leitsymptomDropdown = document.getElementById('leitsymptom-dropdown');
    leitsymptomDropdown.innerHTML = '<option value="">Leitsymptom wählen</option>';
    
    if (organ) {
        const leitsymptome = [...new Set(patientenpfade
            .filter(p => p.organ === organ)
            .map(p => p.leitsymptom))]
            .sort();
        
        leitsymptome.forEach(leitsymptom => {
            const option = document.createElement('option');
            option.value = leitsymptom;
            option.textContent = leitsymptom;
            leitsymptomDropdown.appendChild(option);
        });
        leitsymptomDropdown.disabled = false;
    } else {
        leitsymptomDropdown.disabled = true;
    }
}

function startPath(organ, leitsymptom) {
    if (!organ || !leitsymptom) return;
    historyStack = [];
    currentPath = patientenpfade.filter(p => p.organ === organ && p.leitsymptom === leitsymptom);
    historyStack.push(JSON.parse(JSON.stringify(currentPath)));
    updateBackButtonState();
    displayPath();
}

function displayPath() {
    const container = document.getElementById('path-container');
    container.innerHTML = '';

    if (!currentPath || currentPath.length === 0) return;

    const uniqueSteps = currentPath.reduce((acc, curr) => {
        const existing = acc.find(item => item.id === curr.id);
        if (!existing) {
            acc.push(curr);
        } else {
            if (!Array.isArray(existing.antwort)) {
                existing.antwort = [existing.antwort];
            }
            if (Array.isArray(curr.antwort)) {
                curr.antwort.forEach(a => {
                    if (!existing.antwort.includes(a)) {
                        existing.antwort.push(a);
                    }
                });
            } else {
                if (!existing.antwort.includes(curr.antwort)) {
                    existing.antwort.push(curr.antwort);
                }
            }
        }
        return acc;
    }, []);

    uniqueSteps.forEach(step => {
        const stepElement = createStepElement(step);
        container.appendChild(stepElement);
    });
}

function createStepElement(step) {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'path-step';

    if (step.frage) {
        const frageP = document.createElement('p');
        frageP.className = 'question';
        frageP.textContent = step.frage;
        stepDiv.appendChild(frageP);
    } else if (step.diagnose) {
        const diagnoseP = document.createElement('p');
        diagnoseP.className = 'diagnosis';
        diagnoseP.textContent = "Finale Diagnose: " + step.diagnose;
        stepDiv.appendChild(diagnoseP);
        if (step.beschreibung) {
            const beschreibungP = document.createElement('p');
            beschreibungP.className = 'description';
            beschreibungP.innerHTML = formatText(step.beschreibung);
            stepDiv.appendChild(beschreibungP);
        }
    }

    if (step.antwort && Array.isArray(step.antwort)) {
        step.antwort.forEach(antwortText => {
            const button = document.createElement('button');
            button.textContent = antwortText;
            button.className = 'answer-button';
            button.onclick = () => handleAnswer(step, antwortText);
            stepDiv.appendChild(button);
        });
    } else if (step.antwort) {
        const button = document.createElement('button');
        button.textContent = step.antwort;
        button.className = 'answer-button';
        button.onclick = () => handleAnswer(step, step.antwort);
        stepDiv.appendChild(button);
    }
    
    if (step.empfehlung) {
        const recommendationP = document.createElement('p');
        recommendationP.className = 'recommendation';
        recommendationP.innerHTML = `<strong>Empfehlung:</strong> ${formatText(step.empfehlung)}`;
        stepDiv.appendChild(recommendationP);
    }

    return stepDiv;
}

function handleAnswer(step, antwortText) {
    historyStack.push(JSON.parse(JSON.stringify(currentPath)));
    
    const nextSteps = allData.patientenpfade.filter(p => p.vorherige_id === step.id && p.antwort_trigger === antwortText);

    if (nextSteps.length > 0) {
        currentPath = nextSteps;
    } else {
        currentPath = [];
    }
    
    updateBackButtonState();
    displayPath();
}


function formatText(text) {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle('light-theme');
    body.classList.toggle('dark-theme');
}

function resetApplication() {
    currentPath = [];
    historyStack = [];
    document.getElementById('path-container').innerHTML = '';
    const organDropdown = document.getElementById('organ-dropdown');
    const leitsymptomDropdown = document.getElementById('leitsymptom-dropdown');
    organDropdown.selectedIndex = 0;
    leitsymptomDropdown.innerHTML = '<option value="">Leitsymptom wählen</option>';
    leitsymptomDropdown.disabled = true;
    updateBackButtonState();
}

function goBack() {
    if (historyStack.length > 1) {
        historyStack.pop();
        currentPath = historyStack[historyStack.length - 1];
        displayPath();
    } else if (historyStack.length === 1) {
        resetApplication();
    }
    updateBackButtonState();
}

function updateBackButtonState() {
    const backButton = document.getElementById('back-button');
    if (historyStack.length > 0) {
        backButton.disabled = false;
    } else {
        backButton.disabled = true;
    }
}

function showInfoModal() {
    const modal = document.getElementById('info-modal');
    const modalBody = modal.querySelector('.modal-body');
    
    modalBody.innerHTML = `
        <p><strong>Letzte Aktualisierung der Daten:</strong> ${allData.version}</p>
        <h3>Impressum</h3>
        <p>${formatText(allData.impressum)}</p>
        <h3>Haftungsausschluss</h3>
        <p>${formatText(allData.haftungsausschluss)}</p>
        <h3>Datenschutz</h3>
        <p>${formatText(allData.datenschutz)}</p>
    `;
    modal.style.display = 'block';
}


function hideInfoModal() {
    const modal = document.getElementById('info-modal');
    modal.style.display = 'none';
}
