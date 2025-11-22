export interface Caravan {
  id: string;
  host_id: string; // Changed to snake_case
  name: string;
  description: string;
  location: string;
  price_per_day: number; // Changed to snake_case
  capacity: number;
  amenities: string[];
  image_url: string; // Changed to snake_case
  status: 'available' | 'reserved' | 'maintenance'; // Add status field
}
