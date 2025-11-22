import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Review } from '../entities/Review'; // Import the TypeORM Review entity

export class ReviewRepository {
  private reviewRepository: Repository<Review>;

  constructor() {
    this.reviewRepository = AppDataSource.getRepository(Review);
  }

  async create(review: Partial<Review>): Promise<Review> {
    const newReview = this.reviewRepository.create(review);
    return this.reviewRepository.save(newReview);
  }

  async findById(id: string): Promise<Review | null> {
    return this.reviewRepository.findOne({ where: { id }, relations: ['caravan', 'guest'] });
  }

  async update(id: string, updates: Partial<Review>): Promise<Review | null> {
    const review = await this.findById(id);
    if (!review) {
      return null;
    }
    this.reviewRepository.merge(review, updates);
    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({ relations: ['caravan', 'guest'] });
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.reviewRepository.delete(id);
    return result.affected !== 0;
  }

  async findByCaravanId(caravanId: string): Promise<Review[]> {
    return this.reviewRepository.find({ where: { caravan_id: caravanId }, relations: ['caravan', 'guest'] });
  }

  async findByGuestId(guestId: string): Promise<Review[]> {
    return this.reviewRepository.find({ where: { guest_id: guestId }, relations: ['caravan', 'guest'] });
  }
}
