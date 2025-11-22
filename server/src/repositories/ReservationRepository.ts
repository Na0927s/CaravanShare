import { Repository, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Reservation } from '../entities/Reservation'; // Import the TypeORM Reservation entity

export class ReservationRepository {
  private reservationRepository: Repository<Reservation>;

  constructor() {
    this.reservationRepository = AppDataSource.getRepository(Reservation);
  }

  async create(reservation: Partial<Reservation>): Promise<Reservation> {
    const newReservation = this.reservationRepository.create(reservation);
    return this.reservationRepository.save(newReservation);
  }

  async findById(id: string): Promise<Reservation | null> {
    return this.reservationRepository.findOne({ where: { id }, relations: ['caravan', 'guest', 'payment'] });
  }

  async update(id: string, updates: Partial<Reservation>): Promise<Reservation | null> {
    const reservation = await this.findById(id);
    if (!reservation) {
      return null;
    }
    this.reservationRepository.merge(reservation, updates);
    return this.reservationRepository.save(reservation);
  }

  async findAll(): Promise<Reservation[]> {
    return this.reservationRepository.find({ relations: ['caravan', 'guest', 'payment'] });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.reservationRepository.delete(id);
    return result.affected !== 0;
  }

  async findOverlappingReservations(
    caravanId: string,
    newStartDate: Date,
    newEndDate: Date
  ): Promise<Reservation[]> {
    return this.reservationRepository.createQueryBuilder("reservation")
      .where("reservation.caravan_id = :caravanId", { caravanId })
      .andWhere("reservation.status IN (:...statuses)", { statuses: ['confirmed', 'pending', 'awaiting_payment'] })
      .andWhere(
        "(reservation.start_date < :newEndDate AND reservation.end_date > :newStartDate)",
        { newStartDate, newEndDate }
      )
      .getMany();
  }

  async findByGuestId(guestId: string): Promise<Reservation[]> {
    return this.reservationRepository.find({ where: { guest_id: guestId }, relations: ['caravan', 'payment'] });
  }

  async findByCaravanIds(caravanIds: string[]): Promise<Reservation[]> {
    return this.reservationRepository.find({ where: { caravan_id: In(caravanIds) }, relations: ['caravan', 'guest', 'payment'] });
  }
}
