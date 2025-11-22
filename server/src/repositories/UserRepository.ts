import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { User } from '../entities/User'; // Import the TypeORM User entity

export class UserRepository {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }
    this.userRepository.merge(user, updates);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== 0;
  }
}
