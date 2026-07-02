import { describe, expect, it } from 'vitest';
import { buildBookingNotificationMessage, buildOrderNotificationMessage } from '@/lib/whatsapp';

describe('service booking WhatsApp notification', () => {
  it('includes the booking and appointment details', () => {
    const message = buildBookingNotificationMessage({
      bookingId: 'booking-123',
      customerName: 'Ali Khan',
      customerEmail: 'ali@example.com',
      customerPhone: '03001234567',
      services: ['PPF', 'DETAILING'],
      branch: 'Lahore Branch',
      date: '2026-07-10',
      time: '11:00 AM',
      notes: 'Toyota Corolla 2022',
    });

    expect(message).toContain('booking-123');
    expect(message).toContain('Ali Khan');
    expect(message).toContain('03001234567');
    expect(message).toContain('PPF, DETAILING');
    expect(message).toContain('Lahore Branch');
    expect(message).toContain('2026-07-10');
    expect(message).toContain('11:00 AM');
    expect(message).toContain('Toyota Corolla 2022');
  });
});

describe('order WhatsApp notification', () => {
  it('shows free delivery separately from the total', () => {
    const message = buildOrderNotificationMessage({
      orderId: 'order-123',
      shippingPhone: '03001234567',
      shippingAddress: 'Bahria Town',
      shippingCity: 'Lahore',
      items: [{ name: 'LED', quantity: 1, price: 5000 }],
      total: 5000,
    });

    expect(message).toContain('Delivery charges: Rs 0');
    expect(message).toContain('Total: Rs 5,000');
  });

  it('labels ranged prices as estimates pending confirmation', () => {
    const message = buildOrderNotificationMessage({
      orderId: 'order-456',
      shippingPhone: '03001234567',
      shippingAddress: 'Bahria Town',
      shippingCity: 'Lahore',
      items: [{ name: 'TXR Air Press', quantity: 1, price: 5500, maximumPrice: 12000 }],
      total: 5500,
      maximumTotal: 12000,
    });

    expect(message).toContain('Estimated total: Rs 5,500 – Rs 12,000');
    expect(message).toContain('Final price will be confirmed');
  });
});
