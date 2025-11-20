import { Request, Response } from 'express';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { readData, writeData } from '../db/utils';

const USERS_FILE = 'users.json';

// This function will be called by other controllers
export const updateTrustScore = async (userId: string, points: number) => {
  const users = await readData<User>(USERS_FILE);
  // 수정: 문자열로 변환하여 비교
  const userIndex = users.findIndex(u => String(u.id) === String(userId));

  if (userIndex !== -1) {
    users[userIndex].trustScore = (users[userIndex].trustScore || 0) + points;
    await writeData<User>(USERS_FILE, users);
  }
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const users = await readData<User>(USERS_FILE);

  if (users.some(user => user.email === email)) {
    return res.status(409).json({ message: 'User with this email already exists' });
  }

  // In a real application, hash the password using a library like bcrypt
  const password_hash = `hashed_${password}`; // Placeholder for actual hashing

  const newUser: User = {
    id: uuidv4(),
    email,
    password_hash,
    name,
    role,
    createdAt: new Date().toISOString(),
    trustScore: 0, // Initialize trust score
  };

  users.push(newUser);
  await writeData<User>(USERS_FILE, users);

  // In a real application, you might generate a JWT token here
  res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = await readData<User>(USERS_FILE);
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // In a real application, compare the provided password with the stored hash using a library like bcrypt
  const isPasswordValid = user.password_hash === `hashed_${password}`; // Placeholder for actual comparison

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // In a real application, generate and send a JWT token
  res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name, role: user.role, trustScore: user.trustScore || 0 } });
};

// ★ 여기가 핵심 수정 부분입니다! ★
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const users = await readData<User>(USERS_FILE);
  
  // 수정: ID가 숫자든 문자든 상관없이 문자열로 변환해서 비교 (String vs String)
  const user = users.find(u => String(u.id) === String(id));

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Exclude sensitive information like password_hash
  const { password_hash, ...userInfo } = user;
  res.status(200).json(userInfo);
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, contact } = req.body; // Only allow name and contact to be updated via this endpoint

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const users = await readData<User>(USERS_FILE);
  
  // 수정: 여기도 문자열 비교로 안전하게 변경
  const userIndex = users.findIndex(u => String(u.id) === String(id));

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[userIndex];
  
  if (name !== undefined) user.name = name;
  if (contact !== undefined) user.contact = contact;

  users[userIndex] = user;
  await writeData<User>(USERS_FILE, users);

  // Exclude sensitive information like password_hash
  const { password_hash, ...updatedUserInfo } = user;
  res.status(200).json({ message: 'User updated successfully', user: updatedUserInfo });
};
