import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';

interface Reservation {
  id: string;
  caravanId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment' | 'confirmed';
  totalPrice: number;
}

const PaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState<boolean>(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        // This is a bit of a workaround as we don't have a getReservationById endpoint yet.
        // We fetch all reservations for the user and find the one with the matching id.
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
          throw new Error('You must be logged in to make a payment.');
        }
        const guestId = JSON.parse(storedUserInfo).id;
        const response = await fetch(`http://localhost:3001/api/reservations/my-reservations?guestId=${guestId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Reservation[] = await response.json();
        const currentReservation = data.find(r => r.id === id);
        if (currentReservation) {
          setReservation(currentReservation);
        } else {
          throw new Error('Reservation not found.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id]);

  const handleConfirmPayment = async () => {
    setPaying(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/reservations/${id}/pay`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Payment failed');
      }

      alert('Payment successful! Your reservation is confirmed.');
      navigate('/my-reservations');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!reservation) {
    return <Alert variant="warning">Reservation not found.</Alert>;
  }

  return (
    <div className="container mt-4">
      <h1>Confirm Your Payment</h1>
      <Card>
        <Card.Header as="h5">Reservation Details</Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>Reservation ID:</strong> {reservation.id}
          </Card.Text>
          <Card.Text>
            <strong>Caravan ID:</strong> {reservation.caravanId}
          </Card.Text>
          <Card.Text>
            <strong>Dates:</strong> {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
          </Card.Text>
          <Card.Title>
            Total Price: {reservation.totalPrice.toLocaleString()} KRW
          </Card.Title>
          {reservation.status === 'awaiting_payment' ? (
            <Button onClick={handleConfirmPayment} disabled={paying}>
              {paying ? <Spinner as="span" animation="border" size="sm" /> : 'Confirm Payment'}
            </Button>
          ) : (
            <Alert variant="info">This reservation does not require payment at this time. Current status: {reservation.status}</Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentPage;
