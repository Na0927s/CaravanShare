export interface Payment {
  id: string;
  reservationId: string;
  amount: number;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string; // e.g., from payment gateway
}
