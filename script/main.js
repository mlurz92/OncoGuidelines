class App {
    constructor() {
        this.data = new GuidelineData('data/OncoGuidelines.json');
        this.ui = new UIController();
        this.tumorEntities = [];
        this.menuHoverTimeout = null;
    }

    async init() {
        this.ui.clearContent();
        this.loadTheme();
        this.setupEventListeners();
        try {
            this.tumorEntities = await this.data.getTumorEntities();
            this.ui.populateNavigation(this.tumorEntities);
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    setupEventListeners() {
        this.ui.navList.addEventListener('click', this.handleNavClick.bind(this));
        this.ui.navList.addEventListener('mouseover', this.handleNavMouseOver.bind(this));
        this.ui.navList.addEventListener('mouseout', this.handleNavMouseOut.bind(this));
        
        this.ui.guidelineTabsContainer.addEventListener('click', this.handleTabClick.bind(this));
        document.getElementById('theme-switcher').addEventListener('click', this.toggleTheme.bind(this));
        this.ui.guidelineContentWrapper.addEventListener('click', this.handleAccordionClick.bind(this));
    }

    handleNavMouseOver(event) {
        const targetLi = event.target.closest('li');
        if (!targetLi) return;

        if (this.menuHoverTimeout) {
            clearTimeout(this.menuHoverTimeout);
        }

        const parentUl = targetLi.parentElement;
        parentUl.querySelectorAll('.menu-open').forEach(li => {
            if (li !== targetLi) {
                li.classList.remove('menu-open');
            }
        });

        if (targetLi.querySelector('ul')) {
            targetLi.classList.add('menu-open');
        }
    }

    handleNavMouseOut(event) {
        const targetLi = event.target.closest('li');
        if (!targetLi) return;

        this.menuHoverTimeout = setTimeout(() => {
            document.querySelectorAll('#nav-list .menu-open').forEach(li => {
                li.classList.remove('menu-open');
            });
        }, 200);
    }

    handleNavClick(event) {
        let target = event.target.closest('a');
        if (target && target.dataset.entityIndex !== undefined) {
            event.preventDefault();
            const { entityIndex, subtypeIndex, guidelineIndex } = target.dataset;
            this.loadAndDisplayGuideline(
                parseInt(entityIndex),
                parseInt(subtypeIndex),
                parseInt(guidelineIndex)
            );
        }
    }

    handleTabClick(event) {
        let target = event.target.closest('.guideline-tab');
        if (target && target.dataset.guidelineIndex !== undefined) {
            event.preventDefault();
            const { entityIndex, subtypeIndex, guidelineIndex } = target.dataset;
            this.loadAndDisplayGuideline(
                parseInt(entityIndex),
                parseInt(subtypeIndex),
                parseInt(guidelineIndex)
            );
        }
    }

    handleAccordionClick(event) {
        const header = event.target.closest('.recommendation-group-header');
        if (header) {
            const group = header.parentElement;
            group.classList.toggle('open');
        }
    }

    async loadAndDisplayGuideline(entityIndex, subtypeIndex, guidelineIndex) {
        this.ui.showLoading();
        try {
            const entity = this.tumorEntities[entityIndex];
            const subtype = entity.subtypes[subtypeIndex];
            const guideline = await this.data.getGuideline(entityIndex, subtypeIndex, guidelineIndex);
            const allGuidelinesForSubtype = await this.data.getGuidelinesForSubtype(entityIndex, subtypeIndex);
            
            if (guideline) {
                const entityDisplayName = entity.subtypes.length > 1 && entity.entityName !== subtype.subtypeName ? `${entity.entityName} - ${subtype.subtypeName}` : entity.entityName;
                this.ui.renderTabs(allGuidelinesForSubtype, guidelineIndex, entityIndex, subtypeIndex);
                this.ui.renderGuideline(guideline, entityDisplayName);
                this.ui.updateActiveNav(entityIndex, subtypeIndex, guidelineIndex);
            } else {
                this.ui.showError('Die ausgewählte Leitlinie konnte nicht gefunden werden.');
            }
        } catch (error) {
            this.ui.showError(error.message);
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        const theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        this.saveTheme(theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('oncoGuidelinesTheme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }

    saveTheme(theme) {
        localStorage.setItem('oncoGuidelinesTheme', theme);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});