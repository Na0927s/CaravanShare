import { Caravan } from '../models/Caravan';
import { JsonFileRepository } from './JsonFileRepository';

export class CaravanRepository extends JsonFileRepository<Caravan> {
  constructor() {
    super('caravans.json');
  }

  // You can add specific methods for Caravan here if needed,
  // e.g., findByHostId, findAvailableCaravans, etc.
}
