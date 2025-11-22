import { User } from '../models/User';
import { JsonFileRepository } from './JsonFileRepository';

export class UserRepository extends JsonFileRepository<User> {
  constructor() {
    super('users.json');
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const users = await this.getAll();
    return users.find(user => user.email === email);
  }
}
