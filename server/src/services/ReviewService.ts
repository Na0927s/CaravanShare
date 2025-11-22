import { Review } from '../entities/Review'; // Import the TypeORM Review entity
import { Caravan } from '../entities/Caravan'; // Import the TypeORM Caravan entity
import { ReviewRepository } from '../repositories/ReviewRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { UserService } from './UserService';
import { BadRequestError, NotFoundError } from '../exceptions/index';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private caravanRepository: CaravanRepository;
  private userService: UserService;

  constructor(
    reviewRepository: ReviewRepository,
    caravanRepository: CaravanRepository,
    userService: UserService
  ) {
    this.reviewRepository = reviewRepository;
    this.caravanRepository = caravanRepository;
    this.userService = userService;
  }

  async createReview(reviewData: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'caravan' | 'guest'>): Promise<Review> {
    const { caravan_id, guest_id, rating, comment } = reviewData; // Use caravan_id, guest_id

    if (!caravan_id || !guest_id || !rating) { // comment can be optional
      throw new BadRequestError('Missing required fields (caravan_id, guest_id, rating)');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }

    const newReview = await this.reviewRepository.create({
      caravan_id,
      guest_id,
      rating,
      comment: comment || undefined,
    });

    // Update guest's trust score for writing a review
    await this.userService.recordReviewGiven(guest_id); // Use guest_id

    // Update host's trust score based on the rating
    const caravan = await this.caravanRepository.findById(caravan_id);
    if (caravan) {
      await this.userService.recordHostRating(caravan.host_id, rating); // Use caravan.host_id
    } else {
      console.warn(`Caravan with ID ${caravan_id} not found when updating host trust score for review.`);
    }
    
    return newReview;
  }

  async getReviewsForCaravan(caravanId: string): Promise<Review[]> {
    if (!caravanId) {
      throw new BadRequestError('Caravan ID is required');
    }
    return this.reviewRepository.findByCaravanId(caravanId);
  }

  async getReviewsByUserId(userId: string): Promise<Review[]> {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }
    return this.reviewRepository.findByGuestId(userId);
  }
}
