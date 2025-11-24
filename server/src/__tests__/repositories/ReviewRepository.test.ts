import { ReviewRepository } from '../../repositories/ReviewRepository';
import { Review } from '../../models/Review';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs/promises and path module for isolated testing
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('path', () => ({
  __esModule: true,
  default: {
    join: jest.fn((...args: string[]) => {
      if (args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].endsWith('.json')) {
        return `/mock/db/${args[args.length - 1]}`;
      }
      return args.join('/');
    }),
  },
  join: jest.fn((...args: string[]) => {
    if (args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].endsWith('.json')) {
      return `/mock/db/${args[args.length - 1]}`;
    }
    return args.join('/');
  }),
}));

describe('ReviewRepository', () => {
  let reviewRepository: ReviewRepository;
  const expectedFilePath = `/mock/db/reviews.json`;

  beforeEach(() => {
    reviewRepository = new ReviewRepository();
    (fs.readFile as jest.Mock).mockReset();
    (fs.writeFile as jest.Mock).mockReset();
    (path.join as jest.Mock).mockClear();

    (fs.readFile as jest.Mock).mockResolvedValue('[]'); // Default to empty array
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create a new review', async () => {
    const newReview: Review = {
      id: 'rev1',
      caravan_id: 'c1',
      guest_id: 'g1',
      rating: 5,
      comment: 'Great caravan!',
      created_at: new Date(),
      updated_at: new Date(),
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const createdReview = await reviewRepository.create(newReview);

    expect(createdReview).toEqual(newReview);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([newReview], null, 2),
      'utf-8'
    );
  });

  it('should find a review by ID', async () => {
    const existingReview: Review = {
      id: 'rev1',
      caravan_id: 'c1',
      guest_id: 'g1',
      rating: 5,
      comment: 'Great caravan!',
      created_at: new Date(),
      updated_at: new Date(),
    };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingReview]));

    const foundReview = await reviewRepository.findById('rev1');

    expect(foundReview).toEqual(existingReview);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should return undefined if review by ID is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const foundReview = await reviewRepository.findById('rev99');

    expect(foundReview).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should update an existing review', async () => {
    const existingReview: Review = {
      id: 'rev1',
      caravan_id: 'c1',
      guest_id: 'g1',
      rating: 5,
      comment: 'Great caravan!',
      created_at: new Date(),
      updated_at: new Date(),
    };
    const updatedData = { rating: 4, comment: 'Good caravan.' };
    const expectedReview = { ...existingReview, ...updatedData };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingReview]));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const updatedReview = await reviewRepository.update('rev1', updatedData);

    expect(updatedReview).toEqual(expectedReview);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([expectedReview], null, 2),
      'utf-8'
    );
  });

  it('should return undefined if review to update is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const updatedReview = await reviewRepository.update('rev99', { rating: 3 });

    expect(updatedReview).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should delete an existing review', async () => {
    const existingReview: Review = {
      id: 'rev1',
      caravan_id: 'c1',
      guest_id: 'g1',
      rating: 5,
      comment: 'Great caravan!',
      created_at: new Date(),
      updated_at: new Date(),
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingReview]));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const isDeleted = await reviewRepository.delete('rev1');

    expect(isDeleted).toBe(true);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([], null, 2),
      'utf-8'
    );
  });

  it('should return false if review to delete is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([{ id: 'rev2', caravan_id: 'c2' } as Review]));

    const isDeleted = await reviewRepository.delete('rev1');

    expect(isDeleted).toBe(false);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should return all reviews', async () => {
    const reviews: Review[] = [
      { id: 'rev1', caravan_id: 'c1', guest_id: 'g1', rating: 5, comment: 'Good', created_at: new Date(), updated_at: new Date() },
      { id: 'rev2', caravan_id: 'c2', guest_id: 'g2', rating: 4, comment: 'Okay', created_at: new Date(), updated_at: new Date() },
    ];
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(reviews));

    const allReviews = await reviewRepository.findAll();

    expect(allReviews).toEqual(reviews);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should find reviews by caravan ID', async () => {
    const reviews: Review[] = [
      { id: 'rev1', caravan_id: 'c1', guest_id: 'g1', rating: 5, comment: 'Good', created_at: new Date(), updated_at: new Date() },
      { id: 'rev2', caravan_id: 'c2', guest_id: 'g2', rating: 4, comment: 'Okay', created_at: new Date(), updated_at: new Date() },
      { id: 'rev3', caravan_id: 'c1', guest_id: 'g3', rating: 3, comment: 'Bad', created_at: new Date(), updated_at: new Date() },
    ];
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(reviews));

    const caravanReviews = await reviewRepository.findByCaravanId('c1');

    expect(caravanReviews).toEqual([reviews[0], reviews[2]]);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should find reviews by guest ID', async () => {
    const reviews: Review[] = [
      { id: 'rev1', caravan_id: 'c1', guest_id: 'g1', rating: 5, comment: 'Good', created_at: new Date(), updated_at: new Date() },
      { id: 'rev2', caravan_id: 'c2', guest_id: 'g2', rating: 4, comment: 'Okay', created_at: new Date(), updated_at: new Date() },
      { id: 'rev3', caravan_id: 'c1', guest_id: 'g1', rating: 3, comment: 'Bad', created_at: new Date(), updated_at: new Date() },
    ];
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(reviews));

    const guestReviews = await reviewRepository.findByGuestId('g1');

    expect(guestReviews).toEqual([reviews[0], reviews[2]]);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });
});