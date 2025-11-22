import { Observer, Subject } from '../utils/ObserverPattern';

// Define the type of events our NotificationService will handle
interface ReservationEvent {
  type: 'status_change' | 'new_reservation' | 'payment_confirmed';
  reservationId: string;
  userId?: string; // Guest or Host ID
  newStatus?: string;
  message?: string;
}

export class NotificationService implements Observer<ReservationEvent> {
  private notifications: string[] = []; // Simple in-memory storage for notifications

  update(subject: Subject<ReservationEvent>, event: ReservationEvent): void {
    const timestamp = new Date().toISOString();
    let notificationMessage: string;

    switch (event.type) {
      case 'status_change':
        notificationMessage = `[${timestamp}] 예약 ID ${event.reservationId}의 상태가 ${event.newStatus}로 변경되었습니다.`;
        break;
      case 'new_reservation':
        notificationMessage = `[${timestamp}] 새로운 예약이 접수되었습니다. 예약 ID: ${event.reservationId}.`;
        break;
      case 'payment_confirmed':
        notificationMessage = `[${timestamp}] 예약 ID ${event.reservationId}에 대한 결제가 확인되었습니다.`;
        break;
      default:
        notificationMessage = `[${timestamp}] 알 수 없는 이벤트: ${event.type} (예약 ID: ${event.reservationId})`;
    }
    this.notifications.push(notificationMessage);
    console.log(`[NotificationService] ${notificationMessage}`); // For demonstration
    // In a real application, this would send an email, push notification, etc.
  }

  getNotifications(): string[] {
    return this.notifications;
  }
}
