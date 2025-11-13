export interface Caravan {
  id: string;
  hostId: string;
  name: string;
  description: string;
  location: string;
  pricePerDay: number;
  capacity: number;
  amenities: string[];
  photos: string[];
  status: 'available' | 'booked' | 'maintenance';
  createdAt: string;
}
