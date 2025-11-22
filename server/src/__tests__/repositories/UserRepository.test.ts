import { UserRepository } from '../../repositories/UserRepository';
import { User } from '../../models/User';
import * as fs from 'fs/promises'; // Import fs/promises explicitly for type safety
import * as path from 'path'; // Import path explicitly

// Mock fs/promises and path module for isolated testing
jest.mock('fs/promises', () => ({
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

// Mock path module so that path.join returns predictable paths for testing.
// Specifically, for calls to path.join(dbDirectory, fileName), we want a consistent result.
// Since JsonFileRepository expects 'users.json' and utils.ts prepends the dbDirectory,
// we will mock path.join to simulate the correct full path.
jest.mock('path', () => ({
  __esModule: true, // This is important for ESM interop
  // Mock the default export for path module, often used as import path from 'path';
  default: {
    join: jest.fn((...args: string[]) => {
      // Simulate the full path that utils.ts would create:
      // /mock/db/fileName
      if (args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].endsWith('.json')) {
        return `/mock/db/${args[args.length - 1]}`;
      }
      return args.join('/'); // Fallback for other path.join calls if any
    }),
  },
  // If path is imported like import * as path from 'path';
  join: jest.fn((...args: string[]) => {
    if (args.length > 0 && typeof args[args.length - 1] === 'string' && args[args.length - 1].endsWith('.json')) {
      return `/mock/db/${args[args.length - 1]}`;
    }
    return args.join('/');
  }),
}));

describe('UserRepository', () => {
  let userRepository: UserRepository;
  const expectedFilePath = `/mock/db/users.json`; // Full mocked path for users.json

  beforeEach(() => {
    userRepository = new UserRepository();
    // Reset mocks before each test
    (fs.readFile as jest.Mock).mockReset();
    (fs.writeFile as jest.Mock).mockReset();
    (path.join as jest.Mock).mockClear(); // Clear path.join mock calls too

    // Default mock for readFile to return an empty array, unless specifically overridden
    (fs.readFile as jest.Mock).mockResolvedValue('[]');
  });

  afterAll(() => {
    jest.restoreAllMocks(); // Restore original mocks after all tests
  });

  it('should create a new user', async () => {
    const newUser: User = {
      id: '1',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      role: 'guest',
      createdAt: new Date().toISOString(),
      trustScore: 0,
    };

    // readFile mock for the first getAll call in create
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const createdUser = await userRepository.create(newUser);

    expect(createdUser).toEqual(newUser);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([newUser], null, 2),
      'utf-8'
    );
  });

  it('should find a user by ID', async () => {
    const existingUser: User = {
      id: '1',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      role: 'guest',
      createdAt: new Date().toISOString(),
      trustScore: 0,
    };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingUser]));

    const foundUser = await userRepository.findById('1');

    expect(foundUser).toEqual(existingUser);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should return undefined if user by ID is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const foundUser = await userRepository.findById('99');

    expect(foundUser).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should find a user by email', async () => {
    const existingUser: User = {
      id: '1',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      role: 'guest',
      createdAt: new Date().toISOString(),
      trustScore: 0,
    };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingUser]));

    const foundUser = await userRepository.findByEmail('test@example.com');

    expect(foundUser).toEqual(existingUser);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should return undefined if user by email is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const foundUser = await userRepository.findByEmail('nonexistent@example.com');

    expect(foundUser).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should update an existing user', async () => {
    const existingUser: User = {
      id: '1',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      role: 'guest',
      createdAt: new Date().toISOString(),
      trustScore: 0,
    };
    const updatedData = { name: 'Updated User Name', trustScore: 10 };
    const expectedUser = { ...existingUser, ...updatedData };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingUser])); // Read
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined); // Write

    const updatedUser = await userRepository.update('1', updatedData);

    expect(updatedUser).toEqual(expectedUser);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([expectedUser], null, 2),
      'utf-8'
    );
  });

  it('should return undefined if user to update is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const updatedUser = await userRepository.update('99', { name: 'Nonexistent' });

    expect(updatedUser).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled(); // Should not write if not found
  });

  it('should delete an existing user', async () => {
    const existingUser: User = {
      id: '1',
      email: 'test@example.com',
      password_hash: 'hashed_password',
      name: 'Test User',
      role: 'guest',
      createdAt: new Date().toISOString(),
      trustScore: 0,
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingUser])); // Read
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined); // Write

    const isDeleted = await userRepository.delete('1');

    expect(isDeleted).toBe(true);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([], null, 2), // Should write an empty array
      'utf-8'
    );
  });

  it('should return false if user to delete is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([{ id: '2', email: 'other@example.com' } as User]));

    const isDeleted = await userRepository.delete('1');

    expect(isDeleted).toBe(false);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled(); // Should not write if not found
  });

  it('should return all users', async () => {
    const users: User[] = [
      { id: '1', email: 'test1@example.com', password_hash: 'hashed1', name: 'User1', role: 'guest', createdAt: new Date().toISOString(), trustScore: 0 },
      { id: '2', email: 'test2@example.com', password_hash: 'hashed2', name: 'User2', role: 'host', createdAt: new Date().toISOString(), trustScore: 0 },
    ];
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(users));

    const allUsers = await userRepository.findAll();

    expect(allUsers).toEqual(users);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });
});
