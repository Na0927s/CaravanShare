export interface Reservation {
  id: string;
  caravan_id: string; // Changed from caravanId to caravan_id
  guest_id: string; // Changed from guestId to guest_id
  start_date: Date; // Changed from startDate: string to start_date: Date
  end_date: Date; // Changed from endDate: string to end_date: Date
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed' | 'cancelled';
  total_price: number; // Changed from totalPrice to total_price
  created_at: Date; // Added created_at
  updated_at: Date; // Added updated_at
}
