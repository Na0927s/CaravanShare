export interface Reservation {
  id: string;
  caravanId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed';
  totalPrice: number;
}
