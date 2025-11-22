import React, { useEffect, useState } from 'react';
import { Container, Alert, ListGroup, Card, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { Caravan } from '../models/Caravan';
import { User } from '../models/User';
import { Reservation as BackendReservation } from '../models/Reservation'; // Alias to avoid name conflict

// Define Payment interface based on backend entity, including nested reservation
interface Payment {
  id: string;
  reservation_id: string;
  reservation: BackendReservation; // Use the updated Reservation model for nested object
  amount: number;
  payment_date: string;
  status: 'pending' | 'completed' | 'failed';
  transaction_id: string;
  created_at: string;
  updated_at: string;
}

const PaymentHistoryPage = () => {
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const navigate = useNavigate();

  const { data: paymentHistory, loading: loadingHistory, error: errorHistory } = useFetch<Payment[]>( // Changed to Payment[]
    userInfo ? `/reservations/payment-history/${userInfo.id}` : null
  );
  const { data: caravans, loading: loadingCaravans, error: errorCaravans } = useFetch<Caravan[]>('/caravans');

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const getCaravanDetails = (caravanId: string) => {
    return caravans?.find(c => c.id === caravanId);
  };

  if (loadingHistory || loadingCaravans) {
    return <Container className="mt-5"><Spinner animation="border" /></Container>;
  }

  const pageError = errorHistory || errorCaravans;

  return (
    <Container className="mt-5">
      <h1>결제 내역</h1>
      {pageError && <Alert variant="danger">{pageError.message}</Alert>}

      {paymentHistory && paymentHistory.length === 0 ? (
        <Alert variant="info">결제 내역이 없습니다.</Alert>
      ) : paymentHistory ? (
        <ListGroup>
          {paymentHistory.map((payment) => { // Changed reservation to payment
            const caravan = getCaravanDetails(payment.reservation.caravan_id); // Access caravan_id via payment.reservation
            return (
              <ListGroup.Item key={payment.id} className="mb-3 border-0">
                <Card>
                  <Card.Body className="d-flex">
                    {caravan?.image_url && (
                      <img src={caravan.image_url} alt={caravan.name} style={{ width: '150px', height: '100px', objectFit: 'cover', marginRight: '20px' }} />
                    )}
                    <div>
                      <Card.Title>{caravan ? caravan.name : '알 수 없는 카라반'}</Card.Title>
                      <Card.Text as="div">
                        <small className="text-muted">
                          <strong>예약 ID:</strong> {payment.reservation.id.substring(0,8)}... {/* Access reservation ID via payment.reservation */}
                          <br />
                          <strong>날짜:</strong> {new Date(payment.reservation.start_date).toLocaleDateString()} ~ {new Date(payment.reservation.end_date).toLocaleDateString()} {/* Access dates via payment.reservation */}
                          <br />
                          <strong>결제 금액:</strong> {payment.amount.toLocaleString()} 원 {/* Access amount via payment.amount */}
                          <br />
                          <strong>결제 상태:</strong> {payment.status}
                          <br />
                          <strong>결제일:</strong> {new Date(payment.payment_date).toLocaleDateString()}
                        </small>
                      </Card.Text>
                    </div>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      ) : null}
    </Container>
  );
};

export default PaymentHistoryPage;
