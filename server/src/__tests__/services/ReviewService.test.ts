import { ReviewService } from '../../services/ReviewService';
import { ReviewRepository } from '../../repositories/ReviewRepository';
import { CaravanRepository } from '../../repositories/CaravanRepository';
import { UserService } from '../../services/UserService';
import { Review } from '../../models/Review';
import { Caravan } from '../../models/Caravan';
import { BadRequestError, NotFoundError } from '../../exceptions';

// Define types for mocked dependencies
type MockedReviewRepository = {
  findById: jest.Mock;
  create: jest.Mock;
  findByCaravanId: jest.Mock;
  findByGuestId: jest.Mock;
};

type MockedCaravanRepository = {
  findById: jest.Mock;
};

type MockedUserService = {
  recordReviewGiven: jest.Mock;
  recordHostRating: jest.Mock;
};

const mockReviewRepository: MockedReviewRepository = {
  findById: jest.fn(),
  create: jest.fn(),
  findByCaravanId: jest.fn(),
  findByGuestId: jest.fn(),
};

const mockCaravanRepository: MockedCaravanRepository = {
  findById: jest.fn(),
};

const mockUserService: MockedUserService = {
  recordReviewGiven: jest.fn(),
  recordHostRating: jest.fn(),
};

// Mock crypto.randomUUID (part of globalThis)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
  },
  writable: true,
});

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService(
      mockReviewRepository as unknown as ReviewRepository,
      mockCaravanRepository as unknown as CaravanRepository,
      mockUserService as unknown as UserService
    );
    jest.clearAllMocks();
    (global.crypto.randomUUID as jest.Mock).mockClear();
    (global.crypto.randomUUID as jest.Mock).mockImplementation(() => 'mock-uuid');
  });

  // --- createReview tests ---
  describe('createReview', () => {
    const caravan_id = 'c1';
    const guest_id = 'g1';
    const reviewData = {
      caravan_id,
      guest_id,
      rating: 5,
      comment: 'Great caravan!',
    };
    const mockCaravan: Caravan = { id: caravan_id, host_id: 'h1', name: 'Test', description: 'Desc', location: 'Loc', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url', status: 'available', created_at: new Date(), updated_at: new Date() };


    it('should create a review successfully and update trust scores', async () => {
      mockReviewRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        ...reviewData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);
      mockUserService.recordReviewGiven.mockResolvedValue(undefined);
      mockUserService.recordHostRating.mockResolvedValue(undefined);

      const createdReview = await reviewService.createReview(reviewData);

      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(mockReviewRepository.create).toHaveBeenCalledTimes(1);
      expect(mockUserService.recordReviewGiven).toHaveBeenCalledWith(guest_id);
      expect(mockCaravanRepository.findById).toHaveBeenCalledWith(caravan_id);
      expect(mockUserService.recordHostRating).toHaveBeenCalledWith(mockCaravan.host_id, reviewData.rating);
      expect(createdReview).toEqual(expect.objectContaining({ ...reviewData, id: 'mock-uuid', created_at: expect.any(Date), updated_at: expect.any(Date) }));
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      await expect(reviewService.createReview({ caravan_id, guest_id, rating: 5, comment: '' })).rejects.toThrow(BadRequestError);
      await expect(reviewService.createReview({ caravan_id, guest_id: '', rating: 5, comment: 'Good' })).rejects.toThrow(BadRequestError);
      // ... other missing fields
    });

    it('should throw BadRequestError if rating is out of range', async () => {
      await expect(reviewService.createReview({ caravan_id, guest_id, rating: 0, comment: 'Bad' })).rejects.toThrow(BadRequestError);
      await expect(reviewService.createReview({ caravan_id, guest_id, rating: 6, comment: 'Excellent' })).rejects.toThrow(BadRequestError);
    });

    it('should not update host trust score if caravan is not found', async () => {
      mockReviewRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        ...reviewData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      mockCaravanRepository.findById.mockResolvedValue(undefined); // Caravan not found
      mockUserService.recordReviewGiven.mockResolvedValue(undefined);

      await reviewService.createReview(reviewData);

      expect(mockUserService.recordHostRating).not.toHaveBeenCalled();
    });
  });

  // --- getReviewsForCaravan tests ---
  describe('getReviewsForCaravan', () => {
    const caravan_id = 'c1';
    const mockReviews: Review[] = [
      { id: 'rev1', caravan_id, guest_id: 'g1', rating: 5, comment: 'Good', created_at: new Date(), updated_at: new Date() },
      { id: 'rev2', caravan_id, guest_id: 'g2', rating: 4, comment: 'Okay', created_at: new Date(), updated_at: new Date() },
    ];

    it('should return reviews for a specific caravan ID', async () => {
      mockReviewRepository.findByCaravanId.mockResolvedValue(mockReviews);

      const reviews = await reviewService.getReviewsForCaravan(caravan_id);

      expect(mockReviewRepository.findByCaravanId).toHaveBeenCalledWith(caravan_id);
      expect(reviews).toEqual(mockReviews);
    });

    it('should throw BadRequestError if caravan ID is missing', async () => {
      await expect(reviewService.getReviewsForCaravan('')).rejects.toThrow(BadRequestError);
    });
  });

  // --- getReviewsByUserId tests ---
  describe('getReviewsByUserId', () => {
    const guest_id = 'g1';
    const mockReviews: Review[] = [
      { id: 'rev1', caravan_id: 'c1', guest_id: guest_id, rating: 5, comment: 'Good', created_at: new Date(), updated_at: new Date() },
      { id: 'rev2', caravan_id: 'c2', guest_id: 'g2', rating: 4, comment: 'Okay', created_at: new Date(), updated_at: new Date() },
    ];

    it('should return reviews for a specific user ID', async () => {
      mockReviewRepository.findByGuestId.mockResolvedValue(mockReviews);

      const reviews = await reviewService.getReviewsByUserId(guest_id);

      expect(mockReviewRepository.findByGuestId).toHaveBeenCalledWith(guest_id);
      expect(reviews).toEqual(mockReviews);
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(reviewService.getReviewsByUserId('')).rejects.toThrow(BadRequestError);
    });
  });
});