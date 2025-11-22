export interface Reservation {
  id: string;
  caravan_id: string; // Changed to snake_case
  guest_id: string;   // Changed to snake_case
  start_date: string; // Changed to snake_case
  end_date: string;   // Changed to snake_case
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed' | 'cancelled';
  total_price: number; // Changed to snake_case
}
