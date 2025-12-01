import { Request, Response } from 'express';
import { UserRepository } from '../repositories/UserRepository';
import { CaravanRepository } from '../repositories/CaravanRepository';
import { ReviewRepository } from '../repositories/ReviewRepository';
import { ReservationRepository } from '../repositories/ReservationRepository';
import { UserService } from '../services/UserService';
import { KakaoAuthService } from '../services/KakaoAuthService';
import { AppError } from '../exceptions';

// Instantiate repositories and services (for now, direct instantiation; later can be managed by a DI container)
const userRepository = new UserRepository();
const caravanRepository = new CaravanRepository();
const reviewRepository = new ReviewRepository();
const reservationRepository = new ReservationRepository();
const userService = new UserService(userRepository, caravanRepository, reviewRepository, reservationRepository);
const kakaoAuthService = new KakaoAuthService();

export const kakaoLogin = (req: Request, res: Response) => {
  const authorizationUrl = kakaoAuthService.getAuthorizationUrl();
  res.redirect(authorizationUrl);
};

export const kakaoCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    if (!code) {
      throw new AppError('Authorization code not found', 400);
    }

    const accessToken = await kakaoAuthService.getAccessToken(code as string);
    const userProfile = await kakaoAuthService.getUserProfile(accessToken);

    const kakaoId = userProfile.id.toString();
    const email = userProfile.kakao_account?.email || `${kakaoId}@kakao.com`;
    const name = userProfile.properties.nickname;

    let user = await userService.findUserByKakaoId(kakaoId);

    if (!user) {
      // User is new, redirect to client to select a role
      const encodedName = encodeURIComponent(name);
      return res.redirect(`http://localhost:3000/select-role?kakaoId=${kakaoId}&name=${encodedName}`);
    }

    // User exists, log them in and redirect to client homepage with user ID and role.
    res.redirect(`http://localhost:3000/?userId=${user.id}&role=${user.role}`);
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error); // Safely log error stack
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const socialSignup = async (req: Request, res: Response) => {
  try {
    const { kakaoId, name, role } = req.body;
    const email = `${kakaoId}@kakao.com`; // Placeholder email

    const newUser = await userService.signup({
      email,
      password: '', // No password for social login
      name,
      role,
      contact: '', // Or some default
      identity_verification_status: 'not_verified',
      kakaoId,
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, contact } = req.body;
    const newUser = await userService.signup({ email, password, name, role, contact, identity_verification_status: 'not_verified' });
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error); // Safely log error stack
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await userService.login(email, password);
    res.status(200).json({ message: 'Login successful', user: user });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error); // Safely log error stack
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error); // Safely log error stack
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;
    const updatedUser = await userService.updateUser(id, { name, contact });
    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error); // Safely log error stack
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requestIdentityVerification = async (req: Request, res: Response) => {
  try {
    // This assumes an authentication middleware has run and attached the user's ID to the request.
    // E.g., const userId = (req as any).user.id;
    // For now, we will take it from req.body for testing purposes.
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required in the request body.' });
    }

    const updatedUser = await userService.requestIdentityVerification(userId);
    res.status(200).json({ message: 'Identity verification request submitted successfully', user: updatedUser });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: 'Internal server error' });
    }
    console.error(error instanceof Error ? error.stack : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error(error instanceof Error ? error.stack : error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


