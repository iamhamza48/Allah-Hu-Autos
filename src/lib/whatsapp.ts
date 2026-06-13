export const WHATSAPP_NUMBER = '923337778606';
export const WHATSAPP_DISPLAY_NUMBER = '03337778606';
export const WHATSAPP_DEFAULT_MESSAGE = 'Assalam o Alaikum! I have a question about Allah-Hu-Autos.';

export function formatPhoneForWhatsApp(phone: string): string {
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0')) clean = '92' + clean.slice(1);
  if (clean.length === 10) clean = '92' + clean;
  return clean;
}

export function getWhatsAppUrl(message: string, phone = WHATSAPP_NUMBER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export interface OrderWhatsAppDetails {
  orderId: string;
  customerName?: string | null;
  customerEmail?: string | null;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  notes?: string | null;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    installType?: string | null;
    variantName?: string | null;
  }>;
  total: number;
}

export function buildOrderNotificationMessage(details: OrderWhatsAppDetails): string {
  const lines: string[] = [
    '🛒 *New Order - Allah-Hu-Autos*',
    '',
    `Order ID: ${details.orderId}`,
    `Date: ${new Date().toLocaleString('en-PK')}`,
    '',
    '*Customer*',
  ];

  if (details.customerName) lines.push(`Name: ${details.customerName}`);
  if (details.customerEmail) lines.push(`Email: ${details.customerEmail}`);
  lines.push(`Phone: ${details.shippingPhone}`);
  lines.push('');
  lines.push('*Shipping*');
  lines.push(`Address: ${details.shippingAddress}`);
  lines.push(`City: ${details.shippingCity}`);
  lines.push('');
  lines.push('*Items*');

  details.items.forEach((item, i) => {
    const variant = item.variantName ? ` (${item.variantName})` : '';
    const install = item.installType ? ` [${item.installType} install]` : '';
    lines.push(`${i + 1}. ${item.name}${variant} × ${item.quantity}${install}`);
    lines.push(`   Rs ${(item.price * item.quantity).toLocaleString('en-PK')}`);
  });

  lines.push('');
  lines.push(`*Total: Rs ${details.total.toLocaleString('en-PK')}*`);

  if (details.notes?.trim()) {
    lines.push('');
    lines.push(`Notes: ${details.notes.trim()}`);
  }

  return lines.join('\n');
}

export function openWhatsAppMessage(
  message: string,
  targetWindow?: Window | null,
  phone = WHATSAPP_NUMBER
): void {
  const url = getWhatsAppUrl(message, phone);
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

export function notifyOrderViaWhatsApp(
  details: OrderWhatsAppDetails,
  targetWindow?: Window | null
): void {
  openWhatsAppMessage(buildOrderNotificationMessage(details), targetWindow);
}
