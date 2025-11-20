import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { User } from '../models/User';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

const dbPath = path.join(__dirname, '..', '..', 'db', 'users.json');

const readUsers = async (): Promise<User[]> => {
  try {
    const data = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

const writeUsers = async (users: User[]): Promise<void> => {
  try {
    await fs.writeFile(dbPath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users:', error);
  }
};

export const signup = async (req: Request, res: Response) => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const users = await readUsers();

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
  };

  users.push(newUser);
  await writeUsers(users);

  // In a real application, you might generate a JWT token here
  res.status(201).json({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = await readUsers();
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
  res.status(200).json({ message: 'Login successful', user: { id: user.id, email: user.email, name: user.name, role: user.role } });
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const users = await readUsers();
  const user = users.find(u => u.id === id);

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

  const users = await readUsers();
  const userIndex = users.findIndex(u => u.id === id);

  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  const user = users[userIndex];
  
  if (name !== undefined) user.name = name;
  if (contact !== undefined) user.contact = contact;

  users[userIndex] = user;
  await writeUsers(users);

  // Exclude sensitive information like password_hash
  const { password_hash, ...updatedUserInfo } = user;
  res.status(200).json({ message: 'User updated successfully', user: updatedUserInfo });
};
