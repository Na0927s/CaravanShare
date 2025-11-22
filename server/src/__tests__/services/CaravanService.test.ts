import { CaravanService } from '../../services/CaravanService';
import { CaravanRepository } from '../../repositories/CaravanRepository';
import { Caravan } from '../../models/Caravan';
import { BadRequestError, NotFoundError } from '../../exceptions';

// Define a type for the mocked CaravanRepository
type MockedCaravanRepository = {
  findById: jest.Mock;
  findAll: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
};

const mockCaravanRepository: MockedCaravanRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

// Mock crypto.randomUUID (part of globalThis)
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'mock-uuid'),
  },
  writable: true,
});

describe('CaravanService', () => {
  let caravanService: CaravanService;

  beforeEach(() => {
    caravanService = new CaravanService(mockCaravanRepository as unknown as CaravanRepository);
    jest.clearAllMocks();
    (global.crypto.randomUUID as jest.Mock).mockClear();
    (global.crypto.randomUUID as jest.Mock).mockImplementation(() => 'mock-uuid');
  });

  // --- getCaravans tests ---
  describe('getCaravans', () => {
    it('should return all caravans', async () => {
      const mockCaravans: Caravan[] = [
        { id: 'c1', hostId: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url1', status: 'available' },
        { id: 'c2', hostId: 'h1', name: 'Caravan 2', description: 'Desc 2', location: 'Loc 2', pricePerDay: 200, capacity: 6, amenities: [], imageUrl: 'url2', status: 'reserved' },
      ];
      mockCaravanRepository.findAll.mockResolvedValue(mockCaravans);

      const caravans = await caravanService.getCaravans();

      expect(mockCaravanRepository.findAll).toHaveBeenCalledTimes(1);
      expect(caravans).toEqual(mockCaravans);
    });
  });

  // --- getCaravanById tests ---
  describe('getCaravanById', () => {
    it('should return a caravan by ID', async () => {
      const mockCaravan: Caravan = { id: 'c1', hostId: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url1', status: 'available' };
      mockCaravanRepository.findById.mockResolvedValue(mockCaravan);

      const caravan = await caravanService.getCaravanById('c1');

      expect(mockCaravanRepository.findById).toHaveBeenCalledWith('c1');
      expect(caravan).toEqual(mockCaravan);
    });

    it('should throw BadRequestError if ID is missing', async () => {
      await expect(caravanService.getCaravanById('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if caravan is not found', async () => {
      mockCaravanRepository.findById.mockResolvedValue(undefined);

      await expect(caravanService.getCaravanById('c99')).rejects.toThrow(NotFoundError);
    });
  });

  // --- createCaravan tests ---
  describe('createCaravan', () => {
    // Define a type for the input to createCaravan, matching the service method's signature
    type CreateCaravanInput = Omit<Caravan, 'id' | 'status' | 'imageUrl'> & { imageUrl?: string; status?: 'available' | 'reserved' | 'maintenance' };

    it('should create a new caravan successfully', async () => {
      const caravanData: CreateCaravanInput = {
        hostId: 'h1',
        name: 'New Caravan',
        description: 'New desc',
        location: 'New Loc',
        pricePerDay: 150,
        capacity: 5,
        amenities: ['tv'],
        imageUrl: 'new_url', // Explicitly provide imageUrl
        // status is optional, so we can omit it or provide it
      };
      const newCaravan: Caravan = {
        id: 'mock-uuid',
        ...caravanData,
        status: caravanData.status || 'available', // Add default status
        imageUrl: caravanData.imageUrl || `https://via.placeholder.com/300x200.png?text=New+Caravan`, // Add default imageUrl
      };
      mockCaravanRepository.create.mockResolvedValue(newCaravan);

      const created = await caravanService.createCaravan(caravanData);

      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(mockCaravanRepository.create).toHaveBeenCalledWith(newCaravan);
      expect(created).toEqual(newCaravan);
    });

    it('should use default image URL if not provided', async () => {
      const caravanData: CreateCaravanInput = {
        hostId: 'h1',
        name: 'New Caravan',
        description: 'New desc',
        location: 'New Loc',
        pricePerDay: 150,
        capacity: 5,
        amenities: ['tv'],
        // imageUrl is omitted here to test default generation
      };
      const expectedImageUrl = `https://via.placeholder.com/300x200.png?text=New+Caravan`;
      const newCaravan: Caravan = {
        id: 'mock-uuid',
        ...caravanData,
        imageUrl: expectedImageUrl, // Service adds default
        status: 'available', // Service adds default
      };
      mockCaravanRepository.create.mockResolvedValue(newCaravan);

      const created = await caravanService.createCaravan(caravanData);

      expect(created.imageUrl).toEqual(expectedImageUrl);
      expect(mockCaravanRepository.create).toHaveBeenCalledWith(expect.objectContaining({ imageUrl: expectedImageUrl }));
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      const baseCaravanData: CreateCaravanInput = {
        hostId: 'h1',
        name: 'Name',
        description: 'Desc',
        location: 'Loc',
        pricePerDay: 100,
        capacity: 4,
        amenities: [],
        imageUrl: 'url',
      };
      await expect(caravanService.createCaravan({ ...baseCaravanData, capacity: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(caravanService.createCaravan({ ...baseCaravanData, name: undefined as any })).rejects.toThrow(BadRequestError);
      // Add more checks for other missing required fields if needed
    });

    it('should throw BadRequestError if status is invalid', async () => {
      const baseCaravanData: CreateCaravanInput = {
        hostId: 'h1',
        name: 'Name',
        description: 'Desc',
        location: 'Loc',
        pricePerDay: 100,
        capacity: 4,
        amenities: [],
        imageUrl: 'url',
      };
      await expect(caravanService.createCaravan({ ...baseCaravanData, status: 'invalid' as any })).rejects.toThrow(BadRequestError);
    });
  });

  // --- updateCaravan tests ---
  describe('updateCaravan', () => {
    it('should update an existing caravan successfully', async () => {
      const existingCaravan: Caravan = { id: 'c1', hostId: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url1', status: 'available' };
      const updateData: Partial<Caravan> = { name: 'Updated Name', pricePerDay: 120 };
      const updatedCaravan: Caravan = { ...existingCaravan, ...updateData };

      mockCaravanRepository.findById.mockResolvedValue(existingCaravan);
      mockCaravanRepository.update.mockResolvedValue(updatedCaravan);

      const result = await caravanService.updateCaravan('c1', updateData);

      expect(mockCaravanRepository.findById).toHaveBeenCalledWith('c1');
      expect(mockCaravanRepository.update).toHaveBeenCalledWith('c1', updateData);
      expect(result).toEqual(updatedCaravan);
    });

    it('should throw BadRequestError if ID is missing', async () => {
      await expect(caravanService.updateCaravan('', { name: 'Name' })).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if status is invalid', async () => {
      await expect(caravanService.updateCaravan('c1', { status: 'invalid' as any })).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if caravan to update is not found', async () => {
      mockCaravanRepository.findById.mockResolvedValue(undefined);

      await expect(caravanService.updateCaravan('c99', { name: 'Name' })).rejects.toThrow(NotFoundError);
    });
  });

  // --- deleteCaravan tests ---
  describe('deleteCaravan', () => {
    it('should delete an existing caravan successfully', async () => {
      const existingCaravan: Caravan = { id: 'c1', hostId: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url1', status: 'available' };
      mockCaravanRepository.findById.mockResolvedValue(existingCaravan);
      mockCaravanRepository.delete.mockResolvedValue(true);

      await caravanService.deleteCaravan('c1');

      expect(mockCaravanRepository.findById).toHaveBeenCalledWith('c1');
      expect(mockCaravanRepository.delete).toHaveBeenCalledWith('c1');
    });

    it('should throw BadRequestError if ID is missing', async () => {
      await expect(caravanService.deleteCaravan('')).rejects.toThrow(BadRequestError);
    });

    it('should throw NotFoundError if caravan to delete is not found', async () => {
      mockCaravanRepository.findById.mockResolvedValue(undefined);

      await expect(caravanService.deleteCaravan('c99')).rejects.toThrow(NotFoundError);
    });

    it('should throw Error if deletion fails', async () => {
      const existingCaravan: Caravan = { id: 'c1', hostId: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url1', status: 'available' };
      mockCaravanRepository.findById.mockResolvedValue(existingCaravan);
      mockCaravanRepository.delete.mockResolvedValue(false); // Simulate deletion failure

      await expect(caravanService.deleteCaravan('c1')).rejects.toThrow('Failed to delete caravan');
    });
  });

  // --- getCaravansByHostId tests ---
  describe('getCaravansByHostId', () => {
    it('should return caravans for a specific host ID', async () => {
      const mockCaravans: Caravan[] = [
        { id: 'c1', hostId: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', pricePerDay: 100, capacity: 4, amenities: [], imageUrl: 'url1', status: 'available' },
        { id: 'c2', hostId: 'h2', name: 'Caravan 2', description: 'Desc 2', location: 'Loc 2', pricePerDay: 200, capacity: 6, amenities: [], imageUrl: 'url2', status: 'reserved' },
        { id: 'c3', hostId: 'h1', name: 'Caravan 3', description: 'Desc 3', location: 'Loc 3', pricePerDay: 300, capacity: 5, amenities: [], imageUrl: 'url3', status: 'available' },
      ];
      mockCaravanRepository.findAll.mockResolvedValue(mockCaravans);

      const hostCaravans = await caravanService.getCaravansByHostId('h1');

      expect(mockCaravanRepository.findAll).toHaveBeenCalledTimes(1);
      expect(hostCaravans).toEqual([mockCaravans[0], mockCaravans[2]]);
    });

    it('should return an empty array if no caravans for the host ID are found', async () => {
      mockCaravanRepository.findAll.mockResolvedValue([]);

      const hostCaravans = await caravanService.getCaravansByHostId('h99');

      expect(mockCaravanRepository.findAll).toHaveBeenCalledTimes(1);
      expect(hostCaravans).toEqual([]);
    });
  });
});
