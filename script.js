document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('mainContent');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('detailModal');
    const modalBody = document.getElementById('modalBody');
    const closeButton = document.querySelector('.close-button');

    let allPaths = [];

    async function fetchData() {
        try {
            const response = await fetch('data/OncoGuidelines.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            allPaths = data.onkologische_leitlinien;
            displayPaths(allPaths);
        } catch (error) {
            mainContent.innerHTML = '<p class="error-message">Fehler beim Laden der Leitlinien. Bitte versuchen Sie es später erneut.</p>';
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    function createPathCard(path) {
        const card = document.createElement('div');
        card.className = 'path-card';
        card.dataset.pathId = path.id;

        const title = document.createElement('h2');
        title.textContent = path.name;
        card.appendChild(title);

        const tagsContainer = document.createElement('div');
        tagsContainer.className = 'tags';
        path.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.textContent = tag;
            tagsContainer.appendChild(tagElement);
        });
        card.appendChild(tagsContainer);

        card.addEventListener('click', () => openModal(path));
        return card;
    }

    function displayPaths(paths) {
        mainContent.innerHTML = '';
        if (paths.length === 0) {
            mainContent.innerHTML = '<p class="no-results-message">Keine Pfade für Ihre Suche gefunden.</p>';
        } else {
            paths.forEach(path => {
                const card = createPathCard(path);
                mainContent.appendChild(card);
            });
        }
    }

    function filterPaths() {
        const query = searchInput.value.toLowerCase().trim();
        const filteredPaths = allPaths.filter(path => {
            return (
                path.name.toLowerCase().includes(query) ||
                path.tags.some(tag => tag.toLowerCase().includes(query)) ||
                path.beschreibung.toLowerCase().includes(query)
            );
        });
        displayPaths(filteredPaths);
    }

    function openModal(path) {
        modalBody.innerHTML = createModalContent(path);
        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    function createModalContent(path) {
        let content = `<h2>${path.name}</h2>`;
        content += `<p>${path.beschreibung}</p>`;
        content += `<h3>Diagnostischer Pfad</h3>`;

        path.diagnostik_schritte.forEach(schritt => {
            content += `<div class="step">`;
            content += `<h4>${schritt.name}</h4>`;
            if (schritt.beschreibung) {
                content += `<p>${schritt.beschreibung}</p>`;
            }
            if (schritt.untersuchungen && schritt.untersuchungen.length > 0) {
                content += `<ul>`;
                schritt.untersuchungen.forEach(untersuchung => {
                    content += `<li><strong>${untersuchung.methode}:</strong> ${untersuchung.details}</li>`;
                });
                content += `</ul>`;
            }
            content += `</div>`;
        });
        return content;
    }

    searchInput.addEventListener('input', filterPaths);

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });

    fetchData();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
