import { CaravanRepository } from '../../repositories/CaravanRepository';
import { Caravan } from '../../models/Caravan';
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

describe('CaravanRepository', () => {
  let caravanRepository: CaravanRepository;
  const expectedFilePath = `/mock/db/caravans.json`;

  beforeEach(() => {
    caravanRepository = new CaravanRepository();
    (fs.readFile as jest.Mock).mockReset();
    (fs.writeFile as jest.Mock).mockReset();
    (path.join as jest.Mock).mockClear();

    (fs.readFile as jest.Mock).mockResolvedValue('[]'); // Default to empty array
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create a new caravan', async () => {
    const newCaravan: Caravan = {
      id: 'c1',
      hostId: 'h1',
      name: 'Test Caravan',
      description: 'A lovely test caravan',
      location: 'Seoul',
      pricePerDay: 100000,
      capacity: 4,
      amenities: ['wifi', 'kitchen'],
      imageUrl: 'http://example.com/c1.jpg',
      status: 'available',
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const createdCaravan = await caravanRepository.create(newCaravan);

    expect(createdCaravan).toEqual(newCaravan);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([newCaravan], null, 2),
      'utf-8'
    );
  });

  it('should find a caravan by ID', async () => {
    const existingCaravan: Caravan = {
      id: 'c1',
      hostId: 'h1',
      name: 'Test Caravan',
      description: 'A lovely test caravan',
      location: 'Seoul',
      pricePerDay: 100000,
      capacity: 4,
      amenities: ['wifi', 'kitchen'],
      imageUrl: 'http://example.com/c1.jpg',
      status: 'available',
    };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingCaravan]));

    const foundCaravan = await caravanRepository.findById('c1');

    expect(foundCaravan).toEqual(existingCaravan);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should return undefined if caravan by ID is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const foundCaravan = await caravanRepository.findById('c99');

    expect(foundCaravan).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should update an existing caravan', async () => {
    const existingCaravan: Caravan = {
      id: 'c1',
      hostId: 'h1',
      name: 'Test Caravan',
      description: 'A lovely test caravan',
      location: 'Seoul',
      pricePerDay: 100000,
      capacity: 4,
      amenities: ['wifi', 'kitchen'],
      imageUrl: 'http://example.com/c1.jpg',
      status: 'available',
    };
    const updatedData = { name: 'Updated Caravan Name', pricePerDay: 120000 };
    const expectedCaravan = { ...existingCaravan, ...updatedData };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingCaravan]));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const updatedCaravan = await caravanRepository.update('c1', updatedData);

    expect(updatedCaravan).toEqual(expectedCaravan);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([expectedCaravan], null, 2),
      'utf-8'
    );
  });

  it('should return undefined if caravan to update is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const updatedCaravan = await caravanRepository.update('c99', { name: 'Nonexistent' });

    expect(updatedCaravan).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should delete an existing caravan', async () => {
    const existingCaravan: Caravan = {
      id: 'c1',
      hostId: 'h1',
      name: 'Test Caravan',
      description: 'A lovely test caravan',
      location: 'Seoul',
      pricePerDay: 100000,
      capacity: 4,
      amenities: ['wifi', 'kitchen'],
      imageUrl: 'http://example.com/c1.jpg',
      status: 'available',
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingCaravan]));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const isDeleted = await caravanRepository.delete('c1');

    expect(isDeleted).toBe(true);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([], null, 2),
      'utf-8'
    );
  });

  it('should return false if caravan to delete is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([{ id: 'c2', name: 'Other Caravan' } as Caravan]));

    const isDeleted = await caravanRepository.delete('c1');

    expect(isDeleted).toBe(false);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should return all caravans', async () => {
    const caravans: Caravan[] = [
      { id: 'c1', hostId: 'h1', name: 'C1', description: 'Desc1', location: 'Loc1', pricePerDay: 100, capacity: 2, amenities: [], imageUrl: 'url1', status: 'available' },
      { id: 'c2', hostId: 'h1', name: 'C2', description: 'Desc2', location: 'Loc2', pricePerDay: 200, capacity: 4, amenities: [], imageUrl: 'url2', status: 'reserved' },
    ];
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(caravans));

    const allCaravans = await caravanRepository.findAll();

    expect(allCaravans).toEqual(caravans);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });
});
