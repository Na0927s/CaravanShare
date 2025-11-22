import { Review } from '../models/Review';
import { JsonFileRepository } from './JsonFileRepository';

export class ReviewRepository extends JsonFileRepository<Review> {
  constructor() {
    super('reviews.json');
  }

  async findByCaravanId(caravanId: string): Promise<Review[]> {
    const reviews = await this.getAll();
    return reviews.filter(review => review.caravanId === caravanId);
  }

  async findByGuestId(guestId: string): Promise<Review[]> {
    const reviews = await this.getAll();
    return reviews.filter(review => review.guestId === guestId);
  }
}
