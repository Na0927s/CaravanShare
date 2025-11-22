import { UserService } from '../../services/UserService';
import { UserRepository } from '../../repositories/UserRepository';
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
  // If UserService were to access filePath, getAll, saveAll directly, they would also need to be mocked here.
};

const mockUserRepository: MockedUserRepository = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
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
    userService = new UserService(mockUserRepository as unknown as UserRepository); // Cast to UserRepository
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
      };
      mockUserRepository.findByEmail.mockResolvedValue(undefined); // User does not exist
      mockUserRepository.create.mockResolvedValue({
        id: 'mock-uuid',
        email: userData.email, // Only User properties
        password_hash: await bcrypt.hash(userData.password, 10),
        name: userData.name,
        role: userData.role,
        createdAt: expect.any(String),
        trustScore: 0,
      });

      const user = await userService.signup(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
      expect(user).toEqual({
        id: 'mock-uuid',
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: expect.any(String),
        trustScore: 0,
      });
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      // Test cases for missing fields, ensuring specific checks
      await expect(userService.signup({ email: 'a@b.com', password: '123', name: 'Name', role: undefined as any }))
        .rejects.toThrow(BadRequestError);
      await expect(userService.signup({ email: 'a@b.com', password: '123', name: undefined as any, role: 'guest' }))
        .rejects.toThrow(BadRequestError);
      await expect(userService.signup({ email: undefined as any, password: '123', name: 'Name', role: 'guest' }))
        .rejects.toThrow(BadRequestError);
      await expect(userService.signup({ email: 'a@b.com', password: undefined as any, name: 'Name', role: 'guest' }))
        .rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if user with email already exists', async () => {
      mockUserRepository.findByEmail.mockResolvedValue({ id: 'existing', email: 'exist@example.com', name: 'Exist', role: 'guest', createdAt: new Date().toISOString(), password_hash: 'hashed', trustScore: 0 } as User); // Mock a full User object

      await expect(userService.signup({ email: 'exist@example.com', password: '123', name: 'Exist', role: 'guest' }))
        .rejects.toThrow(ConflictError);
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
        createdAt: new Date().toISOString(),
        trustScore: 0,
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
        createdAt: userInDb.createdAt,
        trustScore: userInDb.trustScore,
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
        createdAt: new Date().toISOString(),
        trustScore: 0,
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
        createdAt: new Date().toISOString(),
        trustScore: 0,
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
        createdAt: new Date().toISOString(),
        trustScore: 0,
      };
      const updateData = { name: 'Updated Name', contact: '123-456-7890' };
      const updatedUserInDb: User = { ...userInDb, ...updateData };

      mockUserRepository.findById.mockResolvedValue(userInDb);
      mockUserRepository.update.mockResolvedValue(updatedUserInDb);

      const user = await userService.updateUser('1', updateData);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', updatedUserInDb);
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
        createdAt: new Date().toISOString(),
        trustScore: 0,
      };
      const expectedTrustScore = 10;
      mockUserRepository.findById.mockResolvedValue(userInDb);
      mockUserRepository.update.mockResolvedValue({ ...userInDb, trustScore: expectedTrustScore } as User);

      await userService.updateTrustScore('1', 10);

      expect(mockUserRepository.findById).toHaveBeenCalledWith('1');
      expect(mockUserRepository.update).toHaveBeenCalledWith('1', { trustScore: expectedTrustScore });
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
    const mockUser: User = { id: userId, email: 'test@example.com', password_hash: 'hash', name: 'Test', role: 'guest', createdAt: '', trustScore: 0 };

    beforeEach(() => {
        mockUserRepository.findById.mockResolvedValue(mockUser);
        // Explicitly type the resolved value for update to match Partial<User>
        mockUserRepository.update.mockImplementation(async (id: string, updateData: Partial<User>) => ({ ...mockUser, ...updateData }));
    });

    it('recordReviewGiven should update guest trust score', async () => {
      await userService.recordReviewGiven(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trustScore: 5 });
    });

    it('recordReservationCompletion should update guest trust score', async () => {
      await userService.recordReservationCompletion(userId);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trustScore: 10 });
    });

    it('recordHostRating for 5 stars should update host trust score', async () => {
      await userService.recordHostRating(userId, 5);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trustScore: 15 });
    });

    it('recordHostRating for 1 star should update host trust score', async () => {
      await userService.recordHostRating(userId, 1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, { trustScore: -10 });
    });

    it('recordHostRating for other ratings should not update host trust score', async () => {
      await userService.recordHostRating(userId, 3);
      expect(mockUserRepository.update).not.toHaveBeenCalledWith(userId, expect.objectContaining({ trustScore: expect.any(Number) }));
    });
  });
});