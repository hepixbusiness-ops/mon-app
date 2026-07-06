import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const fr = {
  common: {
    income: 'Revenus', expense: 'Dépenses', balance: 'Solde', save: 'Enregistrer',
    cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', add: 'Ajouter',
    total: 'Total', amount: 'Montant', date: 'Date', description: 'Description',
    category: 'Catégorie', confirm: 'Confirmer', close: 'Fermer', search: 'Rechercher',
    loading: 'Chargement...', empty: 'Aucun élément', paid: 'Payé', pending: 'En attente',
    active: 'Actif', completed: 'Terminé',
  },
  nav: {
    dashboard: 'Tableau de bord', transactions: 'Transactions', goals: 'Objectifs',
    tontines: 'Tontines', debts: 'Dettes', clients: 'Clients crédit',
    notifications: 'Notifications', settings: 'Paramètres',
  },
  dashboard: {
    hello: 'Bonjour', wallet: 'Portefeuille', thisMonth: 'Ce mois', budget: 'Budget',
    recentTxns: 'Transactions récentes', seeAll: 'Voir tout',
  },
  txn: {
    add: 'Nouvelle transaction', method: 'Méthode de paiement',
    cash: 'Espèces', card: 'Carte', mtn: 'MTN Mobile Money', om: 'Orange Money',
    wave: 'Wave', moov: 'Moov Money',
  },
  settings: {
    title: 'Paramètres', profile: 'Profil', firstName: 'Prénom', walletName: 'Nom du portefeuille',
    currency: 'Devise', language: 'Langue', theme: 'Thème', dark: 'Sombre', light: 'Clair',
    mode: 'Mode', perso: 'Personnel', commerce: 'Commerce', security: 'Sécurité',
    pin: 'Code PIN', pinEnable: 'Activer le code PIN', monthlyBudget: 'Budget mensuel',
  },
}

const en = {
  common: {
    income: 'Income', expense: 'Expenses', balance: 'Balance', save: 'Save',
    cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add',
    total: 'Total', amount: 'Amount', date: 'Date', description: 'Description',
    category: 'Category', confirm: 'Confirm', close: 'Close', search: 'Search',
    loading: 'Loading...', empty: 'No items', paid: 'Paid', pending: 'Pending',
    active: 'Active', completed: 'Completed',
  },
  nav: {
    dashboard: 'Dashboard', transactions: 'Transactions', goals: 'Goals',
    tontines: 'Tontines', debts: 'Debts', clients: 'Credit Clients',
    notifications: 'Notifications', settings: 'Settings',
  },
  dashboard: {
    hello: 'Hello', wallet: 'Wallet', thisMonth: 'This month', budget: 'Budget',
    recentTxns: 'Recent transactions', seeAll: 'See all',
  },
  txn: {
    add: 'New transaction', method: 'Payment method',
    cash: 'Cash', card: 'Card', mtn: 'MTN Mobile Money', om: 'Orange Money',
    wave: 'Wave', moov: 'Moov Money',
  },
  settings: {
    title: 'Settings', profile: 'Profile', firstName: 'First name', walletName: 'Wallet name',
    currency: 'Currency', language: 'Language', theme: 'Theme', dark: 'Dark', light: 'Light',
    mode: 'Mode', perso: 'Personal', commerce: 'Commerce', security: 'Security',
    pin: 'PIN code', pinEnable: 'Enable PIN code', monthlyBudget: 'Monthly budget',
  },
}

i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n
