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
  findByHostId: jest.Mock; // Added findByHostId for getCaravansByHostId
};

const mockCaravanRepository: MockedCaravanRepository = {
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByHostId: jest.fn(), // Initialize mock for findByHostId
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
        { id: 'c1', host_id: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url1', status: 'available', created_at: new Date(), updated_at: new Date() },
        { id: 'c2', host_id: 'h1', name: 'Caravan 2', description: 'Desc 2', location: 'Loc 2', price_per_day: 200, capacity: 6, amenities: [], image_url: 'url2', status: 'reserved', created_at: new Date(), updated_at: new Date() },
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
      const mockCaravan: Caravan = { id: 'c1', host_id: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url1', status: 'available', created_at: new Date(), updated_at: new Date() };
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
    type CreateCaravanInput = Omit<Caravan, 'id' | 'status' | 'image_url' | 'created_at' | 'updated_at'> & { image_url?: string; status?: 'available' | 'reserved' | 'maintenance' };

    it('should create a new caravan successfully', async () => {
      const caravanData: CreateCaravanInput = {
        host_id: 'h1',
        name: 'New Caravan',
        description: 'New desc',
        location: 'New Loc',
        price_per_day: 150,
        capacity: 5,
        amenities: ['tv'],
        image_url: 'new_url', // Explicitly provide image_url
        // status is optional, so we can omit it or provide it
      };
      const newCaravan: Caravan = {
        id: 'mock-uuid',
        ...caravanData,
        status: caravanData.status || 'available', // Add default status
        image_url: caravanData.image_url || `https://via.placeholder.com/300x200.png?text=New+Caravan`, // Add default image_url
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      };
      mockCaravanRepository.create.mockResolvedValue(newCaravan);

      const created = await caravanService.createCaravan(caravanData);

      expect(global.crypto.randomUUID).toHaveBeenCalledTimes(1);
      expect(mockCaravanRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...caravanData,
        id: 'mock-uuid',
        status: 'available',
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      }));
      expect(created).toEqual(newCaravan);
    });

    it('should use default image URL if not provided', async () => {
      const caravanData: CreateCaravanInput = {
        host_id: 'h1',
        name: 'New Caravan',
        description: 'New desc',
        location: 'New Loc',
        price_per_day: 150,
        capacity: 5,
        amenities: ['tv'],
        // image_url is omitted here to test default generation
      };
      const expectedImage_url = `https://via.placeholder.com/300x200.png?text=New+Caravan`;
      const newCaravan: Caravan = {
        id: 'mock-uuid',
        ...caravanData,
        image_url: expectedImage_url, // Service adds default
        status: 'available', // Service adds default
        created_at: expect.any(Date),
        updated_at: expect.any(Date),
      };
      mockCaravanRepository.create.mockResolvedValue(newCaravan);

      const created = await caravanService.createCaravan(caravanData);

      expect(created.image_url).toEqual(expectedImage_url);
      expect(mockCaravanRepository.create).toHaveBeenCalledWith(expect.objectContaining({ image_url: expectedImage_url }));
    });

    it('should throw BadRequestError if required fields are missing', async () => {
      const baseCaravanData: Omit<CreateCaravanInput, 'created_at' | 'updated_at'> = {
        host_id: 'h1',
        name: 'Name',
        description: 'Desc',
        location: 'Loc',
        price_per_day: 100,
        capacity: 4,
        amenities: [],
        image_url: 'url',
      };
      await expect(caravanService.createCaravan({ ...baseCaravanData, capacity: undefined as any, price_per_day: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(caravanService.createCaravan({ ...baseCaravanData, name: undefined as any, price_per_day: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(caravanService.createCaravan({ ...baseCaravanData, host_id: undefined as any, price_per_day: undefined as any })).rejects.toThrow(BadRequestError);

      // Removed redundant price_per_day undefined in the following tests
      await expect(caravanService.createCaravan({ ...baseCaravanData, capacity: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(caravanService.createCaravan({ ...baseCaravanData, name: undefined as any })).rejects.toThrow(BadRequestError);
      await expect(caravanService.createCaravan({ ...baseCaravanData, host_id: undefined as any })).rejects.toThrow(BadRequestError);
    });


    it('should throw BadRequestError if status is invalid', async () => {
      const baseCaravanData: CreateCaravanInput = {
        host_id: 'h1',
        name: 'Name',
        description: 'Desc',
        location: 'Loc',
        price_per_day: 100,
        capacity: 4,
        amenities: [],
        image_url: 'url',
      };
      await expect(caravanService.createCaravan({ ...baseCaravanData, status: 'invalid' as any })).rejects.toThrow(BadRequestError);
    });
  });

  // --- updateCaravan tests ---
  describe('updateCaravan', () => {
    it('should update an existing caravan successfully', async () => {
      const existingCaravan: Caravan = { id: 'c1', host_id: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url1', status: 'available', created_at: new Date(), updated_at: new Date() };
      const updateData: Partial<Caravan> = { name: 'Updated Name', price_per_day: 120 };
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
      const existingCaravan: Caravan = { id: 'c1', host_id: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url1', status: 'available', created_at: new Date(), updated_at: new Date() };
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
      const existingCaravan: Caravan = { id: 'c1', host_id: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url1', status: 'available', created_at: new Date(), updated_at: new Date() };
      mockCaravanRepository.findById.mockResolvedValue(existingCaravan);
      mockCaravanRepository.delete.mockResolvedValue(false); // Simulate deletion failure

      await expect(caravanService.deleteCaravan('c1')).rejects.toThrow('Failed to delete caravan');
    });
  });

  // --- getCaravansByHostId tests ---
  describe('getCaravansByHostId', () => {
    it('should return caravans for a specific host ID', async () => {
      const mockCaravans: Caravan[] = [
        { id: 'c1', host_id: 'h1', name: 'Caravan 1', description: 'Desc 1', location: 'Loc 1', price_per_day: 100, capacity: 4, amenities: [], image_url: 'url1', status: 'available', created_at: new Date(), updated_at: new Date() },
        { id: 'c2', host_id: 'h2', name: 'Caravan 2', description: 'Desc 2', location: 'Loc 2', price_per_day: 200, capacity: 6, amenities: [], image_url: 'url2', status: 'reserved', created_at: new Date(), updated_at: new Date() },
        { id: 'c3', host_id: 'h1', name: 'Caravan 3', description: 'Desc 3', location: 'Loc 3', price_per_day: 300, capacity: 5, amenities: [], image_url: 'url3', status: 'available', created_at: new Date(), updated_at: new Date() },
      ];
      mockCaravanRepository.findByHostId.mockResolvedValue([mockCaravans[0], mockCaravans[2]]);

      const hostCaravans = await caravanService.getCaravansByHostId('h1');

      expect(mockCaravanRepository.findByHostId).toHaveBeenCalledTimes(1);
      expect(hostCaravans).toEqual([mockCaravans[0], mockCaravans[2]]);
    });

    it('should return an empty array if no caravans for the host ID are found', async () => {
      mockCaravanRepository.findByHostId.mockResolvedValue([]);

      const hostCaravans = await caravanService.getCaravansByHostId('h99');

      expect(mockCaravanRepository.findByHostId).toHaveBeenCalledTimes(1);
      expect(hostCaravans).toEqual([]);
    });
  });
});