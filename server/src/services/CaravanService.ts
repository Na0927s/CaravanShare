import { Caravan } from '../entities/Caravan'; // Import the TypeORM Caravan entity
import { CaravanRepository } from '../repositories/CaravanRepository';
import { BadRequestError, NotFoundError } from '../exceptions/index';

export class CaravanService {
  private caravanRepository: CaravanRepository;

  constructor(caravanRepository: CaravanRepository) {
    this.caravanRepository = caravanRepository;
  }

  async getCaravans(): Promise<Caravan[]> {
    return this.caravanRepository.findAll();
  }

  async getCaravanById(id: string): Promise<Caravan> {
    if (!id) {
      throw new BadRequestError('Caravan ID is required');
    }
    const caravan = await this.caravanRepository.findById(id);
    if (!caravan) {
      throw new NotFoundError('Caravan not found');
    }
    return caravan;
  }

  async createCaravan(caravanData: Omit<Caravan, 'id' | 'status' | 'image_url' | 'created_at' | 'updated_at' | 'host' | 'reservations' | 'reviews'> & { image_url?: string; status?: 'available' | 'reserved' | 'maintenance' }): Promise<Caravan> {
    const { name, description, capacity, location, price_per_day, host_id, status } = caravanData; // Use price_per_day, host_id

    if (!name || !description || !capacity || !location || !price_per_day || !host_id) {
      throw new BadRequestError('Missing required fields');
    }
    if (status && !['available', 'reserved', 'maintenance'].includes(status)) {
      throw new BadRequestError('Invalid status provided');
    }

    const newCaravan = await this.caravanRepository.create({
      name,
      description,
      capacity,
      amenities: caravanData.amenities || [],
      location,
      price_per_day,
      image_url: caravanData.image_url || `https://placehold.co/300x200.png?text=${name.replace(/\s/g, '+')}`,
      host_id,
      status: status || 'available',
    });

    return newCaravan;
  }

  async updateCaravan(id: string, updateData: Partial<Caravan>): Promise<Caravan> {
    if (!id) {
      throw new BadRequestError('Caravan ID is required');
    }

    if (updateData.status && !['available', 'reserved', 'maintenance'].includes(updateData.status)) {
      throw new BadRequestError('Invalid status provided');
    }

    const existingCaravan = await this.caravanRepository.findById(id);
    if (!existingCaravan) {
      throw new NotFoundError('Caravan not found');
    }

    const updatedCaravan = await this.caravanRepository.update(id, updateData);
    if (!updatedCaravan) {
        throw new NotFoundError('Caravan not found after update attempt');
    }
    return updatedCaravan;
  }

  async deleteCaravan(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestError('Caravan ID is required');
    }

    const existingCaravan = await this.caravanRepository.findById(id);
    if (!existingCaravan) {
      throw new NotFoundError('Caravan not found');
    }

    const deleted = await this.caravanRepository.delete(id);
    if (!deleted) {
        throw new Error('Failed to delete caravan');
    }
  }

  async getCaravansByHostId(hostId: string): Promise<Caravan[]> {
    return this.caravanRepository.findByHostId(hostId); // Use new findByHostId
  }
}
