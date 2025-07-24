// src/main/resources/static/js/contabilidad/main.js

import { setupContabilidadNavigation } from './contabilidad-router.js';
import { sidebarComponent } from '../components/sidebar.js';
import { headerComponent } from '../components/header.js';
import { TransactionWizard } from '../components/transactionWizard.js';

// Global instance of the TransactionWizard
let transactionWizardInstance;

document.addEventListener('DOMContentLoaded', function() {
    // Setup dynamic navigation for contabilidad module
    setupContabilidadNavigation();

    // Initial highlight and header update based on current URL
    const initialUrl = window.location.pathname;
    sidebarComponent.highlightCurrentPage(initialUrl);
    headerComponent.updateTitleAndSubtitle(initialUrl);

    // Initialize TransactionWizard
    transactionWizardInstance = new TransactionWizard();

    // Expose wizard functions globally for HTML onclick attributes
    window.openTransactionWizard = (type) => transactionWizardInstance.open(type);
    window.closeTransactionWizard = () => transactionWizardInstance.close();
    window.wizardNextStep = () => transactionWizardInstance.nextStep();
    window.wizardPrevStep = () => transactionWizardInstance.prevStep();
});