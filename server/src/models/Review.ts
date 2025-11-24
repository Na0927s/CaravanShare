export interface Review {
  id: string;
  caravan_id: string; // Changed from caravanId to caravan_id
  guest_id: string; // Changed from guestId to guest_id
  rating: number;
  comment: string;
  created_at: Date; // Changed from createdAt: string to created_at: Date
  updated_at: Date; // Added updated_at
}
