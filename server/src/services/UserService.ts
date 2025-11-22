import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/index'; // Assuming an index file will export all exceptions
import { hash, compare } from 'bcryptjs'; // For password hashing

// Constants
const TRUST_SCORE_REVIEW_POINTS = 5;
const TRUST_SCORE_RESERVATION_POINTS = 10;
const TRUST_SCORE_RATING_5_POINTS = 15;
const TRUST_SCORE_RATING_1_POINTS = -10;

export class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async signup(userData: Omit<User, 'id' | 'createdAt' | 'password_hash' | 'trustScore'> & { password: string }): Promise<Omit<User, 'password_hash'>> {
    const { email, password, name, role } = userData;

    if (!email || !password || !name || !role) {
      throw new BadRequestError('All fields are required');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const password_hash = await hash(password, 10); // Hash with salt rounds = 10

    const newUser: User = {
      id: crypto.randomUUID(), // Use Web Crypto API for UUID
      email,
      password_hash,
      name,
      role,
      createdAt: new Date().toISOString(),
      trustScore: 0,
    };

    await this.userRepository.create(newUser);

    const { password_hash: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(email: string, password: string): Promise<Omit<User, 'password_hash'>> {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Invalid credentials'); // Use generic message for security
    }

    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new NotFoundError('Invalid credentials'); // Use generic message for security
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUserById(id: string): Promise<Omit<User, 'password_hash'>> {
    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, updateData: Partial<Pick<User, 'name' | 'contact'>>): Promise<Omit<User, 'password_hash'>> {
    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Apply updates
    const updatedUser = { ...user, ...updateData };
    await this.userRepository.update(id, updatedUser);

    const { password_hash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updateTrustScore(userId: string, points: number): Promise<void> {
    if (!userId) {
      throw new BadRequestError('User ID is required for trust score update');
    }
    
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found for trust score update');
    }

    const newTrustScore = (user.trustScore || 0) + points;
    await this.userRepository.update(userId, { trustScore: newTrustScore });
  }

  // Helper methods to update trust score based on specific events
  async recordReviewGiven(guestId: string): Promise<void> {
    await this.updateTrustScore(guestId, TRUST_SCORE_REVIEW_POINTS);
  }

  async recordReservationCompletion(guestId: string): Promise<void> {
    await this.updateTrustScore(guestId, TRUST_SCORE_RESERVATION_POINTS);
  }

  async recordHostRating(hostId: string, rating: number): Promise<void> {
    if (rating === 5) {
      await this.updateTrustScore(hostId, TRUST_SCORE_RATING_5_POINTS);
    } else if (rating === 1) {
      await this.updateTrustScore(hostId, TRUST_SCORE_RATING_1_POINTS);
    }
  }
}
