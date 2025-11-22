import { Caravan } from '../models/Caravan';
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

  async createCaravan(caravanData: Omit<Caravan, 'id' | 'status'> & { status?: 'available' | 'reserved' | 'maintenance' }): Promise<Caravan> {
    const { name, description, capacity, location, pricePerDay, hostId, status } = caravanData;

    if (!name || !description || !capacity || !location || !pricePerDay || !hostId) {
      throw new BadRequestError('Missing required fields');
    }
    if (status && !['available', 'reserved', 'maintenance'].includes(status)) {
      throw new BadRequestError('Invalid status provided');
    }

    const newCaravan: Caravan = {
      id: crypto.randomUUID(),
      name,
      description,
      capacity,
      amenities: caravanData.amenities || [],
      location,
      pricePerDay,
      imageUrl: caravanData.imageUrl || `https://via.placeholder.com/300x200.png?text=${name.replace(/\s/g, '+')}`,
      hostId,
      status: status || 'available',
    };

    return this.caravanRepository.create(newCaravan);
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

    // In a real app, you might also add logic here to verify ownership (hostId === currentUser.id)
    // before allowing the update.

    const updatedCaravan = await this.caravanRepository.update(id, updateData);
    if (!updatedCaravan) { // This should ideally not happen if findById passed
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

    // In a real app, verify ownership here.

    const deleted = await this.caravanRepository.delete(id);
    if (!deleted) { // This indicates an issue if findById found it but delete didn't
        throw new Error('Failed to delete caravan'); // More specific error if possible
    }
  }

  async getCaravansByHostId(hostId: string): Promise<Caravan[]> {
    const allCaravans = await this.caravanRepository.findAll();
    return allCaravans.filter(c => c.hostId === hostId);
  }
}
