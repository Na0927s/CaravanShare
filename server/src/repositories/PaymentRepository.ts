import { Repository, In } from 'typeorm'; // Import In operator
import { AppDataSource } from '../data-source';
import { Payment } from '../entities/Payment'; // Import the TypeORM Payment entity

export class PaymentRepository {
  private paymentRepository: Repository<Payment>;

  constructor() {
    this.paymentRepository = AppDataSource.getRepository(Payment);
  }

  async create(payment: Partial<Payment>): Promise<Payment> {
    const newPayment = this.paymentRepository.create(payment);
    return this.paymentRepository.save(newPayment);
  }

  async findById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { id }, relations: ['reservation'] });
  }

  async update(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const payment = await this.findById(id);
    if (!payment) {
      return null;
    }
    this.paymentRepository.merge(payment, updates);
    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({ relations: ['reservation'] });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.paymentRepository.delete(id);
    return result.affected !== 0;
  }

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    return this.paymentRepository.findOne({ where: { reservation_id: reservationId }, relations: ['reservation'] });
  }

  async findByReservationIds(reservationIds: string[]): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { reservation_id: In(reservationIds) },
      relations: ['reservation'],
    });
  }

  async findByStatus(status: Payment['status']): Promise<Payment[]> {
    return this.paymentRepository.find({ where: { status }, relations: ['reservation'] });
  }
}
