export interface Emotion {
  id: string;
  emoji: string;
  label: string;
  color: string;
}

export const EMOTIONS: Emotion[] = [
  { id: 'happy', emoji: '😊', label: 'Content', color: '#34d399' },
  { id: 'neutral', emoji: '😐', label: 'Neutre', color: '#94a3b8' },
  { id: 'need', emoji: '✅', label: 'Nécessaire', color: '#60a5fa' },
  { id: 'impulse', emoji: '😬', label: 'Impulsif', color: '#fbbf24' },
  { id: 'regret', emoji: '😔', label: 'Regret', color: '#f87171' },
];
