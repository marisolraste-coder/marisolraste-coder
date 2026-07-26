class PaymentProvider {
  async createPayment() { throw new Error('Método no implementado'); }
  async confirmPayment() { throw new Error('Método no implementado'); }
  async getPaymentStatus() { throw new Error('Método no implementado'); }
  async refundPayment() { throw new Error('Método no implementado'); }
}

class ManualPaymentProvider extends PaymentProvider {
  async createPayment({ method, amount, receiptUrl }) {
    if (!['YAPE', 'PLIN', 'TRANSFER'].includes(method)) throw new Error('Método manual no válido');
    if (!receiptUrl) throw new Error('Adjunta el comprobante de pago');
    return { paymentStatus: 'PAYMENT_PENDING_VALIDATION', amount, receiptUrl };
  }
}

class IzipayPaymentProvider extends PaymentProvider {
  async createPayment() { throw new Error('Pago con tarjeta: próximamente disponible'); }
}

module.exports = { PaymentProvider, ManualPaymentProvider, IzipayPaymentProvider };
