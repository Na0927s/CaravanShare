export interface Review {
  id: string;
  caravan_id: string; // Changed to snake_case
  guest_id: string;   // Changed to snake_case
  rating: number;
  comment: string;
  created_at: string; // Changed to snake_case
}
