import { Payment } from '../models/Payment';
import { JsonFileRepository } from './JsonFileRepository';

export class PaymentRepository extends JsonFileRepository<Payment> {
  constructor() {
    super('payments.json');
  }

  async findByReservationId(reservationId: string): Promise<Payment | undefined> {
    const payments = await this.getAll();
    return payments.find(payment => payment.reservationId === reservationId);
  }

  async findByStatus(status: Payment['status']): Promise<Payment[]> {
    const payments = await this.getAll();
    return payments.filter(payment => payment.status === status);
  }
}
