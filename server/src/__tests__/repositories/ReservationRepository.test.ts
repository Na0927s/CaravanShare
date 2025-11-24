import { ReservationRepository } from '../../repositories/ReservationRepository';
import { Reservation } from '../../models/Reservation';
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

describe('ReservationRepository', () => {
  let reservationRepository: ReservationRepository;
  const expectedFilePath = `/mock/db/reservations.json`;

  beforeEach(() => {
    reservationRepository = new ReservationRepository();
    (fs.readFile as jest.Mock).mockReset();
    (fs.writeFile as jest.Mock).mockReset();
    (path.join as jest.Mock).mockClear();

    (fs.readFile as jest.Mock).mockResolvedValue('[]'); // Default to empty array
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should create a new reservation', async () => {
    const newReservation: Reservation = {
      id: 'r1',
      caravan_id: 'c1',
      guest_id: 'g1',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-05'),
      status: 'pending',
      total_price: 500000,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const createdReservation = await reservationRepository.create(newReservation);

    expect(createdReservation).toEqual(newReservation);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([newReservation], null, 2),
      'utf-8'
    );
  });

  it('should find a reservation by ID', async () => {
    const existingReservation: Reservation = {
      id: 'r1',
      caravan_id: 'c1',
      guest_id: 'g1',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-05'),
      status: 'pending',
      total_price: 500000,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingReservation]));

    const foundReservation = await reservationRepository.findById('r1');

    expect(foundReservation).toEqual(existingReservation);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should return undefined if reservation by ID is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const foundReservation = await reservationRepository.findById('r99');

    expect(foundReservation).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  it('should update an existing reservation', async () => {
    const existingReservation: Reservation = {
      id: 'r1',
      caravan_id: 'c1',
      guest_id: 'g1',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-05'),
      status: 'pending',
      total_price: 500000,
      created_at: new Date(),
      updated_at: new Date(),
    };
    const updatedData: Partial<Reservation> = { status: 'approved', total_price: 400000 };
    const expectedReservation = { ...existingReservation, ...updatedData };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingReservation]));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const updatedReservation = await reservationRepository.update('r1', updatedData);

    expect(updatedReservation).toEqual(expectedReservation);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([expectedReservation], null, 2),
      'utf-8'
    );
  });

  it('should return undefined if reservation to update is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce('[]');

    const updatedReservation = await reservationRepository.update('r99', { status: 'approved' });

    expect(updatedReservation).toBeUndefined();
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should delete an existing reservation', async () => {
    const existingReservation: Reservation = {
      id: 'r1',
      caravan_id: 'c1',
      guest_id: 'g1',
      start_date: new Date('2025-01-01'),
      end_date: new Date('2025-01-05'),
      status: 'pending',
      total_price: 500000,
      created_at: new Date(),
      updated_at: new Date(),
    };

    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([existingReservation]));
    (fs.writeFile as jest.Mock).mockResolvedValue(undefined);

    const isDeleted = await reservationRepository.delete('r1');

    expect(isDeleted).toBe(true);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).toHaveBeenCalledWith(
      expectedFilePath,
      JSON.stringify([], null, 2),
      'utf-8'
    );
  });

  it('should return false if reservation to delete is not found', async () => {
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify([{ id: 'r2', caravan_id: 'c2' } as Reservation]));

    const isDeleted = await reservationRepository.delete('r1');

    expect(isDeleted).toBe(false);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should return all reservations', async () => {
    const reservations: Reservation[] = [
      { id: 'r1', caravan_id: 'c1', guest_id: 'g1', start_date: new Date('2025-01-01'), end_date: new Date('2025-01-05'), status: 'pending', total_price: 500000, created_at: new Date(), updated_at: new Date() },
      { id: 'r2', caravan_id: 'c2', guest_id: 'g2', start_date: new Date('2025-02-01'), end_date: new Date('2025-02-05'), status: 'approved', total_price: 400000, created_at: new Date(), updated_at: new Date() },
    ];
    (fs.readFile as jest.Mock).mockResolvedValueOnce(JSON.stringify(reservations));

    const allReservations = await reservationRepository.findAll();

    expect(allReservations).toEqual(reservations);
    expect(fs.readFile).toHaveBeenCalledWith(expectedFilePath, 'utf-8');
  });

  describe('findOverlappingReservations', () => {
    const caravan_id = 'c1';
    const existingReservations: Reservation[] = [
      { id: 'r1', caravan_id: 'c1', guest_id: 'g1', start_date: new Date('2025-01-05'), end_date: new Date('2025-01-10'), status: 'confirmed', total_price: 500000, created_at: new Date(), updated_at: new Date() },
      { id: 'r2', caravan_id: 'c1', guest_id: 'g2', start_date: new Date('2025-01-12'), end_date: new Date('2025-01-15'), status: 'pending', total_price: 500000, created_at: new Date(), updated_at: new Date() },
      { id: 'r3', caravan_id: 'c2', guest_id: 'g1', start_date: new Date('2025-01-01'), end_date: new Date('2025-01-03'), status: 'confirmed', total_price: 300000, created_at: new Date(), updated_at: new Date() }, // Different caravan
      { id: 'r4', caravan_id: 'c1', guest_id: 'g3', start_date: new Date('2025-01-01'), end_date: new Date('2025-01-03'), status: 'rejected', total_price: 100000, created_at: new Date(), updated_at: new Date() }, // Rejected status
    ];

    beforeEach(() => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(existingReservations));
    });

    it('should find overlapping reservations (start date within existing)', async () => {
      const newStartDate = new Date('2025-01-07');
      const newEndDate = new Date('2025-01-11');
      const overlapping = await reservationRepository.findOverlappingReservations(caravan_id, newStartDate, newEndDate);
      expect(overlapping).toEqual([existingReservations[0]]);
    });

    it('should find overlapping reservations (end date within existing)', async () => {
      const newStartDate = new Date('2025-01-03');
      const newEndDate = new Date('2025-01-07');
      const overlapping = await reservationRepository.findOverlappingReservations(caravan_id, newStartDate, newEndDate);
      expect(overlapping).toEqual([existingReservations[0]]);
    });

    it('should find overlapping reservations (new reservation encompasses existing)', async () => {
      const newStartDate = new Date('2025-01-01');
      const newEndDate = new Date('2025-01-20');
      const overlapping = await reservationRepository.findOverlappingReservations(caravan_id, newStartDate, newEndDate);
      expect(overlapping).toEqual([existingReservations[0], existingReservations[1]]);
    });

    it('should find overlapping reservations (existing reservation encompasses new)', async () => {
      const newStartDate = new Date('2025-01-06');
      const newEndDate = new Date('2025-01-09');
      const overlapping = await reservationRepository.findOverlappingReservations(caravan_id, newStartDate, newEndDate);
      expect(overlapping).toEqual([existingReservations[0]]);
    });

    it('should not find overlapping reservations if dates do not overlap', async () => {
      const newStartDate = new Date('2025-01-16');
      const newEndDate = new Date('2025-01-20');
      const overlapping = await reservationRepository.findOverlappingReservations(caravan_id, newStartDate, newEndDate);
      expect(overlapping).toEqual([]);
    });

    it('should not find overlapping reservations for different caravanId', async () => {
      const newStartDate = new Date('2025-01-01');
      const newEndDate = new Date('2025-01-05');
      const overlapping = await reservationRepository.findOverlappingReservations('c99', newStartDate, newEndDate);
      expect(overlapping).toEqual([]);
    });

    it('should not find overlapping reservations with rejected status', async () => {
      const newStartDate = new Date('2025-01-02');
      const newEndDate = new Date('2025-01-03');
      const overlapping = await reservationRepository.findOverlappingReservations(caravan_id, newStartDate, newEndDate);
      expect(overlapping).toEqual([]); // r4 is rejected
    });
  });

  describe('findByGuestId', () => {
    const guest_id = 'g1';
    const otherGuestId = 'g2';
    const allReservations: Reservation[] = [
      { id: 'r1', caravan_id: 'c1', guest_id: 'g1', start_date: new Date('2025-01-01'), end_date: new Date('2025-01-05'), status: 'pending', total_price: 500000, created_at: new Date(), updated_at: new Date() },
      { id: 'r2', caravan_id: 'c2', guest_id: 'g2', start_date: new Date('2025-02-01'), end_date: new Date('2025-02-05'), status: 'approved', total_price: 400000, created_at: new Date(), updated_at: new Date() },
      { id: 'r3', caravan_id: 'c3', guest_id: 'g1', start_date: new Date('2025-03-01'), end_date: new Date('2025-03-05'), status: 'confirmed', total_price: 600000, created_at: new Date(), updated_at: new Date() },
    ];

    beforeEach(() => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(allReservations));
    });

    it('should return reservations for a specific guest ID', async () => {
      const guestReservations = await reservationRepository.findByGuestId(guest_id);
      expect(guestReservations).toEqual([allReservations[0], allReservations[2]]);
    });

    it('should return an empty array if no reservations for the guest ID are found', async () => {
      const guestReservations = await reservationRepository.findByGuestId('g99');
      expect(guestReservations).toEqual([]);
    });
  });

  describe('findByCaravanIds', () => {
    const caravanIds = ['c1', 'c3'];
    const allReservations: Reservation[] = [
      { id: 'r1', caravan_id: 'c1', guest_id: 'g1', start_date: new Date('2025-01-01'), end_date: new Date('2025-01-05'), status: 'pending', total_price: 500000, created_at: new Date(), updated_at: new Date() },
      { id: 'r2', caravan_id: 'c2', guest_id: 'g2', start_date: new Date('2025-02-01'), end_date: new Date('2025-02-05'), status: 'approved', total_price: 400000, created_at: new Date(), updated_at: new Date() },
      { id: 'r3', caravan_id: 'c3', guest_id: 'g1', start_date: new Date('2025-03-01'), end_date: new Date('2025-03-05'), status: 'confirmed', total_price: 600000, created_at: new Date(), updated_at: new Date() },
    ];

    beforeEach(() => {
      (fs.readFile as jest.Mock).mockResolvedValue(JSON.stringify(allReservations));
    });

    it('should return reservations for specific caravan IDs', async () => {
      const caravanReservations = await reservationRepository.findByCaravanIds(caravanIds);
      expect(caravanReservations).toEqual([allReservations[0], allReservations[2]]);
    });

    it('should return an empty array if no reservations for the caravan IDs are found', async () => {
      const caravanReservations = await reservationRepository.findByCaravanIds(['c99']);
      expect(caravanReservations).toEqual([]);
    });
  });
});