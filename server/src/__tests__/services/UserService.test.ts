import { UserService } from '../../services/UserService';
import { UserRepository } from '../../repositories/UserRepository';
import { CaravanRepository } from '../../repositories/CaravanRepository';
import { ReviewRepository } from '../../repositories/ReviewRepository';
import { ReservationRepository } from '../../repositories/ReservationRepository';
import { User } from '../../models/User';
import { BadRequestError, NotFoundError, ConflictError } from '../../exceptions';
import * as bcrypt from 'bcryptjs';

// Define a type for the mocked UserRepository to ensure all methods expected by UserService are present
// This avoids the strictness of Mocked<UserRepository> when dealing with inherited properties (filePath, getAll, saveAll)
type MockedUserRepository = {
  findByEmail: jest.Mock;
  findById: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  findAll: jest.Mock;
  delete: jest.Mock;
  findByKakaoId: jest.Mock; // Added for social login
};

type MockedCaravanRepository = {
  findByHostId: jest.Mock;
  delete: jest.Mock;
};

type MockedReviewRepository = {
  findByGuestId: jest.Mock;
  delete: jest.Mock;
};

type MockedReservationRepository = {
  findByGuestId: jest.Mock;
  findByCaravanIds: jest.Mock;
  delete: jest.Mock;
};


const mockUserRepository: MockedUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
  delete: jest.fn(),
  findByKakaoId: jest.fn(),
};

const mockCaravanRepository: MockedCaravanRepository = {
  findByHostId: jest.fn(),
  delete: jest.fn(),
};

const mockReviewRepository: MockedReviewRepository = {
  findByGuestId: jest.fn(),
  delete: jest.fn(),
};

const mockReservationRepository: MockedReservationRepository = {
  findByGuestId: jest.fn(),
  findByCaravanIds: jest.fn(),
  delete: jest.fn(),
};


// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (password: string) => `hashed_${password}_mock`),
  compare: jest.fn(async (password: string, hash: string) => hash === `hashed_${password}_mock`),
}));

// Mock crypto.randomUUID (part of globalThis)
// Needs to be done carefully to avoid global conflicts if not running in node env
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
  },
  writable: true, // Make it writable so it can be reset or re-mocked
});


describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService(
      mockUserRepository as unknown as UserRepository,
      mockCaravanRepository as unknown as CaravanRepository,
      mockReviewRepository as unknown as ReviewRepository,
      mockReservationRepository as unknown as ReservationRepository,
    );
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Ensure default crypto.randomUUID is reset
    (global.crypto.randomUUID as jest.Mock).mockClear();
    (global.crypto.randomUUID as jest.Mock).mockImplementation(() => 'mock-uuid');
  });

  // --- Signup tests ---
  describe('signup', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'guest' as 'guest', // Explicitly type role
        contact: '123-456-7890',
        identity_verification_status: 'not_verified' as 'not_verified',
      };
      mockUserRepository.findByEmail.mockResolvedValue(undefined); // User does not exist
      mockUserRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        email: userData.email, // Only User properties
        password_hash: await bcrypt.hash(userData.password, 10),
        name: userData.name,
        role: userData.role,
        contact: userData.contact,
        identity_verification_status: userData.identity_verification_status,
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 0,
      });

      const user = await userService.signup(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(user).toEqual({
        id: 'mock-uuid',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        contact: userData.contact,
        identity_verification_status: userData.identity_verification_status,
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
        trust_score: 0,
      });
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      // Test cases for missing fields, ensuring specific checks
      const baseUserData = {
        email: 'a@b.com',
        password: '123',
        name: 'Name',
        role: 'guest' as 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified' as 'not_verified',
      };
      await expect(userService.signup({ ...baseUserData, role: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(userService.signup({ ...baseUserData, name: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(userService.signup({ ...baseUserData, email: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(userService.signup({ ...baseUserData, password: undefined as any, kakaoId: undefined as any })).rejects.toThrow(BadRequestError); // password or kakaoId required
    });

    it('should throw ConflictError if user with email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({
        id: 'existing',
        email: 'exist@example.com',
        name: 'Exist',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
        password_hash: 'hashed',
        trust_score: 0,
      } as User); // Mock a full User object

      await expect(userService.signup({
        email: 'exist@example.com',
        password: '123',
        name: 'Exist',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified'
      })).rejects.toThrow(ConflictError);
    });
  });

  // --- Login tests ---
  describe('login', () => {
    it('should log in a user successfully', async () => {
      const password = 'password123';
      const userInDb: User = {
        id: '1',
        email: 'test@example.com',
        password_hash: await bcrypt.hash(password, 10), // Simulate hashed password
        name: 'Test User',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 0,
      };
      mockUserRepository.findByEmail.mockResolvedValue(userInDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true); // Password matches

      const loggedInUser = await userService.login(userInDb.email, password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userInDb.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(password, userInDb.password_hash);
      expect(loggedInUser).toEqual({
        id: userInDb.id,
        email: userInDb.email,
        name: userInDb.name,
        role: userInDb.role,
        contact: userInDb.contact,
        identity_verification_status: userInDb.identity_verification_status,
        created_at: userInDb.created_at,
        updated_at: userInDb.updated_at,
        trust_score: userInDb.trust_score,
      });
    });

    it('should throw BadRequestError if email or password are missing', async () => {
      await expect(userService.login('', 'password')).rejects.toThrow(BadRequestError);
      await expect(userService.login('email@test.com', '')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findByEmail.mockResolvedValue(undefined);

      await expect(userService.login('nonexist@example.com', 'password')).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError if password is incorrect', async () => {
      const password = 'password123';
      const userInDb: User = {
        id: '1',
        email: 'test@example.com',
        password_hash: await bcrypt.hash(password, 10),
        name: 'Test User',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 0,
      };
      mockUserRepository.findByEmail.mockResolvedValue(userInDb);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false); // Password does not match

      await expect(userService.login(userInDb.email, 'wrongpassword')).rejects.toThrow(NotFoundError);
    });
  });

  // --- getUserById tests ---
  describe('getUserById', () => {
    it('should return a user by ID', async () => {
      const userInDb: User = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashed',
        name: 'Test User',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 0,
      };
      mockUserRepository.findById.mockResolvedValue(userInDb);

      const user = await userService.getUserById('1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(user).toEqual({ ...userInDb, password_hash: undefined }); // password_hash is omitted
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(userService.getUserById('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(userService.getUserById('99')).rejects.toThrow(NotFoundError);
    });
  });

  // --- updateUser tests ---
  describe('updateUser', () => {
    it('should update an existing user', async () => {
      const userInDb: User = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashed',
        name: 'Test User',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 0,
      };
      const updateData = { name: 'Updated Name', contact: '123-456-7890' };
      const updatedUserInDb: User = { ...userInDb, ...updateData };

      mockUserRepository.findById.mockResolvedValue(userInDb);
      mockUserRepository.update.mockResolvedValue(updatedUserInDb);

      const user = await userService.updateUser('1', updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', updateData); // update only takes Partial<User>
      expect(user).toEqual({ ...updatedUserInDb, password_hash: undefined });
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(userService.updateUser('', { name: 'Name' })).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if user to update is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(userService.updateUser('99', { name: 'Name' })).rejects.toThrow(NotFoundError);
    });
  });

  // --- updateTrustScore tests ---
  describe('updateTrustScore', () => {
    it('should update a user\'s trust score', async () => {
      const userInDb: User = {
        id: '1',
        email: 'test@example.com',
        password_hash: 'hashed',
        name: 'Test User',
        role: 'guest',
        contact: '123-456-7890',
        identity_verification_status: 'not_verified',
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 0,
      };
      const expectedTrustScore = 10;
      mockUserRepository.findById.mockResolvedValue(userInDb);
      mockUserRepository.update.mockResolvedValue({ ...userInDb, trust_score: expectedTrustScore } as User);

      await userService.updateTrustScore('1', 10);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', { trust_score: expectedTrustScore });
    });

    it('should throw BadRequestError if user ID is missing for trust score update', async () => {
      await expect(userService.updateTrustScore('', 10)).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if user not found for trust score update', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(userService.updateTrustScore('99', 10)).rejects.toThrow(NotFoundError);
    });
  });

  // --- Helper methods for trust score updates ---
  describe('trust score helper methods', () => {
    const userId = 'user123';
    const mockUser: User = {
      id: userId,
      email: 'test@example.com',
      password_hash: 'hash',
      name: 'Test',
      role: 'guest',
      contact: '123-456-7890',
      identity_verification_status: 'not_verified',
      created_at: new Date(),
      updated_at: new Date(),
      trust_score: 0
    };

    beforeEach(() => {
        mockUserRepository.findById.mockResolvedValue(mockUser);
        // Explicitly type the resolved value for update to match Partial<User>
        mockUserRepository.update.mockImplementation(async (id: string, updateData: Partial<User>) => ({ ...mockUser, ...updateData }));
    });

    it('recordReviewGiven should update guest trust score', async () => {
      await userService.recordReviewGiven(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trust_score: 5 });
    });

    it('recordReservationCompletion should update guest trust score', async () => {
      await userService.recordReservationCompletion(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trust_score: 10 });
    });

    it('recordHostRating for 5 stars should update host trust score', async () => {
      await userService.recordHostRating(userId, 5);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trust_score: 15 });
    });

    it('recordHostRating for 1 star should update host trust score', async () => {
      await userService.recordHostRating(userId, 1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trust_score: -10 });
    });

    it('recordHostRating for other ratings should not update host trust score', async () => {
      await userService.recordHostRating(userId, 3);
      // Need to capture calls to update and ensure it was NOT called with trustScore
      const initialCalls = mockUserRepository.update.mock.calls.length;
      await userService.recordHostRating(userId, 3);
      // If update was called, it means trust score was modified, which is incorrect for rating 3
      // We need to ensure that the update was either not called or not called with a trust_score change.
      expect(mockUserRepository.update).toHaveBeenCalledTimes(initialCalls); // Check if no additional calls were made
    });
  });

  // --- findUserByKakaoId tests ---
  describe('findUserByKakaoId', () => {
    it('should return user if found by kakaoId', async () => {
      const kakaoId = '12345';
      const mockUser: User = {
        id: 'uuid1',
        email: 'kakao@example.com',
        password_hash: '',
        name: 'Kakao User',
        role: 'guest',
        contact: '010-1234-5678',
        identity_verification_status: 'verified',
        created_at: new Date(),
        updated_at: new Date(),
        trust_score: 50,
        kakaoId: kakaoId,
      };
      mockUserRepository.findByKakaoId.mockResolvedValue(mockUser);

      const user = await userService.findUserByKakaoId(kakaoId);

      expect(mockUserRepository.findByKakaoId).toHaveBeenCalledWith(kakaoId);
      expect(user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        contact: mockUser.contact,
        identity_verification_status: mockUser.identity_verification_status,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
        trust_score: mockUser.trust_score,
        kakaoId: mockUser.kakaoId,
      });
    });

    it('should return null if user not found by kakaoId', async () => {
      mockUserRepository.findByKakaoId.mockResolvedValue(null);

      const user = await userService.findUserByKakaoId('nonexistent');

      expect(mockUserRepository.findByKakaoId).toHaveBeenCalledWith('nonexistent');
      expect(user).toBeNull();
    });
  });

  // --- deleteUser tests ---
  describe('deleteUser', () => {
    it('should delete a user and all associated data', async () => {
      const userId = 'user1';
      const mockUser: User = { id: userId, email: 'del@example.com', password_hash: 'hashed', name: 'Delete', role: 'host',
        contact: '123', identity_verification_status: 'not_verified', created_at: new Date(), updated_at: new Date(), trust_score: 0 };
      const mockCaravans = [{ id: 'car1', host_id: userId, name: 'C1', description: '', location: '', price_per_day: 0, capacity: 0, amenities: [], image_url: '', status: 'available', created_at: new Date(), updated_at: new Date() }];
      const mockReservationsGuest = [{ id: 'res1', guest_id: userId, caravan_id: 'carX', start_date: new Date(), end_date: new Date(), total_price: 0, status: 'pending', created_at: new Date(), updated_at: new Date() }];
      const mockReservationsHost = [{ id: 'res2', guest_id: 'guestX', caravan_id: 'car1', start_date: new Date(), end_date: new Date(), total_price: 0, status: 'pending', created_at: new Date(), updated_at: new Date() }];
      const mockReviewsGuest = [{ id: 'rev1', guest_id: userId, caravan_id: 'carY', rating: 5, comment: '', created_at: new Date(), updated_at: new Date() }];

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockCaravanRepository.findByHostId.mockResolvedValue(mockCaravans);
      mockReservationRepository.findByCaravanIds.mockResolvedValue(mockReservationsHost);
      mockReservationRepository.findByGuestId.mockResolvedValue(mockReservationsGuest);
      mockReviewRepository.findByGuestId.mockResolvedValue(mockReviewsGuest);

      await userService.deleteUser(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockCaravanRepository.findByHostId).toHaveBeenCalledWith(userId);
      expect(mockReservationRepository.findByCaravanIds).toHaveBeenCalledWith(['car1']);
      expect(mockReservationRepository.delete).toHaveBeenCalledWith('res2'); // Reservation for host's caravan
      expect(mockCaravanRepository.delete).toHaveBeenCalledWith('car1');
      expect(mockReservationRepository.findByGuestId).toHaveBeenCalledWith(userId);
      expect(mockReservationRepository.delete).toHaveBeenCalledWith('res1'); // Reservation by guest
      expect(mockReviewRepository.findByGuestId).toHaveBeenCalledWith(userId);
      expect(mockReviewRepository.delete).toHaveBeenCalledWith('rev1');
      expect(mockUserRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundError if user to delete is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(userService.deleteUser('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  // --- requestIdentityVerification tests ---
  describe('requestIdentityVerification', () => {
    const userId = 'user1';
    it('should update user verification status to pending', async () => {
      const mockUser: User = {
        id: userId, email: 'verify@example.com', password_hash: 'hash', name: 'Verify', role: 'guest',
        contact: '123', identity_verification_status: 'not_verified', created_at: new Date(), updated_at: new Date(), trust_score: 0
      };
      const updatedUser: User = { ...mockUser, identity_verification_status: 'pending' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.requestIdentityVerification(userId);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { identity_verification_status: 'pending' });
      expect(result.identity_verification_status).toBe('pending');
    });

    it('should throw BadRequestError if user ID is missing', async () => {
      await expect(userService.requestIdentityVerification('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(undefined);

      await expect(userService.requestIdentityVerification(userId)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if status is already pending or verified', async () => {
      const pendingUser: User = {
        id: userId, email: 'pend@example.com', password_hash: 'hash', name: 'Pend', role: 'guest',
        contact: '123', identity_verification_status: 'pending', created_at: new Date(), updated_at: new Date(), trust_score: 0
      };
      const verifiedUser: User = {
        id: userId, email: 'verif@example.com', password_hash: 'hash', name: 'Verif', role: 'guest',
        contact: '123', identity_verification_status: 'verified', created_at: new Date(), updated_at: new Date(), trust_score: 0
      };

      mockUserRepository.findById.mockResolvedValue(pendingUser);
      await expect(userService.requestIdentityVerification(userId)).rejects.toThrow(BadRequestError);

      mockUserRepository.findById.mockResolvedValue(verifiedUser);
      await expect(userService.requestIdentityVerification(userId)).rejects.toThrow(BadRequestError);
    });
  });
});
