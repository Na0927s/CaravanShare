export interface Payment {
  id: string;
  reservation_id: string; // Changed from reservationId to reservation_id
  amount: number;
  payment_date: Date; // Changed from paymentDate: string to payment_date: Date
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string; // e.g., from payment gateway
  created_at: Date; // Added created_at
  updated_at: Date; // Added updated_at
}
