class GuidelineData {
    constructor(filePath) {
        this.filePath = filePath;
        this.guidelinesData = null;
    }

    async loadData() {
        if (this.guidelinesData) {
            return this.guidelinesData;
        }
        try {
            const response = await fetch(this.filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            this.guidelinesData = await response.json();
            return this.guidelinesData;
        } catch (error) {
            console.error('Failed to load guideline data:', error);
            throw new Error('Die Leitlinien-Datenbank konnte nicht geladen werden. Bitte überprüfen Sie die Dateiverfügbarkeit und das Format.');
        }
    }

    async getTumorEntities() {
        await this.loadData();
        return this.guidelinesData.tumorEntities || [];
    }

    async getGuideline(entityIndex, subtypeIndex, guidelineIndex) {
        await this.loadData();
        try {
            return this.guidelinesData.tumorEntities[entityIndex]
                .subtypes[subtypeIndex]
                .guidelines[guidelineIndex];
        } catch (e) {
            console.error(`Could not retrieve guideline for indices: ${entityIndex}, ${subtypeIndex}, ${guidelineIndex}`, e);
            return null;
        }
    }
    
    async getGuidelinesForSubtype(entityIndex, subtypeIndex) {
        await this.loadData();
        try {
            return this.guidelinesData.tumorEntities[entityIndex]
                .subtypes[subtypeIndex]
                .guidelines;
        } catch (e) {
            console.error(`Could not retrieve guidelines for subtype indices: ${entityIndex}, ${subtypeIndex}`, e);
            return [];
        }
    }
}