export interface Caravan {
  id: string;
  host_id: string; // Changed from hostId to host_id
  name:string;
  description: string;
  location: string;
  price_per_day: number; // Changed from pricePerDay to price_per_day
  capacity: number;
  amenities: string[];
  image_url: string; // Changed from imageUrl to image_url
  status: 'available' | 'reserved' | 'maintenance';
  created_at: Date; // Added created_at
  updated_at: Date; // Added updated_at
}
