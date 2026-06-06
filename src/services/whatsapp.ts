import { Linking } from 'react-native';
import { formatFCFA } from '../constants/theme';

export function draftRelance(name: string, amount: number, items?: string): string {
  const amountStr = formatFCFA(amount);
  const itemsLine = items ? `\n\nArticles: ${items}` : '';
  return `Bonjour ${name},\n\nJe vous contacte concernant votre solde en cours de *${amountStr}*.${itemsLine}\n\nMerci de bien vouloir régulariser votre situation dans les meilleurs délais.\n\nCordialement 🙏`;
}

export async function openWhatsApp(phone: string, message: string): Promise<void> {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/^\+/, '');
  const encodedMessage = encodeURIComponent(message);
  const url = `whatsapp://send?phone=${cleanPhone}&text=${encodedMessage}`;
  const webUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    await Linking.openURL(webUrl);
  }
}
