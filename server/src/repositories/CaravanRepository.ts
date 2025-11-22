import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Caravan } from '../entities/Caravan'; // Import the TypeORM Caravan entity

export class CaravanRepository {
  private caravanRepository: Repository<Caravan>;

  constructor() {
    this.caravanRepository = AppDataSource.getRepository(Caravan);
  }

  async create(caravan: Partial<Caravan>): Promise<Caravan> {
    const newCaravan = this.caravanRepository.create(caravan);
    return this.caravanRepository.save(newCaravan);
  }

  async findById(id: string): Promise<Caravan | null> {
    return this.caravanRepository.findOne({ where: { id }, relations: ['host'] });
  }

  async update(id: string, updates: Partial<Caravan>): Promise<Caravan | null> {
    const caravan = await this.findById(id);
    if (!caravan) {
      return null;
    }
    this.caravanRepository.merge(caravan, updates);
    return this.caravanRepository.save(caravan);
  }

  async findAll(): Promise<Caravan[]> {
    return this.caravanRepository.find();
  }

  async findByHostId(host_id: string): Promise<Caravan[]> {
    return this.caravanRepository.find({ where: { host_id }, relations: ['host'] });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.caravanRepository.delete(id);
    return result.affected !== 0;
  }
}
