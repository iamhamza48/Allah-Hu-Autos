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
    maximumPrice?: number | null;
    installType?: string | null;
    variantName?: string | null;
  }>;
  total: number;
  maximumTotal?: number | null;
  installation?: {
    branch: string;
    date: string;
    time: string;
    vehicle: string;
  };
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
    const minimum = item.price * item.quantity;
    const maximum = (item.maximumPrice ?? item.price) * item.quantity;
    lines.push(maximum > minimum
      ? `   Rs ${minimum.toLocaleString('en-PK')} – Rs ${maximum.toLocaleString('en-PK')} (estimate)`
      : `   Rs ${minimum.toLocaleString('en-PK')}`);
  });

  lines.push('');
  lines.push('Delivery charges: Rs 0');
  if (details.maximumTotal && details.maximumTotal > details.total) {
    lines.push(`*Estimated total: Rs ${details.total.toLocaleString('en-PK')} – Rs ${details.maximumTotal.toLocaleString('en-PK')}*`);
    lines.push('Final price will be confirmed after the order is placed.');
  } else {
    lines.push(`*Total: Rs ${details.total.toLocaleString('en-PK')}*`);
  }

  if (details.installation) {
    lines.push('');
    lines.push('*Professional Installation*');
    lines.push(`Branch: ${details.installation.branch}`);
    lines.push(`Preferred date: ${details.installation.date}`);
    lines.push(`Preferred time: ${details.installation.time}`);
    lines.push(`Vehicle: ${details.installation.vehicle}`);
  }

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

export interface BookingWhatsAppDetails {
  bookingId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  services: string[];
  branch: string;
  date: string;
  time: string;
  notes?: string | null;
}

export function buildBookingNotificationMessage(details: BookingWhatsAppDetails): string {
  const lines = [
    '🔧 *New Service Booking - Allah-Hu-Autos*',
    '',
    ...(details.bookingId ? [`Booking ID: ${details.bookingId}`] : []),
    `Customer: ${details.customerName}`,
    `Phone: ${details.customerPhone}`,
    ...(details.customerEmail ? [`Email: ${details.customerEmail}`] : []),
    '',
    `Services: ${details.services.join(', ')}`,
    `Branch: ${details.branch}`,
    `Preferred date: ${details.date}`,
    `Preferred time: ${details.time}`,
  ];

  if (details.notes?.trim()) {
    lines.push('', `Notes: ${details.notes.trim()}`);
  }

  return lines.join('\n');
}

export function notifyBookingViaWhatsApp(
  details: BookingWhatsAppDetails,
  targetWindow?: Window | null
): void {
  openWhatsAppMessage(buildBookingNotificationMessage(details), targetWindow);
}
