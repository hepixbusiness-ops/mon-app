import { Transaction, Category, Debt, CreditClient, Goal, Tontine } from '../types';
import { formatFCFA } from '../constants/theme';

export interface CoachContext {
  transactions: Transaction[];
  categories: Category[];
  debts: Debt[];
  creditClients: CreditClient[];
  goals: Goal[];
  tontine: Tontine | null;
  firstName: string;
  monthlyBudget?: number;
}

export interface ProcessedContext {
  totalExpenses: number;
  totalIncome: number;
  topCategories: { id: string; name: string; emoji: string; amount: number; budget: number }[];
  impulseTotal: number;
  regretTotal: number;
  maquis: number;
  forfait: number;
  transport: number;
  famille: number;
  debtOwed: number;
  debtOwe: number;
  ardoiseTotal: number;
  pendingGoals: Goal[];
  tontine: Tontine | null;
  monthlyBudget: number;
  savingsRate: number;
  firstName: string;
}

export function buildCoachContext(ctx: CoachContext): ProcessedContext {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const monthExpenses = ctx.transactions.filter(t => t.type === 'expense' && t.date.startsWith(month));
  const monthIncome = ctx.transactions.filter(t => t.type === 'income' && t.date.startsWith(month));

  const totalExpenses = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const totalIncome = monthIncome.reduce((s, t) => s + t.amount, 0);

  const byCat: Record<string, number> = {};
  for (const t of monthExpenses) {
    byCat[t.categoryId] = (byCat[t.categoryId] || 0) + t.amount;
  }

  const topCategories = ctx.categories
    .filter(c => c.type === 'expense' && byCat[c.id])
    .map(c => ({ id: c.id, name: c.name, emoji: c.emoji, amount: byCat[c.id] || 0, budget: c.budget || 0 }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const impulseTotal = ctx.transactions.filter(t => t.emotion === 'impulse').reduce((s, t) => s + t.amount, 0);
  const regretTotal = ctx.transactions.filter(t => t.emotion === 'regret').reduce((s, t) => s + t.amount, 0);

  const debtOwed = ctx.debts.filter(d => d.direction === 'owed' && d.status === 'pending').reduce((s, d) => s + d.amount, 0);
  const debtOwe = ctx.debts.filter(d => d.direction === 'owe' && d.status === 'pending').reduce((s, d) => s + d.amount, 0);
  const ardoiseTotal = ctx.creditClients.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0);

  const monthlyBudget = ctx.monthlyBudget ?? 300000;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  return {
    totalExpenses,
    totalIncome,
    topCategories,
    impulseTotal,
    regretTotal,
    maquis: byCat['maquis'] || 0,
    forfait: byCat['forfait'] || 0,
    transport: byCat['transport'] || 0,
    famille: byCat['famille'] || 0,
    debtOwed,
    debtOwe,
    ardoiseTotal,
    pendingGoals: ctx.goals.filter(g => g.status === 'active'),
    tontine: ctx.tontine,
    monthlyBudget,
    savingsRate,
    firstName: ctx.firstName,
  };
}

export function ruleReply(message: string, ctx: ProcessedContext, firstName: string): string {
  const msg = message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const name = firstName || 'toi';

  // Salutation
  if (msg.match(/\b(bonjour|salut|bonsoir|hey|hello|coucou)\b/)) {
    return `Salut ${name} ! 👋 Je suis ton coach financier FinanceOS. Comment puis-je t'aider aujourd'hui ? Tu peux me poser des questions sur tes dépenses, ton budget, tes dettes ou tes objectifs.`;
  }

  // Merci
  if (msg.match(/\b(merci|thanks|cool|parfait|super)\b/)) {
    return `Avec plaisir ${name} ! 😊 N'hésite pas si tu as d'autres questions sur tes finances.`;
  }

  // Analyse dépenses
  if (msg.match(/(analyse|analyser|depenses|spendings|bilan|situation)/)) {
    const bal = ctx.totalIncome - ctx.totalExpenses;
    const balSign = bal >= 0 ? '+' : '';
    const topStr = ctx.topCategories.slice(0, 3).map(c => `${c.emoji} ${c.name}: ${formatFCFA(c.amount)}`).join('\n');
    return `📊 Voici ton bilan du mois ${name}:\n\n💰 Revenus: ${formatFCFA(ctx.totalIncome)}\n💸 Dépenses: ${formatFCFA(ctx.totalExpenses)}\n${balSign === '+' ? '✅' : '⚠️'} Solde: ${balSign}${formatFCFA(Math.abs(bal))}\n\nTop dépenses:\n${topStr}\n\nTaux d'épargne: ${ctx.savingsRate.toFixed(1)}%`;
  }

  // Impulsif / regret
  if (msg.match(/(impulsif|impuls|regret|emotion|envie|plaisir)/)) {
    if (ctx.impulseTotal > 0 || ctx.regretTotal > 0) {
      return `😬 Dépenses impulsives ce mois: ${formatFCFA(ctx.impulseTotal)}\n😔 Dépenses regrettées: ${formatFCFA(ctx.regretTotal)}\n\nConseil: avant chaque achat non-essentiel, attends 24h. Si tu en as toujours besoin demain, c'est moins impulsif ! 💡`;
    }
    return `Bonne nouvelle ${name} ! Tes dépenses émotionnelles semblent bien maîtrisées ce mois-ci. Continue comme ça ! 💪`;
  }

  // WhatsApp / relancer
  if (msg.match(/(relancer|whatsapp|rappel|rappeler|client|debiteur)/)) {
    if (ctx.debtOwed > 0) {
      return `📱 Tu peux relancer tes débiteurs depuis l'onglet Dettes. Montant total à récupérer: ${formatFCFA(ctx.debtOwed)}.\n\nLe bouton "WhatsApp" génère un message professionnel automatiquement.`;
    }
    if (ctx.ardoiseTotal > 0) {
      return `📱 Ardoise totale: ${formatFCFA(ctx.ardoiseTotal)}. Va dans l'onglet Ardoise pour relancer tes clients via WhatsApp.`;
    }
    return `Aucune dette en attente. Tu es à jour avec tes créances ! ✅`;
  }

  // Ardoise
  if (msg.match(/(ardoise|credit client|creance|clients doivent)/)) {
    if (ctx.ardoiseTotal > 0) {
      return `🏪 Ardoise totale: ${formatFCFA(ctx.ardoiseTotal)}\n\nConseil: relance tes clients régulièrement. L'ardoise qui traîne devient difficile à récupérer après 30 jours.`;
    }
    return `Pas d'ardoise en cours. Tous tes clients sont à jour ! ✅`;
  }

  // Dette
  if (msg.match(/(dette|doit|prete|emprunte|rembours)/)) {
    const lines = [];
    if (ctx.debtOwed > 0) lines.push(`💚 On te doit: ${formatFCFA(ctx.debtOwed)}`);
    if (ctx.debtOwe > 0) lines.push(`🔴 Tu dois: ${formatFCFA(ctx.debtOwe)}`);
    if (lines.length === 0) return `Pas de dettes en cours. Situation saine ! ✅`;
    return `💼 Situation des dettes:\n\n${lines.join('\n')}\n\nConseille: priorise le remboursement de tes dettes avant d'épargner.`;
  }

  // Tontine
  if (msg.match(/(tontine|njangi|cotis)/)) {
    if (ctx.tontine) {
      return `🤝 Tontine "${ctx.tontine.name}":\n• ${ctx.tontine.members} membres\n• ${formatFCFA(ctx.tontine.amountPerMonth)}/mois\n• Ta position: ${ctx.tontine.position}\n• Prochain tirage: ${ctx.tontine.nextDrawDate}\n• Pot: ${formatFCFA(ctx.tontine.potAmount)}\n\nLa tontine est une excellente stratégie d'épargne communautaire ! 💪`;
    }
    return `Tu n'as pas de tontine active. Tu peux en rejoindre une dans l'onglet Épargne.`;
  }

  // Forfait/Recharge
  if (msg.match(/(forfait|recharge|momo|frais transfert|om|orange money)/)) {
    const total = ctx.forfait;
    return `📱 Forfaits & recharges ce mois: ${formatFCFA(total)}\n\nAstuce: compare les forfaits MTN et Orange Money. Le forfait mensuel est souvent 30-40% moins cher que les recharges à la demande. Économie potentielle: ${formatFCFA(total * 0.3)}/mois.`;
  }

  // Épargne / objectif
  if (msg.match(/(epargne|objectif|goal|economiser|economie|economis)/)) {
    if (ctx.pendingGoals.length > 0) {
      const goalStr = ctx.pendingGoals.slice(0, 3).map(g => {
        const pct = Math.round((g.savedAmount / g.targetAmount) * 100);
        return `${g.icon} ${g.name}: ${pct}% (${formatFCFA(g.savedAmount)}/${formatFCFA(g.targetAmount)})`;
      }).join('\n');
      return `🎯 Tes objectifs d'épargne:\n\n${goalStr}\n\nTaux d'épargne actuel: ${ctx.savingsRate.toFixed(1)}%. Idéal: 20%+`;
    }
    return `Pas d'objectifs actifs. Crée un objectif dans l'onglet Épargne pour mieux économiser ! 🎯`;
  }

  // Transport
  if (msg.match(/(transport|taxi|moto|bus|deplacement)/)) {
    const t = ctx.transport;
    return `🚕 Transport ce mois: ${formatFCFA(t)}\n\nConseil: le covoiturage et les motos-taxis partagés peuvent réduire tes frais de transport de 30-50%. ${t > 20000 ? `Tu dépasses ton budget transport !` : 'Tu es dans les limites de ton budget.'}`;
  }

  // Maquis
  if (msg.match(/(maquis|resto|restaurant|sortie|boire|manger)/)) {
    const m = ctx.maquis;
    return `🍢 Maquis & sorties ce mois: ${formatFCFA(m)}\n\n${m > 30000 ? `⚠️ Tu as dépassé ton budget maquis ! Essaie de limiter les sorties au maquis à 2-3 fois par semaine.` : `✅ Tes sorties maquis sont raisonnables ce mois-ci.`}`;
  }

  // Famille
  if (msg.match(/(famille|parent|transfert|envoyer|solidarite)/)) {
    return `💸 Transferts famille ce mois: ${formatFCFA(ctx.famille)}\n\nLa solidarité familiale est importante, mais fixe-toi un plafond mensuel (ex: max 10% de tes revenus) pour ne pas déséquilibrer ton budget.`;
  }

  // Commerce / boutique
  if (msg.match(/(commerce|boutique|vente|business|entrepreneur|chiffre)/)) {
    return `🏪 Mode commerce activé dans FinanceOS te permet de suivre:\n• Chiffre d'affaires\n• Marges nettes\n• Ardoise clients\n• Rapport PDF\n\nActive-le dans Réglages → Mode Commerce.`;
  }

  // Budget / plafond
  if (msg.match(/(budget|plafond|limite|depasse|depassement)/)) {
    const overBudget = ctx.topCategories.filter(c => c.budget > 0 && c.amount > c.budget);
    if (overBudget.length > 0) {
      const str = overBudget.map(c => `${c.emoji} ${c.name}: ${formatFCFA(c.amount)} / ${formatFCFA(c.budget)}`).join('\n');
      return `⚠️ Catégories dépassées:\n\n${str}\n\nAjuste tes habitudes ou augmente tes budgets dans l'onglet Budget.`;
    }
    return `✅ Bravo ${name} ! Tu respectes tous tes budgets ce mois-ci. Continue comme ça !`;
  }

  // Pourquoi je dépense trop
  if (msg.match(/(pourquoi|trop|depense trop|diminuer|reduire)/)) {
    const reasons = [];
    if (ctx.impulseTotal > 10000) reasons.push(`• Achats impulsifs: ${formatFCFA(ctx.impulseTotal)}`);
    if (ctx.maquis > 25000) reasons.push(`• Sorties maquis fréquentes: ${formatFCFA(ctx.maquis)}`);
    if (ctx.forfait > 15000) reasons.push(`• Forfaits téléphoniques: ${formatFCFA(ctx.forfait)}`);
    if (ctx.famille > 30000) reasons.push(`• Transferts famille importants: ${formatFCFA(ctx.famille)}`);

    if (reasons.length === 0) return `Tes dépenses semblent raisonnables ce mois ${name}. Continue ton bon travail ! 💪`;
    return `🔍 Principales sources de dépenses excessives:\n\n${reasons.join('\n')}\n\nFixe des plafonds dans l'onglet Budget pour mieux contrôler.`;
  }

  // Default
  return `Je n'ai pas compris ta question ${name}. Tu peux me demander:\n• "Analyse mes dépenses"\n• "Pourquoi je dépense trop ?"\n• "Mes dettes"\n• "Mon objectif épargne"\n• "Budget maquis"\n• "Ma tontine"`;
}

export const COACH_QUICKS = [
  'Analyse mes dépenses',
  'Pourquoi je dépense trop ?',
  'Comment épargner plus ?',
  'Mes dettes et créances',
  'Ma tontine',
  'Budget maquis',
  'Frais Mobile Money',
  'Relancer mes clients',
];
