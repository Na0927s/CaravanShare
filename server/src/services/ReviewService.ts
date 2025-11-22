import { Review } from '../models/Review';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { CaravanRepository } from '../repositories/CaravanRepository'; // To get hostId from caravan
import { UserService } from './UserService'; // To update trust scores
import { BadRequestError, NotFoundError } from '../exceptions/index';

export class ReviewService {
  private reviewRepository: ReviewRepository;
  private caravanRepository: CaravanRepository;
  private userService: UserService; // Dependency Injection

  constructor(
    reviewRepository: ReviewRepository,
    caravanRepository: CaravanRepository,
    userService: UserService
  ) {
    this.reviewRepository = reviewRepository;
    this.caravanRepository = caravanRepository;
    this.userService = userService;
  }

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
    const { caravanId, guestId, rating, comment } = reviewData;

    if (!caravanId || !guestId || !rating || !comment) {
      throw new BadRequestError('Missing required fields');
    }

    if (rating < 1 || rating > 5) {
      throw new BadRequestError('Rating must be between 1 and 5');
    }

    const newReview: Review = {
      id: crypto.randomUUID(),
      caravanId,
      guestId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    const createdReview = await this.reviewRepository.create(newReview);

    // Update guest's trust score for writing a review
    await this.userService.recordReviewGiven(guestId);

    // Update host's trust score based on the rating
    const caravan = await this.caravanRepository.findById(caravanId);
    if (caravan) {
      await this.userService.recordHostRating(caravan.hostId, rating);
    } else {
      console.warn(`Caravan with ID ${caravanId} not found when updating host trust score for review.`);
    }
    
    return createdReview;
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
