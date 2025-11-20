import React, { useEffect, useState } from 'react';
import { Container, Alert, ListGroup, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface Reservation {
  id: string;
  caravanId: string;
  guestId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed';
  totalPrice: number;
}

interface Caravan {
  id: string;
  name: string;
  imageUrl: string;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'host' | 'guest';
}

const PaymentHistoryPage = () => {
  const [paymentHistory, setPaymentHistory] = useState<Reservation[]>([]);
  const [caravans, setCaravans] = useState<Caravan[]>([]); // To get caravan names and images
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    } else {
      navigate('/login');
      return;
    }

    const fetchPaymentHistory = async (userId: string) => {
      try {
        const response = await fetch(`http://localhost:3001/api/reservations/payment-history/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment history.');
        }
        const data: Reservation[] = await response.json();
        setPaymentHistory(data);
      } catch (err: any) {
        setError(err.message || 'Error fetching payment history.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCaravans = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/caravans');
        if (!response.ok) {
          throw new Error('Failed to fetch caravan data.');
        }
        const data: Caravan[] = await response.json();
        setCaravans(data);
      } catch (err: any) {
        console.error('Error fetching caravans:', err);
        // Don't set error state for caravans, just log it
      }
    };

    if (userInfo?.id) {
      fetchPaymentHistory(userInfo.id);
      fetchCaravans();
    }
  }, [userInfo, navigate]);

  const getCaravanDetails = (caravanId: string) => {
    return caravans.find(c => c.id === caravanId);
  };

  if (loading) {
    return <Container className="mt-5">Loading payment history...</Container>;
  }

  return (
    <Container className="mt-5">
      <h1>Payment History</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      {paymentHistory.length === 0 ? (
        <Alert variant="info">No payment history found.</Alert>
      ) : (
        <ListGroup>
          {paymentHistory.map((reservation) => {
            const caravan = getCaravanDetails(reservation.caravanId);
            return (
              <ListGroup.Item key={reservation.id} className="mb-3">
                <Card>
                  <Card.Body>
                    <Card.Title>{caravan ? caravan.name : 'Unknown Caravan'}</Card.Title>
                    {caravan?.imageUrl && (
                      <Card.Img variant="top" src={caravan.imageUrl} style={{ height: '100px', objectFit: 'cover', marginBottom: '10px' }} />
                    )}
                    <Card.Text>
                      <strong>Reservation ID:</strong> {reservation.id}
                      <br />
                      <strong>Dates:</strong> {reservation.startDate} to {reservation.endDate}
                      <br />
                      <strong>Total Price:</strong> {reservation.totalPrice.toLocaleString()} KRW
                      <br />
                      <strong>Status:</strong> {reservation.status}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </Container>
  );
};

export default PaymentHistoryPage;
