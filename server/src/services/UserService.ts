import { User } from '../entities/User'; // Import the TypeORM User entity
import { UserRepository } from '../repositories/UserRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { BadRequestError, NotFoundError, ConflictError } from '../exceptions/index';
import { hash, compare } from 'bcryptjs';

// Constants
const TRUST_SCORE_REVIEW_POINTS = 5;
const TRUST_SCORE_RESERVATION_POINTS = 10;
const TRUST_SCORE_RATING_5_POINTS = 15;
const TRUST_SCORE_RATING_1_POINTS = -10;

export class UserService {
  private userRepository: UserRepository;
  private caravanRepository: CaravanRepository;
  private reviewRepository: ReviewRepository;
  private reservationRepository: ReservationRepository;

  constructor(
    userRepository: UserRepository,
    caravanRepository: CaravanRepository,
    reviewRepository: ReviewRepository,
    reservationRepository: ReservationRepository
  ) {
    this.userRepository = userRepository;
    this.caravanRepository = caravanRepository;
    this.reviewRepository = reviewRepository;
    this.reservationRepository = reservationRepository;
  }

  async signup(userData: Omit<User, 'id' | 'created_at' | 'updated_at' | 'password_hash' | 'trust_score' | 'caravans' | 'reservations' | 'reviews'> & { password: string }): Promise<Omit<User, 'password_hash' | 'caravans' | 'reservations' | 'reviews'>> {
    const { email, password, name, role, contact, identity_verification_status } = userData;

    if (!email || !password || !name || !role || !contact || !identity_verification_status) {
      throw new BadRequestError('All fields are required');
    }

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const password_hash = await hash(password, 10);

    const newUser = await this.userRepository.create({
      email,
      password_hash,
      name,
      role,
      contact,
      trust_score: 0,
      identity_verification_status
    });

    // Remove password_hash and relations before returning
    const { password_hash: _, caravans: __, reservations: ___, reviews: ____, ...userWithoutPasswordAndRelations } = newUser;
    return userWithoutPasswordAndRelations;
  }

  async login(email: string, password: string): Promise<Omit<User, 'password_hash' | 'caravans' | 'reservations' | 'reviews'>> {
    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundError('Invalid credentials');
    }

    const isPasswordValid = await compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new NotFoundError('Invalid credentials');
    }

    const { password_hash: _, caravans: __, reservations: ___, reviews: ____, ...userWithoutPasswordAndRelations } = user;
    return userWithoutPasswordAndRelations;
  }

  async getUserById(id: string): Promise<Omit<User, 'password_hash' | 'caravans' | 'reservations' | 'reviews'>> {
    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { password_hash: _, caravans: __, reservations: ___, reviews: ____, ...userWithoutPasswordAndRelations } = user;
    return userWithoutPasswordAndRelations;
  }

  async updateUser(id: string, updateData: Partial<Pick<User, 'name' | 'contact'>>): Promise<Omit<User, 'password_hash' | 'caravans' | 'reservations' | 'reviews'>> {
    if (!id) {
      throw new BadRequestError('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await this.userRepository.update(id, updateData);
    if (!updatedUser) {
        throw new Error('Failed to update user'); // Should not happen if findById found user
    }

    const { password_hash: _, caravans: __, reservations: ___, reviews: ____, ...userWithoutPasswordAndRelations } = updatedUser;
    return userWithoutPasswordAndRelations;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 1. Find and delete caravans and their associated reservations
    const hostCaravans = await this.caravanRepository.findByHostId(userId);
    if (hostCaravans.length > 0) {
      const caravanIds = hostCaravans.map(c => c.id);

      // Delete reservations for these caravans
      const reservationsForHostCaravans = await this.reservationRepository.findByCaravanIds(caravanIds);
      if (reservationsForHostCaravans.length > 0) {
        await Promise.all(reservationsForHostCaravans.map(r => this.reservationRepository.delete(r.id)));
      }

      // Delete caravans
      await Promise.all(hostCaravans.map(c => this.caravanRepository.delete(c.id)));
    }

    // 2. Delete reservations made by the user as a guest
    const guestReservations = await this.reservationRepository.findByGuestId(userId);
    if (guestReservations.length > 0) {
      await Promise.all(guestReservations.map(r => this.reservationRepository.delete(r.id)));
    }

    // 3. Delete reviews written by the user
    const guestReviews = await this.reviewRepository.findByGuestId(userId);
    if (guestReviews.length > 0) {
      await Promise.all(guestReviews.map(r => this.reviewRepository.delete(r.id)));
    }

    // 4. Finally, delete the user
    await this.userRepository.delete(userId);
  }

  async updateTrustScore(userId: string, points: number): Promise<void> {
    if (!userId) {
      throw new BadRequestError('User ID is required for trust score update');
    }
    
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found for trust score update');
    }

    const newTrustScore = (user.trust_score || 0) + points; // Use user.trust_score
    await this.userRepository.update(userId, { trust_score: newTrustScore }); // Use trust_score
  }

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

  async requestIdentityVerification(userId: string): Promise<Omit<User, 'password_hash' | 'caravans' | 'reservations' | 'reviews'>> {
    if (!userId) {
      throw new BadRequestError('User ID is required');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.identity_verification_status === 'pending' || user.identity_verification_status === 'verified') {
      throw new BadRequestError(`Verification status is already '${user.identity_verification_status}'`);
    }

    const updatedUser = await this.userRepository.update(userId, { identity_verification_status: 'pending' });
    if (!updatedUser) {
      throw new Error('Failed to update user verification status');
    }

    const { password_hash: _, caravans: __, reservations: ___, reviews: ____, ...userWithoutPasswordAndRelations } = updatedUser;
    return userWithoutPasswordAndRelations;
  }
}
